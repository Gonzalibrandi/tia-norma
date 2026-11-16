'use client';

// Cómo pedirle una pieza a Norma. Siguiendo su boceto, no hay carrito ni link
// a WhatsApp: se muestra su número bien grande y un botón para copiarlo.

import { useState } from 'react';

const TIEMPO_AVISO = 2500;

async function copiar(texto) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Navegadores viejos o sin permiso: se copia a la antigua.
    const area = document.createElement('textarea');
    area.value = texto;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let copiado = false;
    try {
      copiado = document.execCommand('copy');
    } catch {
      copiado = false;
    }
    area.remove();
    return copiado;
  }
}

export default function Contacto({ telefono }) {
  const [aviso, setAviso] = useState(null);

  async function alTocar() {
    const copiado = await copiar(telefono);
    setAviso(copiado ? '¡Número copiado!' : 'No se pudo copiar. Mantené apretado el número.');
    setTimeout(() => setAviso(null), TIEMPO_AVISO);
  }

  return (
    <section className="contacto" aria-label="Cómo pedir una pieza">
      <p className="contacto-texto">¿Te gustó alguna pieza? Mandale un mensaje a Norma:</p>
      <p className="contacto-numero">{telefono}</p>
      <button type="button" className="contacto-boton" onClick={alTocar}>
        Copiar número
      </button>
      <p className="contacto-aviso" role="status">
        {aviso}
      </p>
    </section>
  );
}
