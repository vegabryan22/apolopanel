import cors from "@fastify/cors";
import Fastify from "fastify";
import type { ServerSummary } from "@apolopanel/shared";

const port = Number(process.env.API_PORT ?? 4000);

const app = Fastify({
  logger: true
});

await app.register(cors, {
  origin: true
});

app.get("/health", async () => ({
  status: "ok",
  service: "api"
}));

app.get(
  "/servers",
  async (): Promise<ServerSummary[]> => [
    {
      id: "srv_001",
      name: "VPS Principal",
      hostname: "vps.local",
      status: "unknown"
    }
  ]
);

await app.listen({
  port,
  host: "0.0.0.0"
});
