# Architectural Decision Records

Este archivo resume decisiones técnicas importantes.

## ADR-001: Monorepo

Se usa monorepo para mantener juntos frontend, API, agente y contratos compartidos.

Consecuencia:

- Mejor consistencia de tipos.
- Más fácil refactorizar contratos.
- Requiere disciplina en límites entre paquetes.

## ADR-002: API y agente separados

La API central no ejecuta tareas del sistema directamente. El agente local del VPS es responsable de operaciones privilegiadas.

Consecuencia:

- Menor superficie de ataque.
- Mejor trazabilidad.
- Requiere protocolo seguro API-agente.

## ADR-003: TypeScript estricto

Todo el código inicial usa TypeScript con configuración estricta.

Consecuencia:

- Menos errores en contratos.
- Mayor costo inicial, pero mejor mantenibilidad.

## ADR-004: PostgreSQL interno y MySQL administrado

PostgreSQL se usa como base interna de ApoloPanel. MySQL/MariaDB se administra
como recurso de hosting para clientes y aplicaciones.

Consecuencia:

- Separación clara entre datos del panel y datos de clientes.
- Backups y permisos más fáciles de aislar.
- El agente debe manejar operaciones MySQL/MariaDB con allowlist.
