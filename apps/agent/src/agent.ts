import Fastify from "fastify";
import type { AgentMetrics } from "@apolopanel/shared";

const port = Number(process.env.AGENT_PORT ?? 4100);

const app = Fastify({
  logger: true
});

app.get("/health", async () => ({
  status: "ok",
  service: "agent"
}));

app.get(
  "/metrics",
  async (): Promise<AgentMetrics> => ({
    cpu: {
      usagePercent: 0
    },
    memory: {
      usedMb: 0,
      totalMb: 0
    },
    disk: {
      usedGb: 0,
      totalGb: 0
    }
  })
);

await app.listen({
  port,
  host: "127.0.0.1"
});
