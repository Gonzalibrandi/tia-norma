'use client';

// Lee textos en voz alta con la voz del celular, en español.
// "disponible" es false si el navegador no puede hablar o no tiene voces en
// español: en ese caso no se muestra el botón, para no dejar uno que no hace nada.

import { useCallback, useEffect, useState } from 'react';

// La voz depende de lo que tenga instalado cada celular. Se prefiere un acento
// rioplatense o latinoamericano; la de España queda como último recurso.
const ACENTOS_PREFERIDOS = ['es-ar', 'es-uy', 'es-419', 'es-us', 'es-mx', 'es-cl', 'es-co'];

function prioridad(voz) {
  const idioma = voz.lang?.toLowerCase().replace('_', '-') ?? '';
  if (!idioma.startsWith('es')) return Infinity;
  const posicion = ACENTOS_PREFERIDOS.findIndex((a) => idioma.startsWith(a));
  if (posicion !== -1) return posicion;
  if (idioma.startsWith('es-es')) return ACENTOS_PREFERIDOS.length + 1;
  return ACENTOS_PREFERIDOS.length; // Otro país de habla hispana.
}

function vozEnEspanol() {
  const voces = window.speechSynthesis.getVoices().filter((v) => prioridad(v) !== Infinity);
  if (!voces.length) return null;
  return voces.reduce((mejor, voz) => (prioridad(voz) < prioridad(mejor) ? voz : mejor));
}

function puedeHablarEnEspanol() {
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
    return false;
  }
  const voces = window.speechSynthesis.getVoices();
  // Algunos celulares no informan la lista de voces pero igual hablan en el idioma pedido.
  return voces.length === 0 || Boolean(vozEnEspanol());
}

export function useLectorEnVozAlta() {
  const [disponible, setDisponible] = useState(false);

  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const sintesis = window.speechSynthesis;

    // La lista de voces puede llegar un rato después de cargar la página.
    const actualizar = () => setDisponible(puedeHablarEnEspanol());
    const primeraVez = setTimeout(actualizar, 0);
    sintesis.addEventListener?.('voiceschanged', actualizar);

    return () => {
      clearTimeout(primeraVez);
      sintesis.removeEventListener?.('voiceschanged', actualizar);
      sintesis.cancel();
    };
  }, []);

  const leer = useCallback((texto) => {
    const sintesis = window.speechSynthesis;
    sintesis.cancel(); // Si estaba leyendo otra pieza, se corta.
    const frase = new SpeechSynthesisUtterance(texto);
    const voz = vozEnEspanol();
    frase.lang = voz?.lang ?? 'es-AR';
    if (voz) frase.voice = voz;
    frase.rate = 0.9; // Un poco más lento de lo normal.
    sintesis.speak(frase);
  }, []);

  const callar = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  return { disponible, leer, callar };
}
