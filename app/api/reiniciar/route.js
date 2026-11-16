// Devuelve una tienda de prueba a las piezas de ejemplo.

import { revalidateTag } from 'next/cache';
import { esIdDeTiendaDePrueba, reiniciarTienda } from '@/lib/almacen';
import { etiquetaDePiezas } from '@/lib/vidriera';

export async function POST(request) {
  const { tienda } = await request.json().catch(() => ({}));
  if (!esIdDeTiendaDePrueba(tienda)) {
    return Response.json({ error: 'Falta la tienda de prueba.' }, { status: 400 });
  }

  try {
    if (!(await reiniciarTienda(tienda))) {
      return Response.json({ error: 'La prueba venció.', codigo: 'tienda-vencida' }, { status: 404 });
    }
    revalidateTag(etiquetaDePiezas(tienda), { expire: 0 });
    return Response.json({ ok: true });
  } catch (causa) {
    console.error('Error al reiniciar', causa);
    return Response.json({ error: 'No se pudo reiniciar.' }, { status: 500 });
  }
}
