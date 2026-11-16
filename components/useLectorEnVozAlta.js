'use client';

// Lee textos en voz alta con la voz del celular, en español.
// "disponible" es false si el navegador no puede hablar o no tiene voces en
// español: en ese caso no se muestra el botón, para no dejar uno que no hace nada.

import { useCallback, useEffect, useState } from 'react';

function vozEnEspanol() {
  const voces = window.speechSynthesis.getVoices();
  return (
    voces.find((v) => v.lang?.toLowerCase().startsWith('es-ar')) ??
    voces.find((v) => v.lang?.toLowerCase().startsWith('es')) ??
    null
  );
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
    frase.lang = 'es-AR';
    const voz = vozEnEspanol();
    if (voz) frase.voice = voz;
    frase.rate = 0.9; // Un poco más lento de lo normal.
    sintesis.speak(frase);
  }, []);

  const callar = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  return { disponible, leer, callar };
}
