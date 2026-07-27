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
    </div>
  );
}
