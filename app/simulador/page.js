import Simulador from './Simulador';
import { mensajes } from '@/lib/mensajes';

export const metadata = {
  title: 'Simulador: el WhatsApp de Norma',
};

export default function PaginaSimulador() {
  return <Simulador saludo={mensajes.saludo} />;
}
