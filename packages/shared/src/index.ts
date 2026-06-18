export type ServerStatus = "online" | "offline" | "degraded" | "unknown";

export type ServerSummary = {
  id: string;
  name: string;
  hostname: string;
  status: ServerStatus;
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

