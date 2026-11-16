// Piezas con las que arranca la página (y cada tienda de prueba del simulador).
// Son piezas reales fotografiadas con su cartelito, como las publicaría Norma.

const DIA = 24 * 60 * 60 * 1000;

export function piezasIniciales() {
  const ahora = Date.now();
  const hace = (dias) => new Date(ahora - dias * DIA).toISOString();

  return [
    {
      id: 'cerealero',
      nombre: 'Cerealero',
      precio: 12000,
      foto: '/fotos/ejemplo/cerealero.jpg',
      estado: 'disponible',
      creadaEn: hace(1),
      vendidaEn: null,
    },
    {
      id: 'lechera',
      nombre: 'Lechera',
      precio: 15000,
      foto: '/fotos/ejemplo/lechera.jpg',
      estado: 'disponible',
      creadaEn: hace(3),
      vendidaEn: null,
    },
    {
      id: 'botellon',
      nombre: 'Botellón',
      precio: 15000,
      foto: '/fotos/ejemplo/botellon.jpg',
      estado: 'disponible',
      creadaEn: hace(5),
      vendidaEn: null,
    },
    {
      id: 'tablita',
      nombre: 'Tablita',
      precio: 10000,
      foto: '/fotos/ejemplo/tablita.jpg',
      estado: 'vendida',
      creadaEn: hace(9),
      vendidaEn: hace(2),
    },
  ];
}
