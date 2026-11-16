// Conexión única a MongoDB Atlas, reutilizada entre pedidos.

import dns from 'node:dns';
import { MongoClient } from 'mongodb';

const global = globalThis;

export function obtenerDb() {
  global._normaDb ??= conectar().catch((error) => {
    // Si falla, el próximo pedido vuelve a intentar en lugar de quedar roto.
    global._normaDb = null;
    throw error;
  });
  return global._normaDb;
}

async function conectar() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Falta la variable MONGODB_URI.');

  // En algunas compus con Windows, Node no resuelve las direcciones de Atlas.
  // El driver usa dns.promises, que puede tener su propia configuración: se cambian las dos.
  if (process.env.MONGODB_DNS) {
    const servidores = process.env.MONGODB_DNS.split(',').map((s) => s.trim()).filter(Boolean);
    dns.setServers(servidores);
    dns.promises.setServers(servidores);
  }

  const cliente = new MongoClient(uri, { maxPoolSize: 5, serverSelectionTimeoutMS: 10_000 });
  await cliente.connect();
  const db = cliente.db();

  // Las tiendas de prueba del simulador se borran solas cuando vence "expiraEn".
  await Promise.all([
    db.collection('piezas').createIndex({ tienda: 1 }),
    db.collection('tiendas').createIndex({ expiraEn: 1 }, { expireAfterSeconds: 0 }),
    db.collection('piezas').createIndex({ expiraEn: 1 }, { expireAfterSeconds: 0 }),
    db.collection('conversaciones').createIndex({ expiraEn: 1 }, { expireAfterSeconds: 0 }),
  ]);

  return db;
}
