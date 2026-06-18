import cors from "@fastify/cors";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import type {
  AuditEvent,
  CreateServerInput,
  DashboardSummary,
  ServerDetails,
  ServerStatus,
  ServerSummary
} from "@apolopanel/shared";

const port = Number(process.env.API_PORT ?? 4000);

const app = Fastify({
  logger: true
});

const now = new Date().toISOString();

const servers = new Map<string, ServerDetails>([
  [
    "srv_001",
    {
      id: "srv_001",
      name: "VPS Principal",
      hostname: "vps.local",
      status: "unknown",
      agentEndpoint: "http://127.0.0.1:4100",
      description: "Servidor inicial para desarrollo local.",
      lastSeenAt: null,
      createdAt: now,
      updatedAt: now
    }
  ]
]);

const auditEvents: AuditEvent[] = [];

await app.register(cors, {
  origin: true
});

function createId(prefix: string) {
  return `${prefix}_${randomUUID().replaceAll("-", "").slice(0, 12)}`;
}

function addAuditEvent(action: string, resourceType: string, resourceId: string) {
  auditEvents.unshift({
    id: createId("aud"),
    actorId: "system",
    action,
    resourceType,
    resourceId,
    result: "success",
    createdAt: new Date().toISOString()
  });
}

function toServerSummary(server: ServerDetails): ServerSummary {
  return {
    id: server.id,
    name: server.name,
    hostname: server.hostname,
    status: server.status,
    agentEndpoint: server.agentEndpoint,
    createdAt: server.createdAt,
    updatedAt: server.updatedAt
  };
}

function validateServerStatus(status: unknown): status is ServerStatus {
  return (
    status === "online" ||
    status === "offline" ||
    status === "degraded" ||
    status === "unknown"
  );
}

function validateCreateServerInput(payload: unknown): CreateServerInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("El cuerpo de la solicitud debe ser un objeto.");
  }

  const body = payload as Record<string, unknown>;

  if (typeof body.name !== "string" || body.name.trim().length < 3) {
    throw new Error("El nombre del servidor debe tener al menos 3 caracteres.");
  }

  if (typeof body.hostname !== "string" || body.hostname.trim().length < 3) {
    throw new Error("El hostname del servidor debe tener al menos 3 caracteres.");
  }

  if (
    body.agentEndpoint !== undefined &&
    body.agentEndpoint !== null &&
    typeof body.agentEndpoint !== "string"
  ) {
    throw new Error("El endpoint del agente debe ser texto o null.");
  }

  return {
    name: body.name.trim(),
    hostname: body.hostname.trim(),
    agentEndpoint:
      typeof body.agentEndpoint === "string" && body.agentEndpoint.trim().length > 0
        ? body.agentEndpoint.trim()
        : null
  };
}

app.get("/health", async () => ({
  status: "ok",
  service: "api"
}));

app.get("/dashboard", async (): Promise<DashboardSummary> => {
  const allServers = Array.from(servers.values());

  return {
    servers: {
      total: allServers.length,
      online: allServers.filter((server) => server.status === "online").length,
      offline: allServers.filter((server) => server.status === "offline").length,
      degraded: allServers.filter((server) => server.status === "degraded").length,
      unknown: allServers.filter((server) => server.status === "unknown").length
    },
    domains: {
      total: 0
    },
    websites: {
      total: 0
    },
    backups: {
      total: 0
    }
  };
});

app.get(
  "/servers",
  async (): Promise<ServerSummary[]> => Array.from(servers.values()).map(toServerSummary)
);

app.get<{ Params: { id: string } }>("/servers/:id", async (request, reply) => {
  const server = servers.get(request.params.id);

  if (!server) {
    return reply.code(404).send({
      error: "not_found",
      message: "Servidor no encontrado."
    });
  }

  return server;
});

app.post("/servers", async (request, reply) => {
  try {
    const input = validateCreateServerInput(request.body);
    const timestamp = new Date().toISOString();
    const server: ServerDetails = {
      id: createId("srv"),
      name: input.name,
      hostname: input.hostname,
      status: "unknown",
      agentEndpoint: input.agentEndpoint ?? null,
      description: null,
      lastSeenAt: null,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    servers.set(server.id, server);
    addAuditEvent("server.created", "server", server.id);

    return reply.code(201).send(server);
  } catch (error) {
    return reply.code(400).send({
      error: "validation_error",
      message: error instanceof Error ? error.message : "Solicitud inválida."
    });
  }
});

app.patch<{ Params: { id: string } }>("/servers/:id/status", async (request, reply) => {
  const server = servers.get(request.params.id);

  if (!server) {
    return reply.code(404).send({
      error: "not_found",
      message: "Servidor no encontrado."
    });
  }

  const body = request.body as Record<string, unknown> | null;

  if (!validateServerStatus(body?.status)) {
    return reply.code(400).send({
      error: "validation_error",
      message: "Estado de servidor inválido."
    });
  }

  const updatedServer: ServerDetails = {
    ...server,
    status: body.status,
    lastSeenAt: body.status === "online" ? new Date().toISOString() : server.lastSeenAt,
    updatedAt: new Date().toISOString()
  };

  servers.set(server.id, updatedServer);
  addAuditEvent("server.status_updated", "server", server.id);

  return updatedServer;
});

app.get("/audit-events", async (): Promise<AuditEvent[]> => auditEvents.slice(0, 50));

await app.listen({
  port,
  host: "0.0.0.0"
});
