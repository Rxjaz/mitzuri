import { Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="app-shell-muted">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/admin" className="app-brand">
            Mitzuri Admin
          </Link>

          <nav className="app-nav">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/login">Login</Link>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
