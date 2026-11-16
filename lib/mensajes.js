// Todo lo que la página le dice a Norma está en este archivo.
// Es la "voz" del proyecto: cambiá los textos acá sin tocar la lógica.

import { formatearPrecio } from './texto';

export const BOTONES_SI_NO = ['Sí', 'No'];

const EJEMPLO = 'Por ejemplo: Taza azul 15000';

export const mensajes = {
  saludo:
    'Hola, Norma. Para publicar una pieza, mandame una foto de la pieza con su cartelito al lado: el nombre y el precio escritos a mano.',

  ayuda:
    'Para publicar una pieza o cambiarle la foto o el precio, mandame una foto de la pieza con su cartelito al lado. Si se vendió alguna, escribime "vendí" y el nombre.',

  // Carga y edición
  noPudeLeer: `Recibí la foto, pero no pude leer el cartelito. Escribime el nombre y el precio de la pieza. ${EJEMPLO}`,
  noEntendi: `No te entendí. Escribime el nombre y el precio de la pieza. ${EJEMPLO}`,
  faltaPrecio: (nombre) => `Dice «${nombre}», pero me falta el precio. ¿Cuánto sale?`,
  faltaNombre: (precio) =>
    `Tengo el precio, ${formatearPrecio(precio)}, pero me falta el nombre. ¿Cómo se llama la pieza?`,
  faltaFoto: (nombre) => `Para publicar «${nombre}» me falta la foto. Mandámela cuando quieras.`,

  proponerNueva: (nombre, precio) =>
    `Queda así:\n\n${nombre}\n${formatearPrecio(precio)}\n\n¿La publico?`,
  proponerCambio: (nombre, precioViejo, precioNuevo) =>
    precioViejo === precioNuevo
      ? `Ya tenés «${nombre}» publicada a ${formatearPrecio(precioViejo)}. ¿Le cambio la foto por esta?`
      : `Ya tenés «${nombre}» publicada a ${formatearPrecio(precioViejo)}. ¿La cambio por esta foto, a ${formatearPrecio(precioNuevo)}?`,
  proponerPrecio: (nombre, precioViejo, precioNuevo) =>
    `«${nombre}» está a ${formatearPrecio(precioViejo)}. ¿Le cambio el precio a ${formatearPrecio(precioNuevo)}?`,
  mismoPrecio: (nombre, precio) =>
    `«${nombre}» ya está publicada a ${formatearPrecio(precio)}. No cambié nada.`,

  elegirSiNo: 'Tocá Sí para publicarla o No para corregirla.',
  corregir: `Bueno, la corregimos. Escribime el nombre y el precio. ${EJEMPLO}`,
  publicada: (nombre) => `¡Listo! «${nombre}» ya está en tu página.`,
  actualizada: (nombre) => `¡Listo! Actualicé «${nombre}» en tu página.`,

  // Ventas
  confirmarVenta: (nombre) => `¿Saco «${nombre}» de la página porque se vendió?`,
  vendida: (nombre) => `Listo, marqué «${nombre}» como vendida.`,
  sigueEnVenta: (nombre) => `Bueno, «${nombre}» sigue publicada.`,
  noEncontrePieza: (nombres) =>
    nombres.length
      ? `No encontré esa pieza. Las que tenés publicadas son: ${nombres.join(', ')}.`
      : 'No tenés piezas publicadas en este momento.',
  elegirSiNoVenta: 'Tocá Sí si se vendió o No para dejarla publicada.',

  // Repaso semanal
  repasoInicio: 'Hola, Norma. Pasó una semana: repasemos qué piezas seguís teniendo.',
  repasoSinPiezas:
    'No tenés piezas publicadas. Cuando quieras, mandame una foto de una pieza con su cartelito.',
  repasoPregunta: (nombre, precio) =>
    `${nombre}, ${formatearPrecio(precio)}\n\n¿La seguís teniendo?`,
  repasoSigue: 'Perfecto, sigue publicada.',
  repasoVendida: 'La marqué como vendida.',
  repasoFin: 'Eso es todo. Tu página quedó al día. ¡Gracias, Norma!',
  elegirSiNoRepaso: 'Tocá Sí si la seguís teniendo o No si ya no la tenés.',
};
