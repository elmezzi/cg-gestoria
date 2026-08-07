/* ============================================================
   Asistente CG — Widget de chat con IA + derivación a WhatsApp
   Se auto-inyecta en la página. Solo requiere incluir este archivo:
   <script src="cg-chat-widget.js" defer></script>
   Configuración editable abajo (CG_CONFIG).
   ============================================================ */
(function () {
  const CG_CONFIG = {
    endpoint: '/api/chat',                 // ruta del backend (mismo dominio en Vercel)
    whatsapp: '5491125114119',             // número con código de país, sin +
    saludo: '¡Hola! 👋 Soy el asistente de Estudio CG. ¿En qué trámite te puedo ayudar? Jubilaciones, monotributo, pensiones, ciudadanía y más.',
    titulo: 'Asistente CG',
    subtitulo: 'Normalmente respondemos al instante'
  };

  const waLink = (txt) =>
    `https://wa.me/${CG_CONFIG.whatsapp}?text=${encodeURIComponent(txt || 'Hola, quiero hacer una consulta')}`;

  // ---------- Estilos ----------
  const css = `
  .cgw-btn{position:fixed;bottom:24px;right:24px;z-index:9998;width:62px;height:62px;border-radius:50%;
    background:#25c368;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
    box-shadow:0 12px 32px rgba(37,195,104,.5);transition:.25s}
  .cgw-btn:hover{transform:scale(1.08)}
  .cgw-btn svg{width:32px;height:32px}
  .cgw-btn .cgw-ping{position:absolute;inset:0;border-radius:50%;border:2px solid #25c368;animation:cgw-ping 2s ease-out infinite}
  @keyframes cgw-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.6);opacity:0}}
  @media(prefers-reduced-motion:reduce){.cgw-btn .cgw-ping{display:none}}

  .cgw-panel{position:fixed;bottom:100px;right:24px;z-index:9999;width:370px;max-width:calc(100vw - 32px);
    height:540px;max-height:calc(100vh - 130px);background:#0e161c;border:1px solid rgba(255,255,255,.12);
    border-radius:20px;box-shadow:0 30px 80px rgba(0,0,0,.55);display:none;flex-direction:column;overflow:hidden;
    font-family:'Archivo',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;transform:translateY(16px);opacity:0;
    transition:transform .3s ease,opacity .3s ease}
  .cgw-panel.cgw-open{display:flex;transform:translateY(0);opacity:1}

  .cgw-head{background:linear-gradient(135deg,#1f4a52,#111c23);padding:16px 18px;display:flex;align-items:center;gap:12px;
    border-bottom:1px solid rgba(255,255,255,.1)}
  .cgw-avatar{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,#3fb8ae,#2f8f88);
    display:flex;align-items:center;justify-content:center;color:#04211d;font-weight:800;font-size:1rem;flex-shrink:0}
  .cgw-head h4{margin:0;color:#fff;font-size:1rem;font-weight:800}
  .cgw-head p{margin:0;color:#7fd8ce;font-size:.74rem;display:flex;align-items:center;gap:6px}
  .cgw-head p::before{content:"";width:7px;height:7px;border-radius:50%;background:#25c368;box-shadow:0 0 8px #25c368}
  .cgw-close{margin-left:auto;background:none;border:none;color:#8794ad;font-size:1.5rem;cursor:pointer;line-height:1;padding:4px}
  .cgw-close:hover{color:#fff}

  .cgw-body{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;background:#0a1014}
  .cgw-body::-webkit-scrollbar{width:6px}
  .cgw-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:3px}

  .cgw-msg{max-width:82%;padding:11px 14px;border-radius:14px;font-size:.92rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
  .cgw-bot{align-self:flex-start;background:#16232c;color:#eef2f9;border:1px solid rgba(255,255,255,.08);border-bottom-left-radius:4px}
  .cgw-user{align-self:flex-end;background:linear-gradient(135deg,#3fb8ae,#2f8f88);color:#04211d;font-weight:600;border-bottom-right-radius:4px}

  .cgw-typing{align-self:flex-start;background:#16232c;border:1px solid rgba(255,255,255,.08);padding:13px 16px;border-radius:14px;border-bottom-left-radius:4px;display:flex;gap:5px}
  .cgw-typing span{width:7px;height:7px;border-radius:50%;background:#7fd8ce;animation:cgw-blink 1.3s infinite both}
  .cgw-typing span:nth-child(2){animation-delay:.2s}.cgw-typing span:nth-child(3){animation-delay:.4s}
  @keyframes cgw-blink{0%,80%,100%{opacity:.25}40%{opacity:1}}

  .cgw-wa-derivar{align-self:flex-start;max-width:88%}
  .cgw-wa-derivar a{display:inline-flex;align-items:center;gap:9px;background:#25c368;color:#04180d;font-weight:700;
    text-decoration:none;padding:11px 18px;border-radius:12px;font-size:.9rem;box-shadow:0 8px 20px rgba(37,195,104,.3);transition:.2s}
  .cgw-wa-derivar a:hover{transform:translateY(-2px)}
  .cgw-wa-derivar a svg{width:20px;height:20px}

  .cgw-foot{padding:12px;border-top:1px solid rgba(255,255,255,.1);background:#0e161c;display:flex;gap:8px}
  .cgw-foot input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;
    padding:12px 14px;color:#fff;font-family:inherit;font-size:.92rem;outline:none}
  .cgw-foot input:focus{border-color:#3fb8ae;box-shadow:0 0 0 3px rgba(63,184,174,.14)}
  .cgw-foot input::placeholder{color:#5f6c86}
  .cgw-send{background:linear-gradient(135deg,#3fb8ae,#2f8f88);border:none;border-radius:12px;width:46px;flex-shrink:0;
    cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s}
  .cgw-send:hover{filter:brightness(1.1)}.cgw-send:disabled{opacity:.5;cursor:default}
  .cgw-send svg{width:20px;height:20px}
  .cgw-disc{text-align:center;font-size:.68rem;color:#5f6c86;padding:0 12px 10px;background:#0e161c}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.9 4.43-9.9 9.88 0 1.74.46 3.44 1.32 4.94L2 22l5.32-1.39c1.45.79 3.08 1.21 4.72 1.21 5.46 0 9.9-4.43 9.9-9.88C21.94 6.43 17.5 2 12.04 2zm0 18.02c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 4.54 0 8.24 3.69 8.24 8.23 0 4.54-3.7 8.24-8.24 8.24zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28z"/></svg>';

  // ---------- Estructura ----------
  const btn = document.createElement('button');
  btn.className = 'cgw-btn';
  btn.setAttribute('aria-label', 'Abrir chat con el asistente');
  btn.innerHTML = '<span class="cgw-ping"></span>' + WA_SVG.replace('fill="currentColor"', 'fill="#fff"');

  const panel = document.createElement('div');
  panel.className = 'cgw-panel';
  panel.innerHTML = `
    <div class="cgw-head">
      <div class="cgw-avatar">CG</div>
      <div>
        <h4>${CG_CONFIG.titulo}</h4>
        <p>${CG_CONFIG.subtitulo}</p>
      </div>
      <button class="cgw-close" aria-label="Cerrar">×</button>
    </div>
    <div class="cgw-body" id="cgw-body"></div>
    <div class="cgw-foot">
      <input id="cgw-input" type="text" placeholder="Escribí tu consulta..." autocomplete="off">
      <button class="cgw-send" id="cgw-send" aria-label="Enviar">
        <svg viewBox="0 0 24 24" fill="none" stroke="#04211d" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      </button>
    </div>
    <div class="cgw-disc">Asistente virtual · puede cometer errores</div>
  `;

  document.body.appendChild(btn);
  document.body.appendChild(panel);

  const body = panel.querySelector('#cgw-body');
  const input = panel.querySelector('#cgw-input');
  const sendBtn = panel.querySelector('#cgw-send');
  const closeBtn = panel.querySelector('.cgw-close');

  let history = [];       // historial para la API
  let saludoMostrado = false;
  let esperando = false;

  function abrir() {
    panel.classList.add('cgw-open');
    if (!saludoMostrado) {
      addBot(CG_CONFIG.saludo);
      saludoMostrado = true;
    }
    setTimeout(() => input.focus(), 300);
  }
  function cerrar() { panel.classList.remove('cgw-open'); }

  btn.addEventListener('click', () => panel.classList.contains('cgw-open') ? cerrar() : abrir());
  closeBtn.addEventListener('click', cerrar);

  function scrollAbajo() { body.scrollTop = body.scrollHeight; }

  function addBot(texto) {
    const d = document.createElement('div');
    d.className = 'cgw-msg cgw-bot';
    d.textContent = texto;
    body.appendChild(d);
    scrollAbajo();
  }
  function addUser(texto) {
    const d = document.createElement('div');
    d.className = 'cgw-msg cgw-user';
    d.textContent = texto;
    body.appendChild(d);
    scrollAbajo();
  }
  function addDerivar(texto) {
    const cont = document.createElement('div');
    cont.className = 'cgw-wa-derivar';
    cont.innerHTML = `<a href="${waLink(texto)}" target="_blank" rel="noopener">${WA_SVG} Hablar con un asesor</a>`;
    body.appendChild(cont);
    scrollAbajo();
  }
  function mostrarTyping() {
    const t = document.createElement('div');
    t.className = 'cgw-typing';
    t.id = 'cgw-typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(t);
    scrollAbajo();
  }
  function quitarTyping() {
    const t = document.getElementById('cgw-typing');
    if (t) t.remove();
  }

  async function enviar() {
    const texto = input.value.trim();
    if (!texto || esperando) return;
    addUser(texto);
    history.push({ role: 'user', content: texto });
    input.value = '';
    esperando = true;
    sendBtn.disabled = true;
    mostrarTyping();

    try {
      const r = await fetch(CG_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await r.json();
      quitarTyping();

      const reply = (data.reply || 'Disculpá, no pude procesar tu consulta.').trim();
      if (reply) {
        addBot(reply);
        history.push({ role: 'assistant', content: reply });
      }
      if (data.derivar) {
        addDerivar('Hola, vengo del sitio web y quería hacer una consulta: ' + texto);
      }
    } catch (e) {
      quitarTyping();
      addBot('Tuve un problema de conexión. Escribinos directamente por WhatsApp y te ayudamos.');
      addDerivar('Hola, quiero hacer una consulta');
    } finally {
      esperando = false;
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', enviar);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') enviar(); });
})();
