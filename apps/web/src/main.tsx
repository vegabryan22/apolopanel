import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { DashboardSummary, ServerSummary } from "@apolopanel/shared";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

const modules = [
  "Dashboard",
  "Servidores",
  "Dominios",
  "Sitios Web",
  "SSL",
  "Bases de Datos",
  "Backups",
  "Auditoría",
  "Usuarios"
];

const defaultDashboard: DashboardSummary = {
  servers: {
    total: 0,
    online: 0,
    offline: 0,
    degraded: 0,
    unknown: 0
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

function statusLabel(status: ServerSummary["status"]) {
  const labels = {
    online: "En línea",
    offline: "Fuera de línea",
    degraded: "Degradado",
    unknown: "Sin verificar"
  };

  return labels[status];
}

function App() {
  const [dashboard, setDashboard] = useState<DashboardSummary>(defaultDashboard);
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const onlineHealth = useMemo(() => {
    if (dashboard.servers.total === 0) {
      return 0;
    }

    return Math.round((dashboard.servers.online / dashboard.servers.total) * 100);
  }, [dashboard.servers.online, dashboard.servers.total]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const [dashboardResponse, serversResponse] = await Promise.all([
          fetch(`${apiBaseUrl}/dashboard`),
          fetch(`${apiBaseUrl}/servers`)
        ]);

        if (!dashboardResponse.ok || !serversResponse.ok) {
          throw new Error("No se pudo conectar con la API.");
        }

        setDashboard((await dashboardResponse.json()) as DashboardSummary);
        setServers((await serversResponse.json()) as ServerSummary[]);
        setErrorMessage(null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Ocurrió un error cargando el panel."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">ApoloPanel</div>
        <nav>
          {modules.map((module) => (
            <a href="#" key={module}>
              {module}
            </a>
          ))}
        </nav>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Control de hosting</p>
            <h1>Dashboard</h1>
          </div>
          <button type="button">Nuevo servidor</button>
        </header>

        {errorMessage ? <div className="alert">{errorMessage}</div> : null}

        <section className="grid">
          <article className="card">
            <span>Servidores</span>
            <strong>{isLoading ? "…" : dashboard.servers.total}</strong>
            <small>{dashboard.servers.unknown} pendiente(s) de verificación</small>
          </article>
          <article className="card">
            <span>Dominios</span>
            <strong>{dashboard.domains.total}</strong>
            <small>Listo para módulo DNS</small>
          </article>
          <article className="card">
            <span>Sitios Web</span>
            <strong>{dashboard.websites.total}</strong>
            <small>Preparado para Nginx/Apache</small>
          </article>
          <article className="card">
            <span>Backups</span>
            <strong>{dashboard.backups.total}</strong>
            <small>Sin jobs programados</small>
          </article>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <p className="eyebrow">Inventario VPS</p>
              <h2>Servidores administrados</h2>
            </div>
            <span className="health">{onlineHealth}% saludables</span>
          </div>
          <div className="serverList">
            {servers.map((server) => (
              <article className="serverRow" key={server.id}>
                <div>
                  <strong>{server.name}</strong>
                  <small>{server.hostname}</small>
                </div>
                <span className={`status status-${server.status}`}>
                  {statusLabel(server.status)}
                </span>
                <small>{server.agentEndpoint ?? "Sin agente registrado"}</small>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
