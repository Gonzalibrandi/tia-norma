// La conversación entre Norma y su página.
//
// Cada mensaje entra por procesar() y devuelve las respuestas a mostrar.
// La conversación recuerda en qué "paso" está:
//   confirmar -> hay un borrador armado y falta que Norma diga Sí o No
//   datos     -> falta el nombre, el precio o los dos
//   foto      -> Norma escribió una pieza nueva y falta la foto
//   venta     -> falta confirmar que una pieza se vendió
//   repaso    -> repaso semanal, pieza por pieza
//
// Todas las funciones reciben primero la tienda sobre la que trabajan.

import * as almacen from './almacen';
import { guardarFoto } from './fotos';
import { leerCartelito } from './lector';
import { mensajes, BOTONES_SI_NO } from './mensajes';
import { esNo, esSi, interpretarDatos, normalizar } from './texto';

export async function procesar({ tienda, texto, foto, accion }) {
  const conversacion = await almacen.leerConversacion(tienda);

  let resultado;
  if (accion === 'repaso') resultado = await empezarRepaso(tienda);
  else if (foto) resultado = await recibirFoto(tienda, conversacion, foto);
  else resultado = await recibirTexto(tienda, conversacion, texto ?? '');

  await almacen.guardarConversacion(tienda, resultado.conversacion);
  return { respuestas: resultado.respuestas, huboCambios: Boolean(resultado.huboCambios) };
}

// Al abrir el chat de nuevo, la conversación arranca de cero (las piezas no se tocan).
export function olvidarConversacion(tienda) {
  return almacen.guardarConversacion(tienda, {});
}

// --- Helpers de respuesta ---

function responder(conversacion, ...respuestas) {
  return {
    conversacion,
    respuestas: respuestas.map((r) => (typeof r === 'string' ? { texto: r } : r)),
  };
}

function preguntar(texto) {
  return { texto, botones: BOTONES_SI_NO };
}

async function piezasDisponibles(tienda) {
  return (await almacen.listarPiezas(tienda)).filter((p) => p.estado === 'disponible');
}

// --- Fotos ---

async function recibirFoto(tienda, conversacion, foto) {
  const [url, lectura] = await Promise.all([
    guardarFoto(tienda, foto.buffer, foto.tipo),
    // Si no se pudo leer el cartelito, se le piden los datos a Norma.
    conversacion.paso === 'foto' ? null : leerCartelito(foto.buffer, foto.tipo).catch(() => null),
  ]);

  // Norma ya había escrito el nombre y el precio: solo faltaba la foto.
  if (conversacion.paso === 'foto') {
    return proponer(tienda, { ...conversacion.borrador, foto: url });
  }

  const borrador = {
    foto: url,
    nombre: lectura?.nombre ?? null,
    precio: lectura?.precio ?? null,
  };
  return completar(tienda, borrador, mensajes.noPudeLeer);
}

// Si el borrador está completo lo propone; si no, pide lo que falta.
function completar(tienda, borrador, mensajeSiNoHayNada) {
  if (borrador.nombre && borrador.precio) return proponer(tienda, borrador);

  let pedido = mensajeSiNoHayNada;
  if (borrador.nombre) pedido = mensajes.faltaPrecio(borrador.nombre);
  else if (borrador.precio) pedido = mensajes.faltaNombre(borrador.precio);

  return responder({ paso: 'datos', borrador }, pedido);
}

async function proponer(tienda, borrador) {
  const clave = normalizar(borrador.nombre);
  const existente = (await piezasDisponibles(tienda)).find((p) => normalizar(p.nombre) === clave);

  if (!existente) {
    if (!borrador.foto) {
      return responder({ paso: 'foto', borrador }, mensajes.faltaFoto(borrador.nombre));
    }
    return responder(
      { paso: 'confirmar', borrador: { ...borrador, piezaId: null } },
      preguntar(mensajes.proponerNueva(borrador.nombre, borrador.precio)),
    );
  }

  const conversacion = { paso: 'confirmar', borrador: { ...borrador, piezaId: existente.id } };

  if (borrador.foto) {
    return responder(
      conversacion,
      preguntar(mensajes.proponerCambio(existente.nombre, existente.precio, borrador.precio)),
    );
  }
  if (existente.precio === borrador.precio) {
    return responder({}, mensajes.mismoPrecio(existente.nombre, existente.precio));
  }
  return responder(
    conversacion,
    preguntar(mensajes.proponerPrecio(existente.nombre, existente.precio, borrador.precio)),
  );
}

async function publicar(tienda, borrador) {
  if (borrador.piezaId) {
    const cambios = { precio: borrador.precio };
    if (borrador.foto) cambios.foto = borrador.foto;
    const pieza = await almacen.actualizarPieza(tienda, borrador.piezaId, cambios);
    if (pieza) return { ...responder({}, mensajes.actualizada(pieza.nombre)), huboCambios: true };
  }

  const pieza = await almacen.crearPieza(tienda, borrador);
  return { ...responder({}, mensajes.publicada(pieza.nombre)), huboCambios: true };
}

// --- Texto ---

async function recibirTexto(tienda, conversacion, texto) {
  switch (conversacion.paso) {
    case 'confirmar':
      return responderConfirmacion(tienda, conversacion, texto);
    case 'datos':
      return responderDatos(tienda, conversacion, texto);
    case 'venta':
      return responderVenta(tienda, conversacion, texto);
    case 'repaso':
      return responderRepaso(tienda, conversacion, texto);
    default:
      return textoLibre(tienda, texto);
  }
}

async function responderConfirmacion(tienda, conversacion, texto) {
  const { borrador } = conversacion;

  if (esSi(texto)) return publicar(tienda, borrador);

  if (esNo(texto)) {
    if (!borrador.foto) return responder({}, mensajes.sigueEnVenta(borrador.nombre));
    return responder(
      { paso: 'datos', borrador: { foto: borrador.foto, nombre: null, precio: null } },
      mensajes.corregir,
    );
  }

  // Norma puede corregir escribiendo directamente el precio, con o sin el nombre.
  const datos = interpretarDatos(texto);
  if (datos.precio) {
    return proponer(tienda, {
      foto: borrador.foto,
      nombre: datos.nombre ?? borrador.nombre,
      precio: datos.precio ?? borrador.precio,
    });
  }

  return responder(conversacion, preguntar(mensajes.elegirSiNo));
}

function responderDatos(tienda, conversacion, texto) {
  const datos = interpretarDatos(texto);
  const borrador = {
    ...conversacion.borrador,
    nombre: datos.nombre ?? conversacion.borrador.nombre,
    precio: datos.precio ?? conversacion.borrador.precio,
  };
  return completar(tienda, borrador, mensajes.noEntendi);
}

async function responderVenta(tienda, conversacion, texto) {
  if (esSi(texto)) {
    const pieza = await marcarVendida(tienda, conversacion.piezaId);
    if (!pieza) return responder({}, mensajes.noEncontrePieza(await nombresDisponibles(tienda)));
    return { ...responder({}, mensajes.vendida(pieza.nombre)), huboCambios: true };
  }
  if (esNo(texto)) return responder({}, mensajes.sigueEnVenta(conversacion.nombre));
  return responder(conversacion, preguntar(mensajes.elegirSiNoVenta));
}

async function textoLibre(tienda, texto) {
  const clave = normalizar(texto);

  if (/\bvend/.test(clave)) {
    const disponibles = await piezasDisponibles(tienda);
    // Si hay "Taza" y "Taza azul", gana el nombre más largo que aparezca en el mensaje.
    const pieza = disponibles
      .filter((p) => clave.includes(normalizar(p.nombre)))
      .sort((a, b) => b.nombre.length - a.nombre.length)[0];

    if (!pieza) return responder({}, mensajes.noEncontrePieza(disponibles.map((p) => p.nombre)));
    return responder(
      { paso: 'venta', piezaId: pieza.id, nombre: pieza.nombre },
      preguntar(mensajes.confirmarVenta(pieza.nombre)),
    );
  }

  const datos = interpretarDatos(texto);
  if (datos.nombre && datos.precio) return proponer(tienda, { foto: null, ...datos });

  return responder({}, mensajes.ayuda);
}

async function nombresDisponibles(tienda) {
  return (await piezasDisponibles(tienda)).map((p) => p.nombre);
}

function marcarVendida(tienda, id) {
  return almacen.actualizarPieza(tienda, id, {
    estado: 'vendida',
    vendidaEn: new Date().toISOString(),
  });
}

// --- Repaso semanal ---

function preguntaDeRepaso(pieza) {
  return {
    foto: pieza.foto,
    ...preguntar(mensajes.repasoPregunta(pieza.nombre, pieza.precio)),
  };
}

async function empezarRepaso(tienda) {
  const disponibles = await piezasDisponibles(tienda);
  if (!disponibles.length) return responder({}, mensajes.repasoSinPiezas);

  return responder(
    { paso: 'repaso', pendientes: disponibles.map((p) => p.id) },
    mensajes.repasoInicio,
    preguntaDeRepaso(disponibles[0]),
  );
}

async function responderRepaso(tienda, conversacion, texto) {
  const sigue = esSi(texto);
  const seVendio = esNo(texto);
  if (!sigue && !seVendio) return responder(conversacion, preguntar(mensajes.elegirSiNoRepaso));

  const [actual, ...resto] = conversacion.pendientes;
  if (seVendio) await marcarVendida(tienda, actual);

  // Puede que alguna pieza pendiente ya no esté disponible: se saltea.
  const disponibles = await piezasDisponibles(tienda);
  const pendientes = resto.filter((id) => disponibles.some((p) => p.id === id));
  const acuse = seVendio ? mensajes.repasoVendida : mensajes.repasoSigue;

  const resultado = pendientes.length
    ? responder(
        { paso: 'repaso', pendientes },
        acuse,
        preguntaDeRepaso(disponibles.find((p) => p.id === pendientes[0])),
      )
    : responder({}, acuse, mensajes.repasoFin);

  return { ...resultado, huboCambios: seVendio };
}
