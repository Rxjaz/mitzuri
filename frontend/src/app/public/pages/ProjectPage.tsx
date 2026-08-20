import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getPublicProject } from "../../../services/projects.public.service";
import type { PublicProjectDetail } from "../../../types/project";
import { ApiError } from "../../../services/apiClient";
import Cover from "../../../components/ui/Cover";

type LoadState = "loading" | "ready" | "notFound" | "error";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();

  const [project, setProject] = useState<PublicProjectDetail | null>(null);
  const [state, setState] = useState<LoadState>("loading");

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    const load = async () => {
      setState("loading");

      try {
        const data = await getPublicProject(slug);

        if (cancelled) return;

        setProject(data);
        setState("ready");
      } catch (err) {
        if (cancelled) return;

        //un borrador y un slug inexistente dan el mismo 404, a proposito
        setState(err instanceof ApiError && err.status === 404 ? "notFound" : "error");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (state === "loading") {
    return <p className="page-copy">Cargando proyecto...</p>;
  }

  if (state === "notFound") {
    return (
      <div className="project-page">
        <title>Proyecto no encontrado · Mitzuri</title>
        <meta name="robots" content="noindex, nofollow" />
        <div className="empty-state">
          <p className="empty-state-title">Este proyecto no existe</p>
          <p className="page-copy">
            Puede que la direccion sea incorrecta o que el proyecto ya no este
            disponible.
          </p>
        </div>
        <Link to="/" className="project-back">
          ← Volver al portafolio
        </Link>
      </div>
    );
  }

  if (state === "error" || !project) {
    return (
      <p className="form-error">
        No se pudo cargar el proyecto. Intenta de nuevo mas tarde.
      </p>
    );
  }

  const meta = [project.client, project.year].filter(Boolean).join(" · ");

  return (
    <article className="project-page">
      <title>{`${project.title} · Mitzuri`}</title>
      <meta name="description" content={project.description} />

      {/* sin esto Google indexa lo no listado y deja de ser privado: un
          proyecto compartido solo con un cliente acabaria en buscadores */}
      {project.status === "unlisted" && (
        <meta name="robots" content="noindex, nofollow" />
      )}

      <h1 className="project-title">{project.title}</h1>
      <p className="project-meta">{meta}</p>

      {/* la portada se ve entera, a su proporcion real; el tope de alto evita
          que una pieza muy vertical se coma tres pantallas */}
      <Cover cover={project.cover} maxHeightVh={85} className="project-cover" />

      <p className="project-description">{project.description}</p>

      {project.sections.length > 0 && (
        <div className="project-gallery">
          {project.sections.map((section, index) => (
            <figure key={section.id} className="project-figure">
              <div
                className="project-image-frame"
                //el espacio se reserva con la proporcion real de la imagen: sin
                //esto el texto de abajo salta cuando cada una termina de cargar
                style={
                  section.content.width && section.content.height
                    ? {
                        aspectRatio: `${section.content.width} / ${section.content.height}`,
                      }
                    : undefined
                }
              >
                <img
                  src={section.content.url}
                  alt={section.content.alt}
                  className="project-image"
                  width={section.content.width ?? undefined}
                  height={section.content.height ?? undefined}
                  //la primera entra en pantalla de inmediato; diferirla solo
                  //retrasa lo que ya se esta viendo
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>

              {section.content.caption && (
                <figcaption className="project-caption">
                  {section.content.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}

      <Link to="/" className="project-back">
        ← Volver al portafolio
      </Link>
    </article>
  );
}
