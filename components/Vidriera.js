import Contacto from '@/components/Contacto';
import Grilla from '@/components/Grilla';
import { TELEFONO_NORMA } from '@/lib/norma';

// "esPrueba" marca la copia que usa cada visita al simulador: se avisa que los
// cambios no llegan a la página real de Norma.
export default function Vidriera({ piezas, esPrueba = false }) {
  return (
    <main className="pagina">
      {esPrueba && (
        <p className="aviso-prueba">
          Esta es tu copia de prueba. Lo que publiques desde el simulador se ve solo acá: la
          página de Norma no cambia.{' '}
          <a href="/" target="_blank" rel="noreferrer">
            Ver la página de Norma
          </a>
        </p>
      )}
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
