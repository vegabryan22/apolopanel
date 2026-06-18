# Security Policy

## Reporte de vulnerabilidades

Reporta vulnerabilidades directamente al equipo mantenedor del proyecto.

No publiques credenciales, tokens, claves SSH, dumps de base de datos ni logs sensibles en issues públicos.

## Alcance inicial

Este proyecto administrará infraestructura real. Por eso, cualquier cambio que ejecute tareas del sistema debe:

- Pasar por validación explícita.
- Ser idempotente cuando sea posible.
- Registrar auditoría.
- Evitar comandos shell arbitrarios.

