# Runbook

## Desarrollo local

1. Copiar `.env.example` a `.env`.
2. Instalar dependencias con `pnpm install`.
3. Levantar PostgreSQL con `docker compose up -d`.
4. Generar Prisma Client con `pnpm db:generate`.
5. Ejecutar migraciones con `pnpm db:migrate`.
6. Ejecutar `pnpm dev`.

Si `pnpm` no está disponible globalmente, usar `npx pnpm@9.12.0` antes del comando.

## Validación

```bash
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
```

## Puertos

- Web: `3000`
- API: `4000`
- Agent: `4100`
- PostgreSQL: `5432`
- MySQL administrado local: `3306`

## Endpoints rápidos

- `http://localhost:3000`
- `http://localhost:4000/health`
- `http://localhost:4000/dashboard`
- `http://localhost:4000/servers`
- `http://localhost:4100/metrics`

## Bases de datos

- PostgreSQL es la base interna de ApoloPanel.
- MySQL/MariaDB representa el servicio administrado para clientes y sitios web.
- No guardar datos internos del panel en MySQL de clientes.
