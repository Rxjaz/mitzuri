import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicProjects } from "../../../services/projects.public.service";
import type { PublicProject } from "../../../types/project";
import Cover from "../../../components/ui/Cover";

type LoadState = "loading" | "ready" | "error";

const formatMeta = (project: PublicProject): string => {
  return [project.client, project.year].filter(Boolean).join(" · ");
};

export default function HomePage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await getPublicProjects();

        if (cancelled) return;

        setProjects(data);
        setState("ready");
      } catch {
        if (cancelled) return;

        setState("error");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  //el primero del orden manda: portada ancha y titulo grande. El resto va en
  //cuadricula, que en movil colapsa a una columna
  const [featured, ...rest] = projects;

  return (
    <>
      <title>Mitzuri</title>
      <meta
        name="description"
        content="Portafolio de diseno de Mitzuri: identidad, editorial y direccion de arte."
      />

      {state === "loading" && <p className="page-copy">Cargando proyectos...</p>}

      {state === "error" && (
        <p className="form-error">
          No se pudieron cargar los proyectos. Intenta de nuevo mas tarde.
        </p>
      )}

      {state === "ready" && projects.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-title">Todavia no hay proyectos publicos</p>
          <p className="page-copy">
            Muy pronto vas a encontrar aqui el trabajo de Mitzuri.
          </p>
        </div>
      )}

      {state === "ready" && featured && (
        <div className="feed">
          <article>
            <Link to={`/proyectos/${featured.slug}`} className="feed-card group">
              <Cover
                src={featured.cover_image_url}
                alt={featured.title}
                ratio="hero"
              />
              <h1 className="feed-hero-title">{featured.title}</h1>
              <p className="feed-meta">{formatMeta(featured)}</p>
            </Link>
          </article>

          {rest.length > 0 && (
            <div className="feed-grid">
              {rest.map((project) => (
                <article key={project.id}>
                  <Link to={`/proyectos/${project.slug}`} className="feed-card group">
                    <Cover
                      src={project.cover_image_url}
                      alt={project.title}
                    />
                    <h2 className="feed-card-title">{project.title}</h2>
                    <p className="feed-meta">{formatMeta(project)}</p>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
