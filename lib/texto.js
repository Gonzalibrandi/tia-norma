// Utilidades para entender lo que escribe Norma y para mostrar precios.

export function formatearPrecio(precio) {
  return `$ ${Number(precio).toLocaleString('es-AR')}`;
}

// "Taza Azúl!" -> "taza azul"
export function normalizar(texto) {
  return String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const SI = /^(si|sip|dale|ok|okey|bueno|claro|correcto|exacto|esta bien|publicala|publica)\b/;
const NO = /^(no|nop|ya no|todavia no|vendida|la vendi|se vendio)\b/;

export function esSi(texto) {
  return SI.test(normalizar(texto));
}

export function esNo(texto) {
  return NO.test(normalizar(texto));
}

const PRECIO = /\$?\s*(\d{1,3}(?:\.\d{3})+|\d+)(?:,\d{1,2})?\s*(mil|lucas)?(?![a-záéíóúñ\d])/gi;
const PALABRAS_DE_PRECIO = /\b(pesos|sale|salen|cuesta|vale|precio)\b/gi;
const PRECIO_MAXIMO = 99_999_999;
const LARGO_MAXIMO_NOMBRE = 60;

// "taza azul, 15 mil" -> { nombre: "Taza azul", precio: 15000 }
// Devuelve null en lo que no encuentra.
export function interpretarDatos(texto) {
  let resto = String(texto ?? '');
  let precio = null;

  // Si hay varios números ("Juego de 6 platos 45000"), el precio es el último.
  const hallado = [...resto.matchAll(PRECIO)].at(-1);
  if (hallado) {
    let numero = Number(hallado[1].replace(/\./g, ''));
    if (hallado[2]) numero *= 1000;
    if (numero >= 1 && numero <= PRECIO_MAXIMO) precio = numero;
    resto = resto.slice(0, hallado.index) + ' ' + resto.slice(hallado.index + hallado[0].length);
  }

  return { nombre: limpiarNombre(resto.replace(PALABRAS_DE_PRECIO, ' ')), precio };
}

// Deja solo letras, números y espacios, con mayúscula inicial. Null si queda vacío.
export function limpiarNombre(texto) {
  const limpio = String(texto ?? '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, LARGO_MAXIMO_NOMBRE)
    .trim();

  return limpio.length >= 2 ? limpio[0].toUpperCase() + limpio.slice(1) : null;
}

export function precioValido(numero) {
  return Number.isInteger(numero) && numero >= 1 && numero <= PRECIO_MAXIMO ? numero : null;
}
