import { Route } from "react-router-dom";
import PublicLayout from "./layout/PublicLayout";
import HomePage from "./pages/HomePage";

export function PublicRoutes() {
  return (
    <Route path="/" element={<PublicLayout />}>
      <Route index element={<HomePage />} />
    </Route>
  );
}
