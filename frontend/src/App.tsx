import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./app/admin/auth/AuthProvider";
import { AdminRoutes } from "./app/admin/routes";
import { PublicRoutes } from "./app/public/routes";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {AdminRoutes()}
          {PublicRoutes()}
          <Route path="*" element={<div>Not found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
