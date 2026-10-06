# Tresco

Hub de accesos rápidos de Big Pizza Colegiales. Next.js + libSQL (SQLite), instalable como PWA.

```bash
bun install
bun dev        # http://localhost:3000
bun run build
bun run lint
```

- Los links se editan en el array `LINKS` de `components/Home.tsx`.
- Los números de teléfono se guardan en SQLite (`lib/db.ts`, API en `app/api/phones`).

## Base de datos

**Local:** no hay que configurar nada. Se crea `tresco.db` en la raíz (está en `.gitignore`).

**Vercel:** el disco de Vercel no persiste, así que se usa [Turso](https://turso.tech) (SQLite hosteado, plan gratis):

```bash
turso db create tresco
turso db show tresco --url       # -> TURSO_DATABASE_URL
turso db tokens create tresco    # -> TURSO_AUTH_TOKEN
```

Cargar esas dos variables en Vercel → Project → Settings → Environment Variables. La tabla se crea sola en el primer request.

## PWA

- **iOS (Safari):** Compartir → "Agregar a inicio".
- **Android (Chrome):** menú ⋮ → "Instalar app" / "Agregar a pantalla principal".

Requiere HTTPS (Vercel ya lo da). Íconos: `public/icon-*.png`, `app/apple-icon.png`, `app/icon.svg`.
