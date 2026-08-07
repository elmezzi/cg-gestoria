# Estudio CG — Sitio con asistente de IA

Este proyecto es tu sitio web con un **chat asistido por IA (Claude)** que responde
consultas frecuentes y, cuando no sabe o el caso es complejo, ofrece un botón para
**derivar a tu WhatsApp**.

## Cómo funciona (en simple)

- El visitante escribe en el chat del sitio.
- El navegador NO tiene tu clave de API. Le manda el mensaje a tu backend (`/api/chat`).
- El backend (que corre en Vercel) es el único que conoce tu clave secreta y le pregunta a Claude.
- Claude responde. Si detecta que no puede resolverlo, agrega una marca oculta y el sitio
  muestra el botón verde "Hablar con un asesor" que abre tu WhatsApp con el mensaje ya cargado.

Así tu clave nunca queda expuesta y no te la pueden robar.

## Estructura de archivos

```
cg-chat-ia/
├── api/
│   └── chat.js              ← backend (habla con Claude, guarda la clave en secreto)
├── public/
│   ├── index.html           ← tu sitio web
│   └── cg-chat-widget.js    ← el chat que se ve abajo a la derecha
├── vercel.json
├── package.json
├── .env.example
└── COMO-PUBLICARLO.md       ← este archivo
```

---

## Publicarlo en Vercel (gratis) — paso a paso

### 1. Conseguir la clave de API de Anthropic
1. Entrá a https://console.anthropic.com
2. Creá una cuenta (o iniciá sesión) y cargá algo de crédito (con muy poco alcanza:
   cada consulta cuesta fracciones de centavo).
3. Andá a **API Keys** → **Create Key**. Copiá la clave (empieza con `sk-ant-...`).
   Guardala: no se vuelve a mostrar.

### 2. Subir el proyecto
Tenés dos formas:

**A) Con GitHub (recomendado)**
1. Creá un repositorio en https://github.com y subí esta carpeta.
2. En https://vercel.com iniciá sesión con GitHub.
3. **Add New → Project → Import** tu repositorio.

**B) Sin GitHub (con la terminal)**
```bash
npm i -g vercel
cd cg-chat-ia
vercel
```
Seguí las preguntas (aceptá las opciones por defecto).

### 3. Cargar tu clave secreta en Vercel
1. En el panel de tu proyecto en Vercel: **Settings → Environment Variables**.
2. Agregá:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu clave `sk-ant-...`
3. Guardá y hacé **Redeploy** (Deployments → ⋯ → Redeploy) para que tome la variable.

### 4. Listo
Vercel te da una URL tipo `https://tu-proyecto.vercel.app`. Abrila y probá el chat.
Después podés conectar tu dominio propio (ej. `cggestoria.com.ar`) desde
**Settings → Domains**.

---

## Cómo editar el asistente

- **Qué sabe / cómo responde:** editá el texto `SYSTEM_PROMPT` en `api/chat.js`.
  Ahí están los datos del estudio, los servicios y las reglas. Agregá o cambiá lo que quieras.
- **Número de WhatsApp / saludo / textos del chat:** editá `CG_CONFIG` arriba de todo
  en `public/cg-chat-widget.js`.
- **Cuándo deriva a WhatsApp:** el asistente deriva solo cuando no sabe, cuando piden
  precios/plazos concretos, o cuando la persona pide hablar con alguien. Podés ajustar
  esa regla en el `SYSTEM_PROMPT` (regla 3).

## Costos
- **Hosting en Vercel:** gratis para este uso.
- **API de Claude:** pagás por uso. Con el modelo configurado (Claude Sonnet) y respuestas
  cortas, el costo por consulta es de fracciones de centavo de dólar. Podés ponerle un
  límite de gasto mensual desde la consola de Anthropic (Billing → Limits).

## Nota de seguridad
- Nunca pongas la clave `sk-ant-...` dentro de `index.html` ni de `cg-chat-widget.js`.
  Va SOLO en las variables de entorno de Vercel (o en un archivo `.env` local que no subas).
- El archivo `.env` no debe subirse a GitHub (agregalo a `.gitignore`).
