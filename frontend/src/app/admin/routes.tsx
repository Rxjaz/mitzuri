import { Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import AdminLayout from "./layout/AdminLayout";
import ProtectedRoute from "./auth/ProtectedRoute";
import GuestRoute from "./auth/GuestRoute";

export function AdminRoutes() {
  return (
    <>
      <Route element={<GuestRoute />}>
        <Route path="/admin/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
      </Route>
    </>
  );
}
