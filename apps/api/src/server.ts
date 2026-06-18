import cors from "@fastify/cors";
import Fastify from "fastify";
import type {
  AuditEvent,
  CreateServerInput,
  DashboardSummary,
  ServerStatus,
  ServerSummary
} from "@apolopanel/shared";
import { disconnectDatabase, prisma } from "./database.js";
import { toAuditEvent, toPrismaServerStatus, toServerDetails } from "./mappers.js";

const port = Number(process.env.API_PORT ?? 4000);

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true
});

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

async function addAuditEvent(action: string, resourceType: string, resourceId: string) {
  await prisma.auditEvent.create({
    data: {
      action,
      resourceType,
      resourceId,
      serverId: resourceType === "server" ? resourceId : null
    }
  });
}

async function ensureDefaultServer() {
  const totalServers = await prisma.server.count();

  if (totalServers > 0) {
    return;
  }

  const server = await prisma.server.create({
    data: {
      name: "VPS Principal",
      hostname: "vps.local",
      agentEndpoint: "http://127.0.0.1:4100",
      description: "Servidor inicial para desarrollo local."
    }
  });

  await addAuditEvent("server.seeded", "server", server.id);
}

app.get("/health", async () => ({
  status: "ok",
  service: "api"
}));

app.get("/dashboard", async (): Promise<DashboardSummary> => {
  const [total, online, offline, degraded, unknown, domains, websites] =
    await Promise.all([
      prisma.server.count(),
      prisma.server.count({ where: { status: "ONLINE" } }),
      prisma.server.count({ where: { status: "OFFLINE" } }),
      prisma.server.count({ where: { status: "DEGRADED" } }),
      prisma.server.count({ where: { status: "UNKNOWN" } }),
      prisma.domain.count(),
      prisma.website.count()
    ]);

  return {
    servers: {
      total,
      online,
      offline,
      degraded,
      unknown
    },
    domains: {
      total: domains
    },
    websites: {
      total: websites
    },
    backups: {
      total: 0
    }
  };
});

app.get("/servers", async (): Promise<ServerSummary[]> => {
  const servers = await prisma.server.findMany({
    orderBy: {
      createdAt: "asc"
    }
  });

  return servers.map(toServerDetails);
});

app.get<{ Params: { id: string } }>("/servers/:id", async (request, reply) => {
  const server = await prisma.server.findUnique({
    where: {
      id: request.params.id
    }
  });

  if (!server) {
    return reply.code(404).send({
      error: "not_found",
      message: "Servidor no encontrado."
    });
  }

  return toServerDetails(server);
});

app.post("/servers", async (request, reply) => {
  try {
    const input = validateCreateServerInput(request.body);
    const server = await prisma.server.create({
      data: {
        name: input.name,
        hostname: input.hostname,
        agentEndpoint: input.agentEndpoint ?? null
      }
    });

    await addAuditEvent("server.created", "server", server.id);

    return reply.code(201).send(toServerDetails(server));
  } catch (error) {
    return reply.code(400).send({
      error: "validation_error",
      message: error instanceof Error ? error.message : "Solicitud inválida."
    });
  }
});

app.patch<{ Params: { id: string } }>("/servers/:id/status", async (request, reply) => {
  const server = await prisma.server.findUnique({
    where: {
      id: request.params.id
    }
  });

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

  const updatedServer = await prisma.server.update({
    where: {
      id: server.id
    },
    data: {
      status: toPrismaServerStatus(body.status),
      lastSeenAt: body.status === "online" ? new Date() : server.lastSeenAt
    }
  });

  await addAuditEvent("server.status_updated", "server", server.id);

  return toServerDetails(updatedServer);
});

app.get("/audit-events", async (): Promise<AuditEvent[]> => {
  const events = await prisma.auditEvent.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 50
  });

  return events.map(toAuditEvent);
});

await ensureDefaultServer();

await app.listen({
  port,
  host: "0.0.0.0"
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  });
}
