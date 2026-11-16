import { formatearPrecio } from '@/lib/texto';

// Las primeras fotos se cargan enseguida; el resto, a medida que se baja.
const FOTOS_PRIORITARIAS = 2;

export default function Vidriera({ piezas }) {
  return (
    <main className="pagina">
      <header className="encabezado">
        <h1>El taller de Norma</h1>
      </header>

      {piezas.length === 0 ? (
        <p className="vacio">Todavía no hay piezas publicadas.</p>
      ) : (
        <ul className="grilla">
          {piezas.map((pieza, indice) => {
            const vendida = pieza.estado === 'vendida';
            return (
              <li key={pieza.id} className={vendida ? 'pieza pieza-vendida' : 'pieza'}>
                <div className="pieza-foto">
                  <img
                    src={pieza.foto}
                    alt={pieza.nombre}
                    width="600"
                    height="800"
                    loading={indice < FOTOS_PRIORITARIAS ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                  {vendida && <span className="sello">Vendida</span>}
                </div>
                <h2>{pieza.nombre}</h2>
                <p className="precio">{formatearPrecio(pieza.precio)}</p>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
