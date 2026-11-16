// Recibe un mensaje de Norma (texto, foto o el pedido de repaso) para una tienda
// de prueba y devuelve las respuestas de la página.

import { revalidateTag } from 'next/cache';
import { esIdDeTiendaDePrueba, existeTienda } from '@/lib/almacen';
import { procesar } from '@/lib/asistente';
import { tipoDeFotoValido } from '@/lib/fotos';
import { etiquetaDePiezas } from '@/lib/vidriera';

const PESO_MAXIMO_FOTO = 4 * 1024 * 1024;
const LARGO_MAXIMO_TEXTO = 300;

function error(mensaje, status = 400, extra = {}) {
  return Response.json({ error: mensaje, ...extra }, { status });
}

export async function POST(request) {
  let formulario;
  try {
    formulario = await request.formData();
  } catch {
    return error('No se pudo leer el mensaje.');
  }

  const tienda = String(formulario.get('tienda') ?? '');
  if (!esIdDeTiendaDePrueba(tienda)) return error('Falta la tienda de prueba.');

  const accion = formulario.get('accion') === 'repaso' ? 'repaso' : null;
  const texto = String(formulario.get('texto') ?? '').trim().slice(0, LARGO_MAXIMO_TEXTO);
  const archivo = formulario.get('foto');

  let foto = null;
  if (archivo && typeof archivo !== 'string' && archivo.size > 0) {
    if (!tipoDeFotoValido(archivo.type)) return error('Ese archivo no es una foto.');
    if (archivo.size > PESO_MAXIMO_FOTO) return error('La foto es demasiado pesada.');
    foto = { buffer: Buffer.from(await archivo.arrayBuffer()), tipo: archivo.type };
  }

  if (!accion && !foto && !texto) return error('El mensaje está vacío.');

  try {
    if (!(await existeTienda(tienda))) {
      return error('La prueba venció.', 404, { codigo: 'tienda-vencida' });
    }

    const { respuestas, huboCambios } = await procesar({ tienda, texto, foto, accion });
    // La página está en caché: se vence al instante cuando cambia algo.
    if (huboCambios) revalidateTag(etiquetaDePiezas(tienda), { expire: 0 });
    return Response.json({ respuestas, huboCambios });
  } catch (causa) {
    console.error('Error al procesar el mensaje', causa);
    return error('Algo falló de nuestro lado.', 500);
  }
}
