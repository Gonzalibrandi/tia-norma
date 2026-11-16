import Contacto from '@/components/Contacto';
import Grilla from '@/components/Grilla';
import { TELEFONO_NORMA } from '@/lib/norma';

export default function Vidriera({ piezas }) {
  return (
    <main className="pagina">
      <header className="encabezado">
        <h1>El taller de Norma</h1>
        <Contacto telefono={TELEFONO_NORMA} />
      </header>

      {piezas.length === 0 ? (
        <p className="vacio">Todavía no hay piezas publicadas.</p>
      ) : (
        <Grilla piezas={piezas} />
      )}
    </main>
  );
}
