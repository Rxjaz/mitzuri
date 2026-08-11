import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="app-shell-muted">
      <header className="app-header">
        <div className="app-header-inner">
          <Link to="/admin" className="app-brand">
            Mitzuri Admin
          </Link>

          <nav className="app-nav">
            <Link to="/admin">Dashboard</Link>
            <Link to="/admin/projects">Proyectos</Link>
            {user && <span>{user.full_name || user.email}</span>}
            <button type="button" onClick={handleLogout}>
              Salir
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
