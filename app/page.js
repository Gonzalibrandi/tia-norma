import Vidriera from '@/components/Vidriera';
import { TIENDA_PRINCIPAL } from '@/lib/almacen';
import { obtenerVidriera } from '@/lib/vidriera';

// La página real de Norma.
export default async function Pagina() {
  const piezas = await obtenerVidriera(TIENDA_PRINCIPAL);
  return <Vidriera piezas={piezas ?? []} />;
}
