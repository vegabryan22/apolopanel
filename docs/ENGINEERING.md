# Ingeniería

## Estándares

- TypeScript estricto.
- Validación de entrada en límites de sistema.
- Contratos compartidos en `packages/shared`.
- Commits con Conventional Commits.
- Versionamiento SemVer.
- Cambios documentados en `CHANGELOG.md`.

## Convenciones

### Ramas

- `main`: estable.
- `develop`: integración.
- `feature/*`: nuevas funcionalidades.
- `fix/*`: correcciones.
- `security/*`: parches de seguridad.

### Commits

Ejemplos:

- `feat(web): add dashboard shell`
- `fix(api): validate server id`
- `docs: add security model`
- `chore: configure workspace`

### Definition of Done

Una tarea se considera lista cuando:

- Tiene tipos correctos.
- Tiene validaciones mínimas.
- No rompe lint/typecheck.
- Incluye documentación si cambia comportamiento.
- Registra eventos relevantes si afecta infraestructura.
