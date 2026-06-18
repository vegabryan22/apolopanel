# ApoloPanel

Panel de administración de hosting para VPS, inspirado en flujos tipo Plesk/cPanel, pero diseñado como una plataforma propia, modular, auditable y segura.

## Objetivo

Construir un panel para administrar:

- Servidores VPS.
- Dominios y DNS.
- Sitios web.
- Certificados SSL.
- Bases de datos.
- Backups.
- Servicios del sistema.
- Usuarios, roles y auditoría.

## Arquitectura

ApoloPanel se divide en tres piezas principales:

- `apps/web`: interfaz administrativa.
- `apps/api`: API central/control plane.
- `apps/agent`: agente instalado en cada VPS para ejecutar tareas locales.
- `packages/shared`: tipos, contratos y utilidades compartidas.

La API nunca debe ejecutar comandos del sistema directamente sobre un VPS remoto. Esa responsabilidad pertenece al agente, usando comandos permitidos, auditoría y validación estricta.

## Estado

Versión inicial de arquitectura y scaffold profesional.

## Requisitos

- Node.js 20+
- pnpm 9+
- Git

## Comandos

```bash
pnpm install
docker compose up -d
pnpm db:generate
pnpm db:migrate
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
```

Si `pnpm` no está instalado globalmente, usa:

```bash
npx pnpm@9.12.0 install
npx pnpm@9.12.0 db:generate
npx pnpm@9.12.0 db:migrate
npx pnpm@9.12.0 dev
```

## Documentación

- `docs/ARCHITECTURE.md`
- `docs/ROADMAP.md`
- `docs/SECURITY_MODEL.md`
- `docs/ENGINEERING.md`
- `docs/API_CONTRACTS.md`
