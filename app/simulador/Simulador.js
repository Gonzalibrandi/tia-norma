'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import estilos from './simulador.module.css';
import { achicarFoto } from './achicarFoto';
import { MUESTRAS } from './muestras';

// Se recuerda la tienda de prueba para que al recargar se sigan viendo los cambios.
const CLAVE_TIENDA = 'norma-tienda-de-prueba';

function leerTiendaGuardada() {
  try {
    return localStorage.getItem(CLAVE_TIENDA);
  } catch {
    return null;
  }
}

function guardarTienda(id) {
  try {
    localStorage.setItem(CLAVE_TIENDA, id);
  } catch {
    // Sin almacenamiento local, la prueba funciona igual pero no se recuerda.
  }
}

// Pide al servidor la tienda de prueba: reutiliza la anterior si sigue vigente.
async function pedirTienda(anterior) {
  const respuesta = await fetch('/api/tienda', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tienda: anterior }),
  });
  const datos = await respuesta.json();
  if (!respuesta.ok) throw new Error(datos.error);
  return datos.tienda;
}

let contador = 0;
function conId(mensaje) {
  contador += 1;
  return { ...mensaje, id: contador };
}

export default function Simulador({ saludo }) {
  const [tienda, setTienda] = useState(null);
  const [errorDeCarga, setErrorDeCarga] = useState(false);
  const [mensajes, setMensajes] = useState(() => [conId({ de: 'pagina', texto: saludo })]);
  const [texto, setTexto] = useState('');
  // Mientras espera la respuesta: null, 'escribiendo' o 'leyendo' (cuando mandó una foto).
  const [esperando, setEsperando] = useState(null);
  const enviando = esperando !== null;
  const [version, setVersion] = useState(0);
  const final = useRef(null);
  const selectorDeFoto = useRef(null);

  const usarTienda = useCallback((id) => {
    guardarTienda(id);
    setTienda(id);
    setVersion((v) => v + 1);
  }, []);

  async function prepararTienda(anterior) {
    usarTienda(await pedirTienda(anterior));
  }

  useEffect(() => {
    pedirTienda(leerTiendaGuardada()).then(usarTienda, () => setErrorDeCarga(true));
  }, [usarTienda]);

  useEffect(() => {
    final.current?.scrollIntoView({ block: 'end' });
  }, [mensajes, enviando]);

  function agregar(...nuevos) {
    setMensajes((anteriores) => [...anteriores, ...nuevos.map(conId)]);
  }

  function empezarChat(...extra) {
    setMensajes([conId({ de: 'pagina', texto: saludo }), ...extra.map(conId)]);
  }

  // Si la prueba venció (pasaron varios días), se arma una nueva.
  async function renovarSiVencio(datos) {
    if (datos?.codigo !== 'tienda-vencida') return false;
    await prepararTienda(null);
    empezarChat({
      de: 'aviso',
      texto: 'Tu prueba anterior venció, así que empezamos una nueva. Probá de nuevo.',
    });
    return true;
  }

  async function enviar({ texto: contenido, foto, muestra, accion }) {
    if (enviando || !tienda) return;
    setEsperando(foto || muestra ? 'leyendo' : 'escribiendo');

    try {
      const formulario = new FormData();
      formulario.set('tienda', tienda);
      if (accion) formulario.set('accion', accion);
      if (contenido) {
        formulario.set('texto', contenido);
        agregar({ de: 'norma', texto: contenido });
      }
      if (muestra) {
        const respuesta = await fetch(muestra);
        if (!respuesta.ok) throw new Error('No se pudo cargar la foto de ejemplo.');
        foto = await respuesta.blob();
      }
      if (foto) {
        const liviana = await achicarFoto(foto);
        formulario.set('foto', liviana, 'foto.jpg');
        agregar({ de: 'norma', foto: URL.createObjectURL(liviana) });
      }

      const respuesta = await fetch('/api/mensaje', { method: 'POST', body: formulario });
      const datos = await respuesta.json();
      if (await renovarSiVencio(datos)) return;
      if (!respuesta.ok) throw new Error(datos.error);

      agregar(...datos.respuestas.map((r) => ({ de: 'pagina', ...r })));
      if (datos.huboCambios) setVersion((v) => v + 1);
    } catch (error) {
      agregar({
        de: 'aviso',
        texto: `No se pudo enviar. ${error?.message ?? ''} Probá de nuevo.`.replace(/\s+/g, ' '),
      });
    } finally {
      setEsperando(null);
    }
  }

  function enviarTexto(evento) {
    evento.preventDefault();
    const contenido = texto.trim();
    if (!contenido) return;
    setTexto('');
    enviar({ texto: contenido });
  }

  function elegirFoto(evento) {
    const foto = evento.target.files?.[0];
    evento.target.value = '';
    if (foto) enviar({ foto });
  }

  async function reiniciar() {
    if (enviando || !tienda) return;
    setEsperando('escribiendo');
    try {
      const respuesta = await fetch('/api/reiniciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tienda }),
      });
      const datos = await respuesta.json();
      if (await renovarSiVencio(datos)) return;
      if (!respuesta.ok) throw new Error();
      empezarChat();
      setVersion((v) => v + 1);
    } catch {
      agregar({ de: 'aviso', texto: 'No se pudo empezar de nuevo. Probá otra vez.' });
    } finally {
      setEsperando(null);
    }
  }

  const listo = Boolean(tienda);
  const ocupado = enviando || !listo;
  const ultimo = mensajes.at(-1);
  const botones = !ocupado && ultimo?.de === 'pagina' ? ultimo.botones : null;
  const direccion = tienda ? `/prueba/${tienda}` : null;

  return (
    <div className={estilos.simulador}>
      <section className={estilos.explicacion}>
        <h1>El WhatsApp de Norma</h1>
        <p>
          Esto simula el WhatsApp de Norma con El Taller, el contacto que mantiene su página al
          día. Mandá una foto o escribí como si fueras ella y mirá cómo cambia la página. Es tu
          propia copia de prueba: lo que hagas no le cambia nada a nadie más.
        </p>
        <div className={estilos.acciones}>
          <button type="button" onClick={() => enviar({ accion: 'repaso' })} disabled={ocupado}>
            Simular el repaso semanal
          </button>
          <button type="button" onClick={reiniciar} disabled={ocupado}>
            Empezar de nuevo
          </button>
          {direccion && (
            <a href={direccion} target="_blank" rel="noreferrer">
              Abrir la página
            </a>
          )}
        </div>
      </section>

      <div className={estilos.columnas}>
        <section className={estilos.chat} aria-label="Chat de Norma con El Taller">
          <header className={estilos.contacto}>
            <span className={estilos.avatar} aria-hidden="true">
              T
            </span>
            <span>El Taller</span>
          </header>

          <ol className={estilos.mensajes} aria-live="polite">
            {mensajes.map((mensaje) => (
              <li key={mensaje.id} className={estilos[mensaje.de]}>
                {mensaje.foto && <img src={mensaje.foto} alt="Foto de la pieza" />}
                {mensaje.texto && <p>{mensaje.texto}</p>}
              </li>
            ))}
            {!listo && !errorDeCarga && <li className={estilos.escribiendo}>Preparando tu prueba…</li>}
            {errorDeCarga && (
              <li className={estilos.aviso}>
                <p>No se pudo preparar la prueba. Recargá la página para intentar de nuevo.</p>
              </li>
            )}
            {enviando && (
              <li className={estilos.escribiendo}>
                {esperando === 'leyendo' ? 'Mirando el cartelito…' : 'Escribiendo…'}
              </li>
            )}
            <li ref={final} aria-hidden="true" />
          </ol>

          {botones && (
            <div className={estilos.botones}>
              {botones.map((opcion) => (
                <button key={opcion} type="button" onClick={() => enviar({ texto: opcion })}>
                  {opcion}
                </button>
              ))}
            </div>
          )}

          <div className={estilos.muestras}>
            <p>¿No tenés una pieza a mano? Tocá una foto para mandarla:</p>
            <div className={estilos.muestrasFotos}>
              {MUESTRAS.map((muestra) => (
                <button
                  key={muestra.foto}
                  type="button"
                  onClick={() => enviar({ muestra: muestra.foto })}
                  disabled={ocupado}
                  aria-label={`Mandar la foto de ejemplo: ${muestra.nombre}`}
                >
                  <img src={muestra.foto} alt="" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          </div>

          <form className={estilos.entrada} onSubmit={enviarTexto}>
            <input
              ref={selectorDeFoto}
              type="file"
              accept="image/*"
              hidden
              onChange={elegirFoto}
            />
            <button
              type="button"
              className={estilos.botonFoto}
              onClick={() => selectorDeFoto.current?.click()}
              disabled={ocupado}
            >
              Foto
            </button>
            <input
              type="text"
              value={texto}
              onChange={(evento) => setTexto(evento.target.value)}
              placeholder="Escribí un mensaje"
              aria-label="Mensaje"
              maxLength={300}
              autoComplete="off"
            />
            <button type="submit" className={estilos.botonEnviar} disabled={ocupado || !texto.trim()}>
              Enviar
            </button>
          </form>
        </section>

        <section className={estilos.vista} aria-label="La página de Norma">
          {direccion && <iframe key={version} src={direccion} title="La página de Norma" />}
        </section>
      </div>
    </div>
  );
}
