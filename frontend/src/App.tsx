import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminRoutes } from "./app/admin/routes";
import { PublicRoutes } from "./app/public/routes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {AdminRoutes()}
        {PublicRoutes()}
        <Route path="*" element={<div>Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
