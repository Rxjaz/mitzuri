import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProject } from "../../../services/projects.service";
import {
  createSection,
  deleteSection,
  getSections,
  reorderSections,
  updateSection,
} from "../../../services/sections.service";
import type { Project } from "../../../types/project";
import type { ImageContent, Section } from "../../../types/section";
import Button from "../../../components/ui/Button";
import ImageUpload from "../../../components/ui/ImageUpload";
import Input from "../../../components/ui/Input";

type LoadState = "loading" | "ready" | "error";

//el alt provisional sale del nombre del archivo: nunca se guarda una imagen sin
//texto alternativo, pero tampoco se frena la subida esperando que lo escriba
const altFromFileName = (fileName: string): string => {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");

  return withoutExtension.replace(/[-_]+/g, " ").trim() || "Imagen del proyecto";
};

export default function ProjectImagesPage() {
  const { id } = useParams<{ id: string }>();

  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  //id de la seccion con una accion en curso, para bloquear solo esa fila
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);

  //la seccion recien creada se enfoca en su campo de alt, que es el que hay que
  //corregir de inmediato
  const pendingFocusId = useRef<string | null>(null);
  const altInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const load = async () => {
      try {
        const [projectData, sectionsData] = await Promise.all([
          getProject(id),
          getSections(id),
        ]);

        if (cancelled) return;

        setProject(projectData);
        setSections(sectionsData);
        setState("ready");
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
        setState("error");
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const focusId = pendingFocusId.current;

    if (!focusId) return;

    const input = altInputs.current[focusId];

    if (input) {
      input.focus();
      input.select();
      pendingFocusId.current = null;
    }
  }, [sections]);

  const save = useCallback(async (section: Section, content: ImageContent) => {
    setError(null);
    setBusyId(section.id);

    try {
      const updated = await updateSection(section.id, {
        type: section.type,
        content,
      });

      setSections((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  }, []);

  //cada campo guarda al perder el foco: la galeria no tiene boton de guardar
  const handleFieldBlur = (
    section: Section,
    field: "alt" | "caption",
    input: HTMLInputElement
  ) => {
    const trimmed = input.value.trim();

    if (field === "alt") {
      //el backend rechaza un alt vacio; avisar aqui evita un 400 sin contexto.
      //el campo recupera su valor anterior, que es el que sigue en la base: si
      //se quedara vacio pareceria que se guardo asi
      if (!trimmed) {
        setError("El texto alternativo es obligatorio.");
        input.value = section.content.alt;
        return;
      }

      if (trimmed === section.content.alt) return;

      return save(section, { ...section.content, alt: trimmed });
    }

    const caption = trimmed || null;

    if (caption === (section.content.caption ?? null)) return;

    return save(section, { ...section.content, caption });
  };

  const handleUploaded = async (
    url: string | null,
    width: number | null,
    height: number | null,
    fileName: string
  ) => {
    if (!id || !url) return;

    setError(null);

    try {
      const created = await createSection(id, {
        type: "image",
        content: {
          url,
          alt: altFromFileName(fileName),
          caption: null,
          width,
          height,
        },
      });

      pendingFocusId.current = created.id;
      setSections((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    if (!id) return;

    const target = index + direction;

    if (target < 0 || target >= sections.length) return;

    const next = [...sections];
    [next[index], next[target]] = [next[target], next[index]];

    setError(null);
    setReordering(true);

    try {
      const ordered = await reorderSections(
        id,
        next.map((section) => section.id)
      );

      setSections(ordered);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setReordering(false);
    }
  };

  const handleDelete = async (section: Section) => {
    const confirmed = window.confirm(
      "Eliminar esta imagen del proyecto? Esta accion no se puede deshacer."
    );

    if (!confirmed || !id) return;

    setError(null);
    setBusyId(section.id);

    try {
      await deleteSection(section.id);

      //el backend renumera las posiciones al borrar, asi que la lista se vuelve
      //a pedir en vez de recalcularla aqui
      setSections(await getSections(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setBusyId(null);
    }
  };

  if (state === "loading") {
    return (
      <section className="panel-card">
        <p className="page-copy">Cargando imagenes...</p>
      </section>
    );
  }

  if (state === "error" || !project) {
    return (
      <section className="panel-card">
        <p className="form-error">{error ?? "No se pudo cargar el proyecto."}</p>
        <Link to="/admin/projects" className="btn-link">
          Volver a proyectos
        </Link>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <div className="page-header">
        <div>
          <h1 className="page-title">Imagenes de {project.title}</h1>
          <p className="page-copy">
            {sections.length} {sections.length === 1 ? "imagen" : "imagenes"} ·
            el orden es el que se ve en la pagina publica
          </p>
        </div>

        <Link to={`/admin/projects/${project.id}/edit`} className="btn-link">
          Volver a la edicion
        </Link>
      </div>

      <ImageUpload
        label="Agregar imagen"
        actionLabel="Agregar imagen"
        //la galeria no guarda una portada: el uploader vuelve siempre a su
        //estado vacio despues de crear la seccion
        value={null}
        onChange={(url, asset, file) =>
          handleUploaded(
            url,
            asset?.width ?? null,
            asset?.height ?? null,
            file?.name ?? ""
          )
        }
      />

      {error && <p className="form-error">{error}</p>}

      {sections.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-title">Todavia no hay imagenes</p>
          <p className="page-copy">
            Agrega las piezas del proyecto: maquetas en contexto, dobles paginas,
            aplicaciones. Se veran en este mismo orden.
          </p>
        </div>
      ) : (
        <ul className="gallery-list">
          {sections.map((section, index) => (
            <li key={section.id} className="gallery-item">
              <img src={section.content.url} alt="" className="gallery-thumb" />

              <div className="gallery-body">
                <div className="form-field">
                  <label className="form-label" htmlFor={`alt-${section.id}`}>
                    Texto alternativo
                  </label>
                  <Input
                    id={`alt-${section.id}`}
                    ref={(node: HTMLInputElement | null) => {
                      altInputs.current[section.id] = node;
                    }}
                    defaultValue={section.content.alt}
                    required
                    disabled={busyId === section.id}
                    onBlur={(e) => handleFieldBlur(section, "alt", e.target)}
                  />
                  <p className="field-hint">
                    Describe la imagen. Se guarda al salir del campo.
                  </p>
                </div>

                <div className="form-field">
                  <label
                    className="form-label"
                    htmlFor={`caption-${section.id}`}
                  >
                    Pie de foto
                  </label>
                  <Input
                    id={`caption-${section.id}`}
                    defaultValue={section.content.caption ?? ""}
                    disabled={busyId === section.id}
                    onBlur={(e) =>
                      handleFieldBlur(section, "caption", e.target)
                    }
                  />
                  <p className="field-hint">Opcional.</p>
                </div>
              </div>

              <div className="gallery-actions">
                <span className="gallery-position">{index + 1}</span>

                <Button
                  variant="secondary"
                  className="px-3 py-1.5"
                  disabled={index === 0 || reordering}
                  onClick={() => move(index, -1)}
                >
                  Subir
                </Button>

                <Button
                  variant="secondary"
                  className="px-3 py-1.5"
                  disabled={index === sections.length - 1 || reordering}
                  onClick={() => move(index, 1)}
                >
                  Bajar
                </Button>

                <Button
                  variant="danger"
                  className="px-3 py-1.5"
                  disabled={busyId === section.id}
                  onClick={() => handleDelete(section)}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
