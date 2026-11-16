// Dónde se guardan las fotos que manda Norma.
//
// Con BLOB_READ_WRITE_TOKEN (en Vercel) van a Vercel Blob. Sin esa variable se
// guardan en public/fotos/subidas, que solo sirve con "npm run dev": Next.js no
// sirve archivos agregados a public después de compilar.

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { del, put } from '@vercel/blob';

const EXTENSIONES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const CARPETA_LOCAL = path.join(process.cwd(), 'public', 'fotos', 'subidas');
const PREFIJO_LOCAL = '/fotos/subidas/';

const usaBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export function tipoDeFotoValido(tipo) {
  return tipo in EXTENSIONES;
}

export async function guardarFoto(tienda, buffer, tipo) {
  const nombre = `${tienda}/${crypto.randomUUID()}.${EXTENSIONES[tipo]}`;

  if (usaBlob()) {
    const { url } = await put(`fotos/${nombre}`, buffer, {
      access: 'public',
      contentType: tipo,
      addRandomSuffix: false,
    });
    return url;
  }

  const destino = path.join(CARPETA_LOCAL, nombre);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, buffer);
  return PREFIJO_LOCAL + nombre;
}

// Borra las fotos subidas. Ignora las de ejemplo y no falla si alguna ya no está.
export async function borrarFotos(urls) {
  const subidas = [...new Set(urls.filter(Boolean))];

  const deBlob = subidas.filter((u) => u.startsWith('https://'));
  if (deBlob.length && usaBlob()) await del(deBlob).catch(() => {});

  const locales = subidas.filter((u) => u.startsWith(PREFIJO_LOCAL));
  await Promise.all(
    locales.map((u) =>
      fs.rm(path.join(CARPETA_LOCAL, u.slice(PREFIJO_LOCAL.length)), { force: true }),
    ),
  );
}
