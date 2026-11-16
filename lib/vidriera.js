// Lo que ve quien entra a la página: las piezas disponibles y, por unos días,
// las que se vendieron hace poco.

import { cacheLife, cacheTag } from 'next/cache';
import { asegurarTiendaPrincipal, existeTienda, listarPiezas, TIENDA_PRINCIPAL } from './almacen';

const DIAS_VISIBLE_VENDIDA = 7;
const DIA = 24 * 60 * 60 * 1000;

export function etiquetaDePiezas(tienda) {
  return `piezas:${tienda}`;
}

// Devuelve null si la tienda no existe (por ejemplo, una de prueba que ya venció).
export async function obtenerVidriera(tienda) {
  'use cache';
  cacheTag(etiquetaDePiezas(tienda));
  cacheLife('hours');

  if (tienda === TIENDA_PRINCIPAL) await asegurarTiendaPrincipal();
  else if (!(await existeTienda(tienda))) return null;

  const piezas = await listarPiezas(tienda);
  const limite = Date.now() - DIAS_VISIBLE_VENDIDA * DIA;
  const masNuevaPrimero = (a, b) => b.creadaEn.localeCompare(a.creadaEn);

  const disponibles = piezas.filter((p) => p.estado === 'disponible').sort(masNuevaPrimero);
  const vendidas = piezas
    .filter((p) => p.estado === 'vendida' && new Date(p.vendidaEn).getTime() >= limite)
    .sort(masNuevaPrimero);

  // Las vendidas van al final para que lo primero que se vea sea lo que hay.
  return [...disponibles, ...vendidas];
}
