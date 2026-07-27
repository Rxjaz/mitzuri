import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./useAuth";

//inverso de ProtectedRoute: si ya hay sesion, /admin/login no tiene
//sentido y se manda directo al dashboard.
export default function GuestRoute() {
  const { status } = useAuth();

  if (status === "loading") {
    return (
      <div className="auth-center">
        <p className="page-copy">Verificando sesion...</p>
      </div>
    );
  }

  if (status === "authenticated") {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}
