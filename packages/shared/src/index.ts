export type ServerStatus = "online" | "offline" | "degraded" | "unknown";

export type ServerSummary = {
  id: string;
  name: string;
  hostname: string;
  status: ServerStatus;
  agentEndpoint: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateServerInput = {
  name: string;
  hostname: string;
  agentEndpoint?: string | null;
};

export type ServerDetails = ServerSummary & {
  description: string | null;
  lastSeenAt: string | null;
};

export type AgentMetrics = {
  cpu: {
    usagePercent: number;
  };
  memory: {
    usedMb: number;
    totalMb: number;
  };
  disk: {
    usedGb: number;
    totalGb: number;
  };
  uptimeSeconds: number;
};

export type AuditEvent = {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: "success" | "failure";
  createdAt: string;
};

export type DashboardSummary = {
  servers: {
    total: number;
    online: number;
    offline: number;
    degraded: number;
    unknown: number;
  };
  domains: {
    total: number;
  };
  websites: {
    total: number;
  };
  backups: {
    total: number;
  };
};

export type ApiError = {
  error: string;
  message: string;
};
