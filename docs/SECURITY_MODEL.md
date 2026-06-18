# Modelo de Seguridad

## Reglas base

- No guardar contraseñas en texto plano.
- No ejecutar comandos arbitrarios enviados por la UI.
- No permitir que la API ejecute comandos shell directamente sobre VPS.
- Toda acción crítica debe quedar auditada.
- Las credenciales deben vivir en variables de entorno o secret manager.

## Agente VPS

El agente debe implementar una lista explícita de acciones permitidas.

Ejemplos permitidos:

- Consultar métricas del sistema.
- Reiniciar servicios autorizados.
- Crear configuración de sitio usando templates controlados.
- Emitir certificados SSL con parámetros validados.

Ejemplos prohibidos:

- Ejecutar shell arbitrario desde la UI.
- Subir scripts sin validación.
- Desactivar firewall sin doble confirmación.
- Exponer tokens en logs.

## Autorización

Roles iniciales:

- `owner`: control total.
- `admin`: administración operativa.
- `operator`: acciones limitadas.
- `viewer`: solo lectura.

## Auditoría

Debe registrarse:

- Usuario.
- Acción.
- Recurso afectado.
- IP/origen.
- Fecha.
- Resultado.

