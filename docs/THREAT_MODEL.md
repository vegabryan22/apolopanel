# Threat Model

## Activos críticos

- Acceso root/sudo del VPS.
- Tokens API-agente.
- Credenciales de usuarios.
- Certificados SSL.
- Backups.
- Bases de datos.

## Amenazas principales

- Ejecución remota arbitraria.
- Escalada de privilegios.
- Robo de tokens.
- Exposición de backups.
- Cambios DNS maliciosos.
- Borrado accidental de sitios.

## Mitigaciones iniciales

- Allowlist de acciones del agente.
- Auditoría obligatoria.
- Secretos fuera del repositorio.
- Roles mínimos.
- Confirmación doble para acciones destructivas.
- Backups antes de operaciones críticas.

