// Piezas de ejemplo con las que arranca (y se reinicia) el simulador.
// Las imágenes son dibujos provisorios: hay que reemplazarlas por fotos reales.

const DIA = 24 * 60 * 60 * 1000;

export function piezasIniciales() {
  const ahora = Date.now();
  const hace = (dias) => new Date(ahora - dias * DIA).toISOString();

  return [
    {
      id: 'ejemplo-taza',
      nombre: 'Taza azul',
      precio: 15000,
      foto: '/fotos/ejemplo/taza.svg',
      estado: 'disponible',
      creadaEn: hace(1),
      vendidaEn: null,
    },
    {
      id: 'ejemplo-cuenco',
      nombre: 'Cuenco grande',
      precio: 22000,
      foto: '/fotos/ejemplo/cuenco.svg',
      estado: 'disponible',
      creadaEn: hace(3),
      vendidaEn: null,
    },
    {
      id: 'ejemplo-florero',
      nombre: 'Florero alto',
      precio: 30000,
      foto: '/fotos/ejemplo/florero.svg',
      estado: 'disponible',
      creadaEn: hace(5),
      vendidaEn: null,
    },
    {
      id: 'ejemplo-plato',
      nombre: 'Plato de postre',
      precio: 12000,
      foto: '/fotos/ejemplo/plato.svg',
      estado: 'vendida',
      creadaEn: hace(9),
      vendidaEn: hace(2),
    },
  ];
}
