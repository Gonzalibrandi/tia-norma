# El taller de Norma

Una página para que Norma, una ceramista de 70 años, muestre sus piezas y la mantenga al día sin aprender nada nuevo.

- **La página:** https://el-taller-de-norma.vercel.app
- **El simulador:** https://el-taller-de-norma.vercel.app/simulador

Hecho para el challenge de [@goncy](https://x.com/goncy): Norma tiene un celular viejo, no ve bien, no tiene mail ni compu, y solo usa WhatsApp.

## La idea: el cartelito

Como en una feria, Norma apoya la pieza, le pone al lado un papel escrito a mano con el nombre y el precio, y le saca una foto. Se la manda por WhatsApp a un contacto, **El Taller**, que lee el cartelito y le pregunta: "Así queda en tu página. ¿La publico?". Si dice que sí, la pieza aparece en la página.

- **Cambiar el precio o la foto:** lo mismo, con un cartelito nuevo. Si la pieza ya existe, El Taller pregunta si la actualiza.
- **Dar de baja lo vendido:** cada semana, El Taller le pregunta pieza por pieza, con la foto, si la sigue teniendo. Así no depende de que se acuerde. También puede escribir "vendí" y el nombre.
- **Nada se publica sin su "Sí".** Si El Taller no puede leer el cartelito, le pide que escriba el nombre y el precio.

## Lo que no tiene, a propósito

El boceto de Norma lo dice: "No tiene carrito, no tiene link a WhatsApp, nada. Si alguien lo quiere, le manda un mensaje y arreglan." La página muestra su número bien grande y un botón para copiarlo. El número es de ejemplo: Norma no existe.

Para quien compra, que tampoco se lleva bien con la tecnología: letra grande, una sola columna en el celular, fotos que se ven en grande al tocarlas y un botón **Escuchar** que lee el nombre y el precio en voz alta.

## El simulador

WhatsApp real no se puede dejar abierto para que lo pruebe cualquiera, así que `/simulador` simula el chat de Norma con El Taller al lado de su página:

- Cada visita tiene su propia copia de la tienda (vence a los 7 días), así nadie le pisa la prueba a nadie.
- Hay fotos reales de piezas con su cartelito para mandar con un toque, o se puede subir cualquier foto con un papelito al lado.
- Un botón simula el repaso semanal y otro vuelve todo al principio.

En una versión real, los mensajes llegarían por la API de WhatsApp a la misma lógica ([lib/asistente.js](lib/asistente.js)), el repaso sería un mensaje programado y el número de Norma sería su identidad: no hay usuario ni contraseña.

## Cómo está hecho

- **Next.js** en Vercel.
- **MongoDB Atlas** para las piezas, las tiendas de prueba y el estado de cada conversación.
- **Vercel Blob** para las fotos. El navegador las achica antes de subirlas, para que anden con conexiones lentas.
- **Gemini** para leer el cartelito ([lib/lector.js](lib/lector.js)). El plan gratuito a veces se satura, así que se consultan tres modelos a la vez, cada uno reintenta si está ocupado y gana la primera respuesta. Si ninguno responde en 15 segundos, El Taller le pide a Norma que escriba los datos.
- Todo lo que El Taller le dice a Norma está en [lib/mensajes.js](lib/mensajes.js).

## Correrlo en la compu

1. `npm install`
2. Copiá `.env.example` como `.env.local` y completá los valores.
3. `npm run dev` y abrí http://localhost:3000/simulador

| Variable | Para qué |
|---|---|
| `MONGODB_URI` | Base de datos en MongoDB Atlas. |
| `GEMINI_API_KEY` | Leer el cartelito. Sin clave, El Taller le pide a Norma que escriba los datos. |
| `BLOB_READ_WRITE_TOKEN` | Guardar las fotos en Vercel Blob. Sin esta variable se guardan en `public/fotos/subidas`, que solo funciona con `npm run dev`. |
| `MONGODB_DNS` | Opcional: servidores DNS para Node si falla la conexión con `querySrv ECONNREFUSED` (pasa en algunas compus con Windows). |
