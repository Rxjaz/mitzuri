import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import { getPublicProjects } from "../../../services/projects.public.service";
import type { PublicProject } from "../../../types/project";
import { CATEGORY_LABELS } from "../../../types/project";
import Cover from "../../../components/ui/Cover";

type LoadState = "loading" | "ready" | "error";

//un solo sitio para el numero de columnas: de aqui sale tanto el reparto en
//React como la rejilla en CSS. Subirlo a tres cuando haya mas proyectos
const FEED_COLUMNS = 2;

const formatMeta = (project: PublicProject): string => {
  return [project.client, project.year].filter(Boolean).join(" · ");
};

//las fichas se reparten alternando, no por bloques: leyendo de izquierda a
//derecha el orden curado se percibe correcto. Con `columns` de CSS las fichas
//fluyen hacia abajo por columna y ese orden se rompe
const splitIntoColumns = (
  projects: PublicProject[],
  columns: number
): PublicProject[][] => {
  const buckets: PublicProject[][] = Array.from({ length: columns }, () => []);

  projects.forEach((project, index) => {
    buckets[index % columns].push(project);
  });

  return buckets;
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

  //el primero del orden manda: portada a todo el ancho y titulo grande. El
  //resto va en mosaico, que en movil colapsa a una sola columna
  const [featured, ...rest] = projects;
  const columns = splitIntoColumns(rest, FEED_COLUMNS);

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
              <Cover cover={featured.cover} />
              {/* contexto, no filtro: no es un enlace ni abre nada */}
              {featured.category && (
                <p className="feed-category">
                  {CATEGORY_LABELS[featured.category]}
                </p>
              )}
              <h1 className="feed-hero-title">{featured.title}</h1>
              <p className="feed-meta">{formatMeta(featured)}</p>
            </Link>
          </article>

          {rest.length > 0 && (
            <div
              className="feed-mosaic"
              style={{ "--feed-columns": FEED_COLUMNS } as CSSProperties}
            >
              {columns.map((column, columnIndex) => (
                //en movil la columna es `display: contents` y sus fichas pasan
                //a ser hijas de la rejilla: con `order` recuperan el orden
                //exacto. En escritorio vuelve a ser una columna de verdad
                <div key={columnIndex} className="feed-column">
                  {column.map((project, indexInColumn) => (
                    <article
                      key={project.id}
                      style={{
                        order: indexInColumn * FEED_COLUMNS + columnIndex,
                      }}
                    >
                      <Link
                        to={`/proyectos/${project.slug}`}
                        className="feed-card group"
                      >
                        <Cover cover={project.cover} />
                        {project.category && (
                          <p className="feed-category">
                            {CATEGORY_LABELS[project.category]}
                          </p>
                        )}
                        <h2 className="feed-card-title">{project.title}</h2>
                        <p className="feed-meta">{formatMeta(project)}</p>
                      </Link>
                    </article>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
