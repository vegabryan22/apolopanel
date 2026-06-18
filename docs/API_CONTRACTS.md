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
    "status": "online"
  }
]
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
  }
}
```
