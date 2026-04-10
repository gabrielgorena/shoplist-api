# ShopList API

Backend de ShopList construido con NestJS y Supabase.

## Stack

- NestJS 11
- TypeScript
- Supabase JS client
- class-validator / class-transformer

## Requisitos

- Node.js 20 o superior
- npm
- Un proyecto de Supabase

## Variables de entorno

Crear un archivo `.env` en la raiz de este proyecto.

Puedes copiar la base desde `.env.example`:

```bash
cp .env.example .env
```

Variables requeridas:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
FRONTEND_URL=http://localhost:3000
PORT=3001
```

### Que significa cada variable

- `SUPABASE_URL`: URL del proyecto de Supabase.
- `SUPABASE_SERVICE_ROLE_KEY`: service role key de Supabase. La usa el backend para validar auth y operar con privilegios de servidor.
- `FRONTEND_URL`: origen permitido para CORS.
- `PORT`: puerto donde escucha la API.

## Levantar local

Instalar dependencias:

```bash
npm install
```

Ejecutar en desarrollo:

```bash
npm run start:dev
```

La API queda disponible en:

```text
http://localhost:3001
```

Healthcheck:

```text
http://localhost:3001/health
```

## Scripts utiles

```bash
npm run start:dev
npm run build
npm run start:prod
npm run lint
npm test -- --runInBand
```

Nota:

- El repo hoy no tiene tests utiles implementados.
- `npm test -- --runInBand` puede no encontrar tests si no agregas specs reales.

## Arquitectura rapida

La API esta separada por dominios:

- `src/families`
- `src/items`
- `src/stores`
- `src/profiles`
- `src/auth`
- `src/supabase`

Patron principal:

- `controller`: recibe HTTP
- `service`: aplica logica de negocio y acceso a datos
- `dto`: valida payloads de entrada

## Flujo local completo

Para usar la app completa localmente:

1. Levantar esta API en `http://localhost:3001`
2. Configurar el frontend `shoplist` con `NEXT_PUBLIC_API_URL=http://localhost:3001`
3. Levantar el frontend en `http://localhost:3000`

## Build y runtime en produccion

El backend esta preparado para:

- compilar con `npm run build`
- arrancar con `node dist/main.js`
- escuchar en `0.0.0.0` usando `PORT`

Eso es importante para providers como Render.

## Deploy a produccion

Produccion actual:

- Hosting: Render
- URL publica: `https://shoplist-api.onrender.com`

### Como se despliega hoy

Este servicio esta conectado al repo de GitHub, pero el deploy se esta haciendo manualmente desde Render.

Pasos:

1. Hacer push a `main`
2. Ir al servicio `shoplist-api` en Render
3. Elegir `Manual Deploy`
4. Elegir `Deploy latest commit`

### Variables requeridas en Render

Configurar estas variables en el dashboard del servicio:

```env
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FRONTEND_URL=https://shoplist-red.vercel.app
PORT=10000
```

Nota:

- Render puede inyectar su propio `PORT`. La aplicacion ya esta preparada para usarlo.
- Si defines `PORT` manualmente, asegurate de que coincida con lo esperado por Render o simplemente deja que Render lo maneje.

### Build y start command esperados en Render

Build command:

```bash
npm install && npm run build
```

Start command:

```bash
node dist/main.js
```

## Notas importantes

- `.env` local no debe subirse al repo.
- `.env.example` es solo documentacion.
- Si local y produccion usan el mismo proyecto de Supabase, ambos comparten la misma base de datos.
