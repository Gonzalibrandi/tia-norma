// Lee con Gemini el cartelito escrito a mano que aparece en la foto de una pieza.
//
// Devuelve { nombre, precio } con lo que haya podido leer (cada dato puede ser null),
// o null si no hay clave configurada o el servicio no respondió a tiempo. En ese caso
// la conversación sigue igual: la página le pide a Norma que escriba los datos.

import { limpiarNombre, precioValido } from './texto.js';

// El plan gratuito de Gemini se satura seguido: a veces un modelo tarda mucho o
// responde "ocupado" (503). Por eso se consultan varios modelos a la vez, cada uno
// reintenta solo si le dicen que está ocupado, y gana la primera respuesta.
// Los tres leyeron bien todos los cartelitos de prueba (fotos reales incluidas).
const MODELOS = [
  process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
  'gemini-3.5-flash-lite',
  'gemini-3.1-flash-lite',
];
const TIEMPO_MAXIMO = 15_000;
const ESPERA_ENTRE_REINTENTOS = 600;

const INSTRUCCIONES = `La foto muestra una pieza de cerámica y, al lado, un cartelito escrito a mano con el nombre de la pieza y su precio en pesos argentinos.

Transcribí lo que dice el cartelito:
- "nombre": el nombre de la pieza copiado letra por letra, sin el precio. No corrijas ni completes palabras: no agregues tildes ni eñes que no estén escritas. Solo pasalo a minúsculas con mayúscula inicial en cada palabra si está todo en mayúsculas.
- "precio": el precio como número entero. "$15.000", "15000" y "15 mil" son 15000.

No describas la pieza ni inventes datos. Si no hay cartelito, o algún dato no se lee con claridad, devolvé null en ese dato.`;

const ESQUEMA = {
  type: 'OBJECT',
  properties: {
    nombre: { type: 'STRING', nullable: true },
    precio: { type: 'INTEGER', nullable: true },
  },
  required: ['nombre', 'precio'],
};

// Errores pasajeros: vale la pena volver a intentar con el mismo modelo.
const ESTADOS_REINTENTABLES = [429, 500, 502, 503, 504];

export async function leerCartelito(buffer, tipo) {
  const clave = process.env.GEMINI_API_KEY?.trim();
  if (!clave) return null;

  const cuerpo = JSON.stringify({
    contents: [
      {
        parts: [
          { inline_data: { mime_type: tipo, data: buffer.toString('base64') } },
          { text: INSTRUCCIONES },
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      responseMimeType: 'application/json',
      responseSchema: ESQUEMA,
      // Los cartelitos tienen letra grande: con resolución media se leen igual
      // y la consulta es más liviana.
      mediaResolution: 'MEDIA_RESOLUTION_MEDIUM',
    },
  });

  // Cuando un modelo responde (o se acaba el tiempo), se cancelan los demás.
  const fin = new AbortController();
  const senal = AbortSignal.any([fin.signal, AbortSignal.timeout(TIEMPO_MAXIMO)]);

  try {
    return await Promise.any([...new Set(MODELOS)].map((m) => insistir(m, clave, cuerpo, senal)));
  } catch {
    console.error('Gemini: ningún modelo respondió a tiempo.');
    return null;
  } finally {
    fin.abort();
  }
}

// Consulta un modelo y, si está ocupado, reintenta hasta que responda o se cancele.
async function insistir(modelo, clave, cuerpo, senal) {
  while (!senal.aborted) {
    const resultado = await consultar(modelo, clave, cuerpo, senal);
    if (resultado.ok) return resultado.datos;
    if (!resultado.reintentar) break;
    await esperar(ESPERA_ENTRE_REINTENTOS, senal);
  }
  throw new Error(`Gemini (${modelo}) no respondió.`);
}

async function consultar(modelo, clave, cuerpo, senal) {
  let respuesta;
  try {
    respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
        signal: senal,
        body: cuerpo,
      },
    );
  } catch {
    // Cancelado (ganó otro modelo o se acabó el tiempo) o falla de red.
    return { ok: false, reintentar: !senal.aborted };
  }

  if (!respuesta.ok) {
    const reintentar = ESTADOS_REINTENTABLES.includes(respuesta.status);
    if (!reintentar) {
      const detalle = (await respuesta.text()).slice(0, 200);
      console.error(`Gemini (${modelo}) respondió ${respuesta.status}: ${detalle}`);
    }
    return { ok: false, reintentar };
  }

  try {
    const datos = await respuesta.json();
    const texto = datos.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
    const leido = JSON.parse(texto);
    // Mismos filtros que para lo que escribe Norma: nombre limpio y precio razonable.
    return {
      ok: true,
      datos: { nombre: limpiarNombre(leido.nombre), precio: precioValido(leido.precio) },
    };
  } catch {
    return { ok: false, reintentar: true };
  }
}

function esperar(ms, senal) {
  return new Promise((resolver) => {
    const reloj = setTimeout(resolver, ms);
    senal.addEventListener('abort', () => {
      clearTimeout(reloj);
      resolver();
    }, { once: true });
  });
}
