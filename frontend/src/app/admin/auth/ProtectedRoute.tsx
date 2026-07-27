import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

//guard de las rutas admin.
//mientras se valida el token no se decide nada, para no expulsar
//al usuario en cada recarga antes de saber si tiene sesion.
export default function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div className="auth-center">
        <p className="page-copy">Verificando sesion...</p>
      </div>
    );
  }

  if (status === "anonymous") {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
