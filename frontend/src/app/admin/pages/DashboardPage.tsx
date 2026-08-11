import { Link } from "react-router-dom";

export default function DashboardPage() {
  return (
    <section className="panel-card">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-copy">
        Punto de entrada del admin. Aqui despues iran proyectos, media y
        narrativa.
      </p>

      <p className="page-copy">
        <Link to="/admin/projects">Ver proyectos</Link>
      </p>
    </section>
  );
}
