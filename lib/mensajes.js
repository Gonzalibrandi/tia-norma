// Todo lo que El Taller le dice a Norma está en este archivo.
// Es la "voz" del proyecto: cálida, cercana y con frases cortas, porque Norma no ve bien.
// Cambiá los textos acá sin tocar la lógica.

import { formatearPrecio } from './texto';

export const BOTONES_SI_NO = ['Sí', 'No'];

const EJEMPLO = 'Por ejemplo: Taza azul 15000';

export const mensajes = {
  saludo:
    '¡Hola, Norma! Cuando tengas una pieza nueva, sacale una foto con su cartelito al lado, con el nombre y el precio escritos a mano. Yo me encargo del resto.',

  respuestaAlSaludo: '¡Hola, Norma! ¿Cómo estás?',

  ayuda:
    'Para sumar una pieza, o cambiarle la foto o el precio, mandame una foto con su cartelito al lado. Si vendiste alguna, escribime "vendí" y el nombre, y la saco de la página.',

  // Carga y edición
  noPudeLeer: `Recibí la foto, pero no llegué a leer bien el cartelito. ¿Me escribís el nombre y el precio? ${EJEMPLO}`,
  noEntendi: `Perdoname, no te entendí. ¿Me escribís el nombre y el precio de la pieza? ${EJEMPLO}`,
  faltaPrecio: (nombre) => `Anoté «${nombre}». ¿Cuánto sale?`,
  faltaNombre: (precio) => `Anoté el precio, ${formatearPrecio(precio)}. ¿Cómo se llama la pieza?`,
  faltaFoto: (nombre) =>
    `Anoté «${nombre}». Ahora mandame una foto de la pieza y te muestro cómo queda.`,

  proponerNueva: (nombre, precio) =>
    `Así queda en tu página:\n\n${nombre}\n${formatearPrecio(precio)}\n\n¿La publico?`,
  proponerCambio: (nombre, precioViejo, precioNuevo) =>
    precioViejo === precioNuevo
      ? `«${nombre}» ya está en tu página a ${formatearPrecio(precioViejo)}. ¿Le pongo esta foto nueva?`
      : `«${nombre}» ya está en tu página a ${formatearPrecio(precioViejo)}. ¿Le pongo esta foto y el precio nuevo, ${formatearPrecio(precioNuevo)}?`,
  proponerPrecio: (nombre, precioViejo, precioNuevo) =>
    `«${nombre}» está a ${formatearPrecio(precioViejo)}. ¿Le cambio el precio a ${formatearPrecio(precioNuevo)}?`,
  mismoPrecio: (nombre, precio) =>
    `«${nombre}» ya está en tu página a ${formatearPrecio(precio)}, así que no hace falta cambiar nada.`,

  elegirSiNo: 'Tocá Sí para publicarla, o No si hay algo que corregir.',
  corregir: `Dale, lo corregimos. ¿Me escribís el nombre y el precio? ${EJEMPLO}`,
  publicada: (nombre) => `¡Listo, Norma! «${nombre}» ya está en tu página para que la vean todos.`,
  actualizada: (nombre) => `¡Listo! «${nombre}» ya quedó actualizada en tu página.`,

  // Ventas
  confirmarVenta: (nombre) => `¡Qué bueno! ¿Saco «${nombre}» de la página porque se vendió?`,
  vendida: (nombre) => `¡Felicitaciones! Marqué «${nombre}» como vendida.`,
  sigueEnVenta: (nombre) => `Perfecto, «${nombre}» sigue en tu página.`,
  noEncontrePieza: (nombres) =>
    nombres.length
      ? `No encontré esa pieza. Las que tenés en la página son: ${nombres.join(', ')}.`
      : 'Ahora no tenés piezas en la página.',
  elegirSiNoVenta: 'Tocá Sí si se vendió, o No para dejarla en la página.',

  // Repaso semanal
  repasoInicio: '¡Hola, Norma! Como todas las semanas, repasemos tus piezas así la página queda al día.',
  repasoSinPiezas:
    '¡Hola, Norma! Esta semana no tenés piezas en la página. Cuando tengas una nueva, mandame la foto con su cartelito.',
  repasoPregunta: (nombre, precio) =>
    `${nombre}, ${formatearPrecio(precio)}\n\n¿La seguís teniendo?`,
  repasoSigue: 'Perfecto, la dejo en la página.',
  repasoVendida: 'Listo, la saco de la página.',
  repasoFin: 'Listo, eso es todo. Tu página quedó al día. ¡Gracias, Norma, hasta la semana que viene!',
  elegirSiNoRepaso: 'Tocá Sí si la seguís teniendo, o No si ya no está.',
};
