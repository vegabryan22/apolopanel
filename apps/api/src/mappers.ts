import type { AuditEvent, ServerDetails, ServerStatus } from "@apolopanel/shared";
import type {
  AuditEvent as PrismaAuditEvent,
  Server as PrismaServer,
  ServerStatus as PrismaServerStatus
} from "@prisma/client";

const serverStatusMap = {
  ONLINE: "online",
  OFFLINE: "offline",
  DEGRADED: "degraded",
  UNKNOWN: "unknown"
} satisfies Record<PrismaServerStatus, ServerStatus>;

export function toApiServerStatus(status: PrismaServerStatus): ServerStatus {
  return serverStatusMap[status];
}

export function toPrismaServerStatus(status: ServerStatus): PrismaServerStatus {
  const entry = Object.entries(serverStatusMap).find(([, value]) => value === status);

  if (!entry) {
    return "UNKNOWN";
  }

  return entry[0] as PrismaServerStatus;
}

export function toServerDetails(server: PrismaServer): ServerDetails {
  return {
    id: server.id,
    name: server.name,
    hostname: server.hostname,
    status: toApiServerStatus(server.status),
    agentEndpoint: server.agentEndpoint,
    description: server.description,
    lastSeenAt: server.lastSeenAt?.toISOString() ?? null,
    createdAt: server.createdAt.toISOString(),
    updatedAt: server.updatedAt.toISOString()
  };
}

export function toAuditEvent(event: PrismaAuditEvent): AuditEvent {
  return {
    id: event.id,
    actorId: event.actorId ?? "system",
    action: event.action,
    resourceType: event.resourceType,
    resourceId: event.resourceId,
    result: event.result === "SUCCESS" ? "success" : "failure",
    createdAt: event.createdAt.toISOString()
  };
}
