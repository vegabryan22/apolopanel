# Arquitectura

## Principios

- Separar interfaz, API y ejecución de tareas del sistema.
- Diseñar módulos pequeños y auditables.
- Evitar ejecución remota directa sin agente.
- Registrar toda acción administrativa relevante.
- Preferir APIs internas con contratos explícitos.

## Componentes

### Web

Aplicación administrativa para operadores y clientes. Consume únicamente la API central.

Responsabilidades:

- Login y sesión.
- Dashboard.
- Gestión visual de dominios, sitios, bases de datos, SSL y backups.
- Visualización de logs y auditoría.

### API

Control plane central. Coordina usuarios, permisos, recursos, servidores y jobs.

Responsabilidades:

- Autenticación y autorización.
- Orquestación de tareas.
- Persistencia de estado.
- Auditoría.
- Comunicación segura con agentes.

### Agent

Servicio instalado en cada VPS administrado.

Responsabilidades:

- Consultar métricas locales.
- Administrar servicios permitidos.
- Ejecutar tareas idempotentes.
- Reportar estado y resultados a la API.

## Flujo recomendado

1. Usuario solicita acción desde `apps/web`.
2. `apps/api` valida permisos y crea un job.
3. `apps/api` envía el job al agente correspondiente.
4. `apps/agent` valida que la acción esté permitida.
5. `apps/agent` ejecuta la tarea y reporta resultado.
6. `apps/api` registra auditoría y actualiza estado.

## Módulos iniciales

- Identity & Access.
- Servers.
- Domains.
- Websites.
- SSL.
- Databases.
- Backups.
- Audit Log.
