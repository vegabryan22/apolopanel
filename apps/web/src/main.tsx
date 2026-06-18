import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

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

function App() {
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
        <section className="grid">
          <article className="card">
            <span>Servidores</span>
            <strong>1</strong>
            <small>VPS registrado pendiente de conexión real</small>
          </article>
          <article className="card">
            <span>Dominios</span>
            <strong>0</strong>
            <small>Listo para módulo DNS</small>
          </article>
          <article className="card">
            <span>Sitios Web</span>
            <strong>0</strong>
            <small>Preparado para Nginx/Apache</small>
          </article>
          <article className="card">
            <span>Backups</span>
            <strong>0</strong>
            <small>Sin jobs programados</small>
          </article>
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
