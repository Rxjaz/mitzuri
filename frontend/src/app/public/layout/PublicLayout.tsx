//la display se carga solo aqui: el admin es herramienta de trabajo y no la usa
import "@fontsource/yeseva-one/400.css";
import { Link, Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/" className="app-brand">
            Mitzuri
          </Link>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>Mitzuri · Diseno y direccion de arte</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
