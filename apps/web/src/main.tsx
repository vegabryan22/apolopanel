import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { DashboardSummary, ServerSummary } from "@apolopanel/shared";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ModuleId =
  | "dashboard"
  | "servers"
  | "domains"
  | "websites"
  | "ssl"
  | "databases"
  | "backups"
  | "audit"
  | "users";

const modules: Array<{ id: ModuleId; label: string }> = [
  { id: "dashboard", label: "Dashboard" },
  { id: "servers", label: "Servidores" },
  { id: "domains", label: "Dominios" },
  { id: "websites", label: "Sitios Web" },
  { id: "ssl", label: "SSL" },
  { id: "databases", label: "Bases de Datos" },
  { id: "backups", label: "Backups" },
  { id: "audit", label: "Auditoría" },
  { id: "users", label: "Usuarios" }
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

function PlaceholderView({ title }: { title: string }) {
  return (
    <section className="panel emptyState">
      <p className="eyebrow">Módulo en cola</p>
      <h2>{title}</h2>
      <p>
        Este módulo ya está reservado en la navegación. Lo construiremos con contratos,
        auditoría y validaciones cuando toque su fase.
      </p>
    </section>
  );
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("dashboard");
  const [dashboard, setDashboard] = useState<DashboardSummary>(defaultDashboard);
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverName, setServerName] = useState("");
  const [serverHostname, setServerHostname] = useState("");
  const [agentEndpoint, setAgentEndpoint] = useState("");

  const activeLabel =
    modules.find((module) => module.id === activeModule)?.label ?? "Dashboard";

  const onlineHealth = useMemo(() => {
    if (dashboard.servers.total === 0) {
      return 0;
    }

    return Math.round((dashboard.servers.online / dashboard.servers.total) * 100);
  }, [dashboard.servers.online, dashboard.servers.total]);

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleCreateServer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingServer(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`${apiBaseUrl}/servers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: serverName,
          hostname: serverHostname,
          agentEndpoint: agentEndpoint || null
        })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "No se pudo crear el servidor.");
      }

      setServerName("");
      setServerHostname("");
      setAgentEndpoint("");
      setSuccessMessage("Servidor registrado correctamente.");
      await loadData();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Ocurrió un error creando el servidor."
      );
    } finally {
      setIsCreatingServer(false);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">ApoloPanel</div>
        <nav>
          {modules.map((module) => (
            <button
              className={activeModule === module.id ? "navItem active" : "navItem"}
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              type="button"
            >
              {module.label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Control de hosting</p>
            <h1>{activeLabel}</h1>
          </div>
          <button type="button" onClick={() => setActiveModule("servers")}>
            Nuevo servidor
          </button>
        </header>

        {errorMessage ? <div className="alert alertError">{errorMessage}</div> : null}
        {successMessage ? (
          <div className="alert alertSuccess">{successMessage}</div>
        ) : null}

        {activeModule === "dashboard" ? (
          <>
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
              <ServerList servers={servers} />
            </section>
          </>
        ) : null}

        {activeModule === "servers" ? (
          <section className="split">
            <section className="panel">
              <div className="panelHeader">
                <div>
                  <p className="eyebrow">Inventario VPS</p>
                  <h2>Servidores registrados</h2>
                </div>
                <button type="button" onClick={() => void loadData()}>
                  Refrescar
                </button>
              </div>
              <ServerList servers={servers} />
            </section>

            <section className="panel">
              <p className="eyebrow">Alta controlada</p>
              <h2>Registrar servidor</h2>
              <form className="form" onSubmit={(event) => void handleCreateServer(event)}>
                <label>
                  Nombre
                  <input
                    minLength={3}
                    onChange={(event) => setServerName(event.target.value)}
                    placeholder="VPS Producción"
                    required
                    value={serverName}
                  />
                </label>
                <label>
                  Hostname
                  <input
                    minLength={3}
                    onChange={(event) => setServerHostname(event.target.value)}
                    placeholder="vps.example.com"
                    required
                    value={serverHostname}
                  />
                </label>
                <label>
                  Endpoint del agente
                  <input
                    onChange={(event) => setAgentEndpoint(event.target.value)}
                    placeholder="http://127.0.0.1:4100"
                    value={agentEndpoint}
                  />
                </label>
                <button disabled={isCreatingServer} type="submit">
                  {isCreatingServer ? "Registrando…" : "Registrar servidor"}
                </button>
              </form>
            </section>
          </section>
        ) : null}

        {activeModule !== "dashboard" && activeModule !== "servers" ? (
          <PlaceholderView title={activeLabel} />
        ) : null}
      </section>
    </main>
  );
}

function ServerList({ servers }: { servers: ServerSummary[] }) {
  if (servers.length === 0) {
    return <p className="muted">Aún no hay servidores registrados.</p>;
  }

  return (
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
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
