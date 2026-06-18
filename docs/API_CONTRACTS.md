# Contratos API

## Health

`GET /health`

Respuesta:

```json
{
  "status": "ok",
  "service": "api"
}
```

## Servers

`GET /servers`

Respuesta:

```json
[
  {
    "id": "srv_001",
    "name": "VPS Principal",
    "hostname": "server.example.com",
    "status": "online",
    "agentEndpoint": "http://127.0.0.1:4100",
    "createdAt": "2026-06-17T00:00:00.000Z",
    "updatedAt": "2026-06-17T00:00:00.000Z"
  }
]
```

`GET /servers/:id`

Respuesta:

```json
{
  "id": "srv_001",
  "name": "VPS Principal",
  "hostname": "server.example.com",
  "status": "unknown",
  "agentEndpoint": "http://127.0.0.1:4100",
  "description": "Servidor inicial para desarrollo local.",
  "lastSeenAt": null,
  "createdAt": "2026-06-17T00:00:00.000Z",
  "updatedAt": "2026-06-17T00:00:00.000Z"
}
```

`POST /servers`

Cuerpo:

```json
{
  "name": "VPS Producción",
  "hostname": "vps.example.com",
  "agentEndpoint": "https://agent.example.com"
}
```

`PATCH /servers/:id/status`

Cuerpo:

```json
{
  "status": "online"
}
```

## Dashboard

`GET /dashboard`

Respuesta:

```json
{
  "servers": {
    "total": 1,
    "online": 0,
    "offline": 0,
    "degraded": 0,
    "unknown": 1
  },
  "domains": {
    "total": 0
  },
  "websites": {
    "total": 0
  },
  "backups": {
    "total": 0
  }
}
```

## Agent Metrics

`GET /metrics`

Respuesta:

```json
{
  "cpu": {
    "usagePercent": 12
  },
  "memory": {
    "usedMb": 1024,
    "totalMb": 4096
  },
  "disk": {
    "usedGb": 20,
    "totalGb": 80
  },
  "uptimeSeconds": 3600
}
```
