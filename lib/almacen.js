// Piezas, tiendas y conversaciones en MongoDB.
//
// Hay una tienda principal, la página real de Norma, y una tienda de prueba por
// cada visita al simulador. Las de prueba se borran solas a los DIAS_DE_PRUEBA días.

import { obtenerDb } from './mongo';
import { borrarFotos } from './fotos';
import { piezasIniciales } from './semilla';

export const TIENDA_PRINCIPAL = 'norma';
const DIAS_DE_PRUEBA = 7;
const DIA = 24 * 60 * 60 * 1000;
const FORMATO_TIENDA_DE_PRUEBA = /^[a-z0-9]{12}$/;

export function esIdDeTiendaDePrueba(id) {
  return typeof id === 'string' && FORMATO_TIENDA_DE_PRUEBA.test(id);
}

async function colecciones() {
  const db = await obtenerDb();
  return {
    tiendas: db.collection('tiendas'),
    piezas: db.collection('piezas'),
    conversaciones: db.collection('conversaciones'),
  };
}

// Lo que se guarda en Mongo se devuelve como objeto plano, sin datos internos.
function aPieza({ _id, nombre, precio, foto, estado, creadaEn, vendidaEn }) {
  return { id: _id, nombre, precio, foto, estado, creadaEn, vendidaEn };
}

async function sembrar(tienda, expiraEn) {
  const { piezas } = await colecciones();
  const documentos = piezasIniciales().map(({ id, ...pieza }) => ({
    _id: `${tienda}-${id}`,
    tienda,
    ...pieza,
    ...(expiraEn && { expiraEn }),
  }));
  await piezas.insertMany(documentos);
}

// --- Tiendas ---

export async function existeTienda(id) {
  const { tiendas } = await colecciones();
  return (await tiendas.countDocuments({ _id: id }, { limit: 1 })) > 0;
}

export async function asegurarTiendaPrincipal() {
  const { tiendas } = await colecciones();
  const { upsertedCount } = await tiendas.updateOne(
    { _id: TIENDA_PRINCIPAL },
    { $setOnInsert: { creadaEn: new Date() } },
    { upsert: true },
  );
  if (upsertedCount) await sembrar(TIENDA_PRINCIPAL, null);
}

export async function crearTiendaDePrueba() {
  const { tiendas } = await colecciones();
  const id = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const expiraEn = new Date(Date.now() + DIAS_DE_PRUEBA * DIA);
  await tiendas.insertOne({ _id: id, creadaEn: new Date(), expiraEn });
  await sembrar(id, expiraEn);
  return id;
}

// Vuelve una tienda de prueba a las piezas de ejemplo.
export async function reiniciarTienda(id) {
  const { tiendas, piezas, conversaciones } = await colecciones();
  const tienda = await tiendas.findOne({ _id: id });
  if (!tienda) return false;

  const [actuales, conversacion] = await Promise.all([
    piezas.find({ tienda: id }, { projection: { foto: 1 } }).toArray(),
    conversaciones.findOne({ _id: id }),
  ]);

  await Promise.all([piezas.deleteMany({ tienda: id }), conversaciones.deleteOne({ _id: id })]);
  await sembrar(id, tienda.expiraEn ?? null);
  await borrarFotos([...actuales.map((p) => p.foto), conversacion?.estado?.borrador?.foto]);
  return true;
}

// --- Piezas ---

export async function listarPiezas(tienda) {
  const { piezas } = await colecciones();
  return (await piezas.find({ tienda }).toArray()).map(aPieza);
}

export async function crearPieza(tienda, { nombre, precio, foto }) {
  const { tiendas, piezas } = await colecciones();
  const { expiraEn } = (await tiendas.findOne({ _id: tienda })) ?? {};
  const documento = {
    _id: crypto.randomUUID(),
    tienda,
    nombre,
    precio,
    foto,
    estado: 'disponible',
    creadaEn: new Date().toISOString(),
    vendidaEn: null,
    ...(expiraEn && { expiraEn }),
  };
  await piezas.insertOne(documento);
  return aPieza(documento);
}

export async function actualizarPieza(tienda, id, cambios) {
  const { piezas } = await colecciones();
  const pieza = await piezas.findOneAndUpdate(
    { _id: id, tienda },
    { $set: cambios },
    { returnDocument: 'after' },
  );
  return pieza ? aPieza(pieza) : null;
}

// --- Conversación de Norma con su página ---

export async function leerConversacion(tienda) {
  const { conversaciones } = await colecciones();
  return (await conversaciones.findOne({ _id: tienda }))?.estado ?? {};
}

export async function guardarConversacion(tienda, estado) {
  const { tiendas, conversaciones } = await colecciones();
  const { expiraEn } = (await tiendas.findOne({ _id: tienda })) ?? {};
  await conversaciones.replaceOne(
    { _id: tienda },
    { estado, ...(expiraEn && { expiraEn }) },
    { upsert: true },
  );
}
