// Achica la foto en el celular antes de mandarla: las fotos de cámara pesan
// varios megas y con conexión lenta tardarían mucho en subir.

const LADO_MAXIMO = 1280;
const CALIDAD = 0.82;

export async function achicarFoto(archivo) {
  const imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' }).catch(() => {
    throw new Error('No se pudo abrir esa foto.');
  });

  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  lienzo.getContext('2d').drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();

  const liviana = await new Promise((resolver) => lienzo.toBlob(resolver, 'image/jpeg', CALIDAD));
  if (!liviana) throw new Error('No se pudo preparar la foto.');
  return liviana;
}
