import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  deleteProject,
  getProjects,
  publishProject,
  unpublishProject,
} from "../../../services/projects.service";
import type { Project } from "../../../types/project";
import Button from "../../../components/ui/Button";

type LoadState = "loading" | "ready" | "error";

const formatDate = (value: string): string => {
  return new Date(value).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  //id del proyecto con una accion en curso, para bloquear solo esa fila
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getProjects();

      setProjects(data);
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
      setState("error");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        const data = await getProjects();

        if (cancelled) return;

        setProjects(data);
        setState("ready");
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
        setState("error");
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  //las acciones recargan la lista completa: es una tabla chica y asi el
  //estado siempre viene del backend, sin sincronizar copias locales
  const runAction = async (id: string, action: () => Promise<unknown>) => {
    setError(null);
    setBusyId(id);

    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  };

  const handleTogglePublish = (project: Project) => {
    const toggle =
      project.status === "published" ? unpublishProject : publishProject;

    return runAction(project.id, () => toggle(project.id));
  };

  const handleDelete = (project: Project) => {
    const confirmed = window.confirm(
      `Eliminar "${project.title}"? Esta accion no se puede deshacer.`
    );

    if (!confirmed) return;

    return runAction(project.id, () => deleteProject(project.id));
  };

  return (
    <section className="panel-card">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proyectos</h1>
          <p className="page-copy">
            {state === "ready"
              ? `${projects.length} ${projects.length === 1 ? "proyecto" : "proyectos"}`
              : "Contenido del portafolio"}
          </p>
        </div>

        <Link to="/admin/projects/new" className="btn-primary-link">
          Nuevo proyecto
        </Link>
      </div>

      {state === "loading" && <p className="page-copy">Cargando proyectos...</p>}

      {error && <p className="form-error">{error}</p>}

      {state === "ready" && projects.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">Todavia no hay proyectos</p>
          <p className="page-copy">
            Cuando crees el primero aparecera en esta lista.
          </p>
        </div>
      )}

      {state === "ready" && projects.length > 0 && (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titulo</th>
                <th>Estado</th>
                <th>Año</th>
                <th>Cliente</th>
                <th>Creado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <span className="cell-strong">{project.title}</span>
                    <span className="cell-muted">/{project.slug}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${project.status}`}>
                      {project.status === "published" ? "Publicado" : "Borrador"}
                    </span>
                  </td>
                  <td>{project.year}</td>
                  <td>{project.client || "—"}</td>
                  <td>{formatDate(project.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      <Link
                        to={`/admin/projects/${project.id}/edit`}
                        className="btn-link"
                      >
                        Editar
                      </Link>

                      <Button
                        variant="secondary"
                        className="px-3 py-1.5"
                        disabled={busyId === project.id}
                        onClick={() => handleTogglePublish(project)}
                      >
                        {project.status === "published"
                          ? "Despublicar"
                          : "Publicar"}
                      </Button>

                      <Button
                        variant="danger"
                        className="px-3 py-1.5"
                        disabled={busyId === project.id}
                        onClick={() => handleDelete(project)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
