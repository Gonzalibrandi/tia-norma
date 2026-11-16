// Prepara la tienda de prueba de una visita al simulador.
// Si la visita ya tenía una y sigue vigente, la reutiliza; si no, crea otra.
// En los dos casos la conversación arranca de cero.

import { crearTiendaDePrueba, esIdDeTiendaDePrueba, existeTienda } from '@/lib/almacen';
import { olvidarConversacion } from '@/lib/asistente';

export async function POST(request) {
  const { tienda: anterior } = await request.json().catch(() => ({}));

  try {
    if (esIdDeTiendaDePrueba(anterior) && (await existeTienda(anterior))) {
      await olvidarConversacion(anterior);
      return Response.json({ tienda: anterior, nueva: false });
    }
    return Response.json({ tienda: await crearTiendaDePrueba(), nueva: true });
  } catch (causa) {
    console.error('Error al preparar la tienda de prueba', causa);
    return Response.json({ error: 'No se pudo preparar la prueba.' }, { status: 500 });
  }
}
