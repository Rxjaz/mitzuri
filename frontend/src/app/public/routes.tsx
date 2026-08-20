import { Route } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import HomePage from "./pages/HomePage";
import ProjectPage from "./pages/ProjectPage";

export function PublicRoutes() {
  return (
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<HomePage />} />
      {/* la ruta es la que ya se le muestra a la disenadora en el admin */}
      <Route path="proyectos/:slug" element={<ProjectPage />} />
    </Route>
  );
}
