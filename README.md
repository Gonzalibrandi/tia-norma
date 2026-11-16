# Las cerámicas de Norma

Página para que Norma muestre sus piezas de cerámica y la mantenga al día sin aprender nada nuevo: le manda a su página una foto de la pieza con un cartelito escrito a mano, y la página lee el nombre y el precio y le pregunta si la publica. Una vez por semana, la página le pregunta si sigue teniendo cada pieza.

- `/`: la página de Norma.
- `/simulador`: simula el chat de Norma con su página. Cada visita tiene su propia copia de la tienda.

## Correrlo en la compu

1. `npm install`
2. Copiá `.env.example` como `.env.local` y completá los valores.
3. `npm run dev` y abrí `http://localhost:3000/simulador`.

Sin `BLOB_READ_WRITE_TOKEN`, las fotos se guardan en `public/fotos/subidas`. Eso solo funciona con `npm run dev`.

## Variables

| Variable | Para qué |
|---|---|
| `MONGODB_URI` | Base de datos en MongoDB Atlas (piezas, tiendas de prueba y conversaciones). |
| `GEMINI_API_KEY` | Leer el cartelito. Sin clave, la página le pide a Norma que escriba los datos. |
| `BLOB_READ_WRITE_TOKEN` | Guardar las fotos en Vercel Blob. Lo agrega Vercel al conectar el Blob store. |
| `MONGODB_DNS` | Solo si Node no encuentra Atlas en tu compu (`querySrv ECONNREFUSED`). |
