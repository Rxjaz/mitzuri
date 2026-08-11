import { Route } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import HomePage from "./pages/HomePage";
import FeedLabPage from "./pages/FeedLabPage";

export function PublicRoutes() {
  return (
    <>
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* TEMPORAL: maqueta de diseno, fuera de PublicLayout porque define
          su propio header y necesita ancho completo */}
      <Route path="/lab" element={<FeedLabPage />} />
    </>
  );
}
