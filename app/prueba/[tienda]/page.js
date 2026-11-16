// La copia de la página que usa cada visita al simulador.

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Vidriera from '@/components/Vidriera';
import { esIdDeTiendaDePrueba } from '@/lib/almacen';
import { obtenerVidriera } from '@/lib/vidriera';

export const metadata = {
  title: 'Las cerámicas de Norma (prueba)',
  robots: { index: false },
};

export default function PaginaDePrueba({ params }) {
  return (
    <Suspense fallback={<p className="cargando">Cargando…</p>}>
      <Contenido params={params} />
    </Suspense>
  );
}

async function Contenido({ params }) {
  const { tienda } = await params;
  if (!esIdDeTiendaDePrueba(tienda)) notFound();

  const piezas = await obtenerVidriera(tienda);
  if (!piezas) notFound();

  return <Vidriera piezas={piezas} />;
}
