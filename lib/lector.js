// Lee con Gemini el cartelito escrito a mano que aparece en la foto de una pieza.
//
// Devuelve { nombre, precio } con lo que haya podido leer (cada dato puede ser null),
// o null si no hay clave configurada o el servicio falla. En ese caso la conversación
// sigue igual: la página le pide a Norma que escriba el nombre y el precio.

import { limpiarNombre, precioValido } from './texto.js';

// Se consultan dos modelos a la vez y gana la primera respuesta: el servicio gratuito
// a veces se satura o tarda, y así una demora no se suma a la otra.
// Los dos leyeron bien los cartelitos de prueba.
const MODELOS = [process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite'];
const TIEMPO_MAXIMO = 12_000;

const INSTRUCCIONES = `La foto muestra una pieza de cerámica y, al lado, un cartelito escrito a mano con el nombre de la pieza y su precio en pesos argentinos.

Transcribí lo que dice el cartelito:
- "nombre": el nombre de la pieza tal como está escrito, con mayúscula inicial y sin el precio.
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
    },
  });

  // Cuando un modelo responde, se cancela la consulta al otro.
  const ganador = new AbortController();
  const senal = AbortSignal.any([ganador.signal, AbortSignal.timeout(TIEMPO_MAXIMO)]);

  try {
    return await Promise.any([...new Set(MODELOS)].map((m) => consultar(m, clave, cuerpo, senal)));
  } catch {
    return null; // Ningún modelo respondió a tiempo: Norma escribe los datos.
  } finally {
    ganador.abort();
  }
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
  } catch (error) {
    if (error.name === 'TimeoutError') console.error(`Gemini (${modelo}) no respondió a tiempo.`);
    throw error;
  }

  if (!respuesta.ok) {
    const detalle = (await respuesta.text()).slice(0, 200);
    console.error(`Gemini (${modelo}) respondió ${respuesta.status}: ${detalle}`);
    throw new Error(`Gemini ${respuesta.status}`);
  }

  const datos = await respuesta.json();
  const texto = datos.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!texto) throw new Error(`Gemini (${modelo}) no devolvió texto.`);

  const leido = JSON.parse(texto);
  // Mismos filtros que para lo que escribe Norma: nombre limpio y precio razonable.
  return { nombre: limpiarNombre(leido.nombre), precio: precioValido(leido.precio) };
}
