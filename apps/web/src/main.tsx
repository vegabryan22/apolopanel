import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import type { DashboardSummary, ServerSummary } from "@apolopanel/shared";
import "./styles.css";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type ModuleId =
  | "home"
  | "clients"
  | "domains"
  | "subscriptions"
  | "service-plans"
  | "tools"
  | "statistics"
  | "extensions"
  | "wordpress"
  | "monitoring"
  | "laravel"
  | "docker"
  | "servers"
  | "profile"
  | "view";

type NavigationGroup = {
  title: string;
  items: Array<{
    id: ModuleId;
    label: string;
    count?: number;
    icon: string;
  }>;
};

const navigationGroups: NavigationGroup[] = [
  {
    title: "Servicios de hosting",
    items: [
      { id: "home", label: "Inicio", icon: "⌂" },
      { id: "clients", label: "Clientes", count: 9, icon: "♙" },
      { id: "domains", label: "Dominios", count: 20, icon: "▣" },
      { id: "subscriptions", label: "Suscripciones", count: 9, icon: "▦" },
      { id: "service-plans", label: "Planes de servicio", count: 6, icon: "▤" }
    ]
  },
  {
    title: "Administración del servidor",
    items: [
      { id: "tools", label: "Herramientas y configuración", icon: "⚙" },
      { id: "statistics", label: "Estadísticas", icon: "▥" },
      { id: "extensions", label: "Extensiones", icon: "▦" },
      { id: "wordpress", label: "WordPress", icon: "◉" },
      { id: "monitoring", label: "Monitoring", icon: "◎" },
      { id: "laravel", label: "Laravel", icon: "◇" },
      { id: "docker", label: "Docker", icon: "⬡" },
      { id: "servers", label: "Servidores VPS", icon: "▰" }
    ]
  },
  {
    title: "Mi perfil",
    items: [
      { id: "profile", label: "Perfil y preferencias", icon: "♔" },
      { id: "view", label: "Cambiar vista", icon: "◌" }
    ]
  }
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

function moduleTitle(moduleId: ModuleId) {
  return (
    navigationGroups.flatMap((group) => group.items).find((item) => item.id === moduleId)
      ?.label ?? "Inicio"
  );
}

function PlaceholderView({ title }: { title: string }) {
  return (
    <section className="widget emptyState">
      <p className="eyebrow">Módulo en cola</p>
      <h2>{title}</h2>
      <p>
        Esta sección ya está ubicada dentro de la arquitectura del panel. La siguiente
        iteración debe definir contratos, permisos, auditoría y pantallas operativas.
      </p>
    </section>
  );
}

function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>("home");
  const [dashboard, setDashboard] = useState<DashboardSummary>(defaultDashboard);
  const [servers, setServers] = useState<ServerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [serverName, setServerName] = useState("");
  const [serverHostname, setServerHostname] = useState("");
  const [agentEndpoint, setAgentEndpoint] = useState("");

  const activeLabel = moduleTitle(activeModule);

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
        <div className="brandBlock">
          <div className="brandName">Apolo</div>
          <div className="brandBadge">Panel</div>
        </div>
        <nav className="navigation">
          {navigationGroups.map((group) => (
            <section className="navGroup" key={group.title}>
              <p>{group.title}</p>
              {group.items.map((item) => (
                <button
                  className={activeModule === item.id ? "navItem active" : "navItem"}
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  type="button"
                >
                  <span className="navIcon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.count !== undefined ? <small>{item.count}</small> : null}
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="searchBox">
            <span>⌕</span>
            <input placeholder="Buscar..." />
          </div>
          <div className="topActions">
            <span>☁</span>
            <span>🔔</span>
            <span>?</span>
            <strong>Bryan Vega Rondon</strong>
          </div>
        </header>

        <section className="content">
          <div className="pageTitle">
            <h1>{activeLabel}</h1>
            <button type="button" onClick={() => setActiveModule("servers")}>
              Nuevo servidor
            </button>
          </div>

          {errorMessage ? <div className="alert alertError">{errorMessage}</div> : null}
          {successMessage ? (
            <div className="alert alertSuccess">{successMessage}</div>
          ) : null}

          {activeModule === "home" ? (
            <DashboardView
              dashboard={dashboard}
              isLoading={isLoading}
              onlineHealth={onlineHealth}
              servers={servers}
            />
          ) : null}

          {activeModule === "servers" ? (
            <ServersView
              agentEndpoint={agentEndpoint}
              isCreatingServer={isCreatingServer}
              onAgentEndpointChange={setAgentEndpoint}
              onCreateServer={handleCreateServer}
              onHostnameChange={setServerHostname}
              onNameChange={setServerName}
              onRefresh={() => void loadData()}
              serverHostname={serverHostname}
              serverName={serverName}
              servers={servers}
            />
          ) : null}

          {activeModule !== "home" && activeModule !== "servers" ? (
            <PlaceholderView title={activeLabel} />
          ) : null}
        </section>
      </section>
    </main>
  );
}

function DashboardView({
  dashboard,
  isLoading,
  onlineHealth,
  servers
}: {
  dashboard: DashboardSummary;
  isLoading: boolean;
  onlineHealth: number;
  servers: ServerSummary[];
}) {
  return (
    <section className="dashboardGrid">
      <section className="dashboardColumn">
        <article className="widget">
          <div className="widgetHeader">
            <div>
              <p className="eyebrow">Sistema</p>
              <h2>ApoloPanel 0.1.0</h2>
            </div>
            <span className="rocket">🚀</span>
          </div>
          <div className="updateBox">
            <span>Última comprobación: hoy</span>
            <button type="button">Buscar actualizaciones</button>
          </div>
          <a href="#">Añadir o eliminar componentes ↗</a>
        </article>

        <article className="widget">
          <p className="eyebrow">Información del servidor</p>
          <InfoRow label="Nombre de host" value="vps.local" />
          <InfoRow label="Dirección IP" value="127.0.0.1" />
          <InfoRow label="SO" value="Linux/Windows Agent" />
          <InfoRow
            label="Servidores registrados"
            value={String(dashboard.servers.total)}
          />
          <a href="#">Ver más</a>
        </article>

        <article className="widget">
          <p className="eyebrow">Último backup del servidor</p>
          <div className="skeleton" />
          <div className="skeleton short" />
          <small className="muted">Módulo pendiente de implementación.</small>
        </article>
      </section>

      <section className="dashboardColumn">
        <article className="widget">
          <p className="eyebrow">Novedades</p>
          <div className="newsItem highlighted">
            <span>🚀</span>
            <div>
              <small>17 de junio de 2026</small>
              <strong>Panel base conectado</strong>
            </div>
          </div>
          <NewsItem date="Fase 1" title="Inventario VPS inicial" />
          <NewsItem date="Fase 2" title="Agente Linux seguro" />
          <NewsItem date="Fase 3" title="Dominios, SSL y sitios web" />
          <a href="#">Consultar roadmap ↗</a>
        </article>

        <article className="widget">
          <p className="eyebrow">WordPress Sites</p>
          <div className="riskRow">
            <span>● 0,0 top security risk</span>
            <span>● 0,0 median security risk</span>
          </div>
          <div className="warningBadge">▲ 0 security updates available</div>
          <a href="#">Ver todos los sitios WP [0]</a>
        </article>

        <article className="widget">
          <p className="eyebrow">Protección ante vulnerabilidades</p>
          <InfoRow label="Protected services" value="0" />
          <InfoRow label="Unprotected services" value="0" danger />
        </article>
      </section>

      <section className="dashboardColumn">
        <MetricWidget
          color="purple"
          subtitle="Últimas 24 horas"
          title="Uso de CPU, %"
          value={isLoading ? "…" : `${onlineHealth}% saludables`}
        />
        <MetricWidget
          color="blue"
          subtitle="Últimas 24 horas. Memoria total: pendiente"
          title="Uso de memoria, GB"
          value={`${servers.length} agente(s)`}
        />
      </section>
    </section>
  );
}

function ServersView({
  agentEndpoint,
  isCreatingServer,
  onAgentEndpointChange,
  onCreateServer,
  onHostnameChange,
  onNameChange,
  onRefresh,
  serverHostname,
  serverName,
  servers
}: {
  agentEndpoint: string;
  isCreatingServer: boolean;
  onAgentEndpointChange: (value: string) => void;
  onCreateServer: (event: FormEvent<HTMLFormElement>) => void;
  onHostnameChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onRefresh: () => void;
  serverHostname: string;
  serverName: string;
  servers: ServerSummary[];
}) {
  return (
    <section className="split">
      <section className="widget">
        <div className="widgetHeader">
          <div>
            <p className="eyebrow">Inventario VPS</p>
            <h2>Servidores registrados</h2>
          </div>
          <button type="button" onClick={onRefresh}>
            Refrescar
          </button>
        </div>
        <ServerList servers={servers} />
      </section>

      <section className="widget">
        <p className="eyebrow">Alta controlada</p>
        <h2>Registrar servidor</h2>
        <form className="form" onSubmit={onCreateServer}>
          <label>
            Nombre
            <input
              minLength={3}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="VPS Producción"
              required
              value={serverName}
            />
          </label>
          <label>
            Hostname
            <input
              minLength={3}
              onChange={(event) => onHostnameChange(event.target.value)}
              placeholder="vps.example.com"
              required
              value={serverHostname}
            />
          </label>
          <label>
            Endpoint del agente
            <input
              onChange={(event) => onAgentEndpointChange(event.target.value)}
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

function InfoRow({
  danger,
  label,
  value
}: {
  danger?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="infoRow">
      <span>{label}</span>
      <strong className={danger ? "dangerText" : undefined}>{value}</strong>
    </div>
  );
}

function NewsItem({ date, title }: { date: string; title: string }) {
  return (
    <div className="newsItem">
      <small>{date}</small>
      <strong>{title}</strong>
    </div>
  );
}

function MetricWidget({
  color,
  subtitle,
  title,
  value
}: {
  color: "blue" | "purple";
  subtitle: string;
  title: string;
  value: string;
}) {
  return (
    <article className="widget">
      <p className="eyebrow">{title}</p>
      <small className="muted">{subtitle}</small>
      <div className={`chart chart-${color}`}>
        <svg viewBox="0 0 320 160" role="img" aria-label={title}>
          <polyline points="0,90 20,88 40,94 60,70 80,82 100,65 120,74 140,52 160,80 180,44 200,62 220,56 240,35 260,60 280,72 320,66" />
          <polyline points="0,132 30,126 60,130 90,124 120,128 150,116 180,126 210,118 240,126 270,122 320,124" />
        </svg>
      </div>
      <a href="#">{value}</a>
    </article>
  );
}

createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
