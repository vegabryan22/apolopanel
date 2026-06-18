import Fastify from "fastify";
import os from "node:os";
import type { AgentMetrics } from "@apolopanel/shared";

const port = Number(process.env.AGENT_PORT ?? 4100);

const app = Fastify({
  logger: true
});

app.get("/health", async () => ({
  status: "ok",
  service: "agent"
}));

function readCpuSnapshot() {
  return os.cpus().map((cpu) => {
    const idle = cpu.times.idle;
    const total = Object.values(cpu.times).reduce((sum, value) => sum + value, 0);

    return {
      idle,
      total
    };
  });
}

async function collectCpuUsagePercent() {
  const start = readCpuSnapshot();
  await new Promise((resolve) => setTimeout(resolve, 150));
  const end = readCpuSnapshot();

  const usages = end.map((current, index) => {
    const previous = start[index];

    if (!previous) {
      return 0;
    }

    const idleDelta = current.idle - previous.idle;
    const totalDelta = current.total - previous.total;

    if (totalDelta <= 0) {
      return 0;
    }

    return 100 - (idleDelta / totalDelta) * 100;
  });

  const average = usages.reduce((sum, usage) => sum + usage, 0) / usages.length;

  return Math.max(0, Math.min(100, Math.round(average)));
}

app.get("/metrics", async (): Promise<AgentMetrics> => {
  const totalMemoryMb = Math.round(os.totalmem() / 1024 / 1024);
  const freeMemoryMb = Math.round(os.freemem() / 1024 / 1024);

  return {
    cpu: {
      usagePercent: await collectCpuUsagePercent()
    },
    memory: {
      usedMb: totalMemoryMb - freeMemoryMb,
      totalMb: totalMemoryMb
    },
    disk: {
      usedGb: 0,
      totalGb: 0
    },
    uptimeSeconds: Math.round(os.uptime())
  };
});

await app.listen({
  port,
  host: "127.0.0.1"
});
