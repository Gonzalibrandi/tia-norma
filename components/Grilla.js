'use client';

// Grilla de piezas con dos ayudas para quien no ve bien:
// - tocar la foto la muestra en grande, con el nombre y el precio;
// - "Escuchar" lee en voz alta el nombre y el precio.

import { useCallback, useEffect, useRef, useState } from 'react';
import { formatearPrecio } from '@/lib/texto';
import { useLectorEnVozAlta } from './useLectorEnVozAlta';

// Las primeras fotos se cargan enseguida; el resto, a medida que se baja.
const FOTOS_PRIORITARIAS = 2;

function textoParaEscuchar(pieza) {
  // "12000 pesos" se lee "doce mil pesos"; con el signo "$" algunos celulares dicen "dólar".
  return pieza.estado === 'vendida'
    ? `${pieza.nombre}. Esta pieza ya se vendió.`
    : `${pieza.nombre}. ${pieza.precio} pesos.`;
}

export default function Grilla({ piezas }) {
  const [abierta, setAbierta] = useState(null);
  const disparador = useRef(null);
  const { disponible, leer, callar } = useLectorEnVozAlta();

  const cerrar = useCallback(() => {
    callar();
    setAbierta(null);
    disparador.current?.focus();
  }, [callar]);

  function abrir(pieza, evento) {
    disparador.current = evento.currentTarget;
    setAbierta(pieza);
  }

  return (
    <>
      <p className="ayuda-grilla">Tocá una foto para verla en grande.</p>
      <ul className="grilla">
        {piezas.map((pieza, indice) => {
          const vendida = pieza.estado === 'vendida';
          return (
            <li key={pieza.id} className={vendida ? 'pieza pieza-vendida' : 'pieza'}>
              <button
                type="button"
                className="pieza-foto"
                onClick={(evento) => abrir(pieza, evento)}
                aria-label={`Ver en grande: ${pieza.nombre}`}
              >
                <img
                  src={pieza.foto}
                  alt={pieza.nombre}
                  width="600"
                  height="800"
                  loading={indice < FOTOS_PRIORITARIAS ? 'eager' : 'lazy'}
                  decoding="async"
                />
                {vendida && <span className="sello">Vendida</span>}
              </button>
              <h2>{pieza.nombre}</h2>
              <p className="precio">{formatearPrecio(pieza.precio)}</p>
              {disponible && (
                <button
                  type="button"
                  className="boton-escuchar"
                  onClick={() => leer(textoParaEscuchar(pieza))}
                  aria-label={`Escuchar nombre y precio: ${pieza.nombre}`}
                >
                  <span aria-hidden="true">🔊</span> Escuchar
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {abierta && (
        <VistaGrande
          pieza={abierta}
          onCerrar={cerrar}
          onEscuchar={disponible ? () => leer(textoParaEscuchar(abierta)) : null}
        />
      )}
    </>
  );
}

function VistaGrande({ pieza, onCerrar, onEscuchar }) {
  const botonCerrar = useRef(null);
  const vendida = pieza.estado === 'vendida';

  useEffect(() => {
    botonCerrar.current?.focus();

    // Mientras está abierta, la página de atrás no se mueve.
    const desbordeAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function alApretarTecla(evento) {
      if (evento.key === 'Escape') onCerrar();
    }
    document.addEventListener('keydown', alApretarTecla);

    return () => {
      document.body.style.overflow = desbordeAnterior;
      document.removeEventListener('keydown', alApretarTecla);
    };
  }, [onCerrar]);

  return (
    <div
      className="vista-grande"
      role="dialog"
      aria-modal="true"
      aria-label={pieza.nombre}
      onClick={(evento) => {
        // Tocar el fondo oscuro también cierra.
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="vista-grande-contenido">
        <img src={pieza.foto} alt={pieza.nombre} />
        <p className="vista-grande-nombre">{pieza.nombre}</p>
        <p className="vista-grande-precio">
          {vendida ? 'Vendida' : formatearPrecio(pieza.precio)}
        </p>
        <div className="vista-grande-botones">
          {onEscuchar && (
            <button type="button" className="boton-escuchar" onClick={onEscuchar}>
              <span aria-hidden="true">🔊</span> Escuchar
            </button>
          )}
          <button type="button" className="boton-cerrar" onClick={onCerrar} ref={botonCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
