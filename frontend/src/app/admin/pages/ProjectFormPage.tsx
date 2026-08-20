import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProject,
  getProject,
  updateProject,
} from "../../../services/projects.service";
import { updateMediaAlt } from "../../../services/media.service";
import type { CoverAsset } from "../../../types/media";
import type { Project, ProjectInput } from "../../../types/project";
import Button from "../../../components/ui/Button";
import ImageUpload from "../../../components/ui/ImageUpload";
import Input from "../../../components/ui/Input";
import Textarea from "../../../components/ui/Textarea";

type FormValues = {
  title: string;
  description: string;
  year: string;
  client: string;
  sort_order: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  year: String(new Date().getFullYear()),
  client: "",
  sort_order: "0",
};

//los opcionales se mandan siempre, incluso vacios: asi se pueden limpiar. La
//portada viaja como referencia al asset, y `null` la quita
const buildPayload = (
  values: FormValues,
  coverMediaId: string | null
): ProjectInput => ({
  title: values.title.trim(),
  description: values.description.trim(),
  year: Number(values.year),
  client: values.client.trim(),
  cover_media_id: coverMediaId,
  sort_order: Number(values.sort_order || 0),
});

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [cover, setCover] = useState<CoverAsset | null>(null);
  //el alt vive aparte del proyecto: pertenece al asset, y se guarda contra
  //`PUT /admin/media/:id`
  const [coverAlt, setCoverAlt] = useState("");
  //solo informativo: el slug no se edita, se muestra para saber la URL publica
  const [current, setCurrent] = useState<Project | null>(null);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    const load = async () => {
      try {
        const project = await getProject(id);

        if (cancelled) return;

        setCurrent(project);
        setCover(project.cover);
        setCoverAlt(project.cover?.alt ?? "");
        setValues({
          title: project.title,
          description: project.description,
          year: String(project.year),
          client: project.client ?? "",
          sort_order: String(project.sort_order),
        });
      } catch (err) {
        if (cancelled) return;

        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const setField = (field: keyof FormValues) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((prev) => ({ ...prev, [field]: e.target.value }));
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const alt = coverAlt.trim();

    //una portada sin texto alternativo no existe para un buscador ni para quien
    //usa lector de pantalla, asi que el formulario no deja guardarla asi
    if (cover && !alt) {
      setError("El texto alternativo de la portada es obligatorio.");
      return;
    }

    setError(null);
    setSaving(true);

    try {
      //el alt va primero: si falla, el proyecto no se guarda con una portada
      //que en la base sigue sin describir
      if (cover && alt !== (cover.alt ?? "")) {
        await updateMediaAlt(cover.id, alt);
      }

      const payload = buildPayload(values, cover?.id ?? null);

      if (id) {
        await updateProject(id, payload);
      } else {
        await createProject(payload);
      }

      navigate("/admin/projects", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="panel-card">
        <p className="page-copy">Cargando proyecto...</p>
      </section>
    );
  }

  return (
    <section className="panel-card">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {isEdit ? "Editar proyecto" : "Nuevo proyecto"}
          </h1>
          <p className="page-copy">
            {isEdit
              ? "Los cambios se guardan sobre el proyecto existente."
              : "La URL publica se genera automaticamente desde el titulo."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="title">
            Titulo
          </label>
          <Input
            id="title"
            value={values.title}
            required
            onChange={setField("title")}
          />
        </div>

        {current && (
          <div className="form-field">
            <span className="form-label">URL publica</span>
            <p className="field-hint">
              /proyectos/<strong>{current.slug}</strong>
              {current.slug_locked
                ? " · fija, ya no cambia aunque edites el titulo"
                : " · se regenera desde el titulo hasta que salga de borrador"}
            </p>

            {/* en borrador la pagina publica responde 404, asi que no se ofrece */}
            {current.status !== "draft" && (
              <a
                href={`/proyectos/${current.slug}`}
                target="_blank"
                rel="noreferrer"
                className="btn-link"
              >
                Ver pagina publica
              </a>
            )}
          </div>
        )}

        <div className="form-field">
          <label className="form-label" htmlFor="description">
            Descripcion
          </label>
          <Textarea
            id="description"
            rows={5}
            value={values.description}
            required
            onChange={setField("description")}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label className="form-label" htmlFor="year">
              Año
            </label>
            <Input
              id="year"
              type="number"
              value={values.year}
              required
              onChange={setField("year")}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="client">
              Cliente
            </label>
            <Input
              id="client"
              value={values.client}
              onChange={setField("client")}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="sort_order">
            Orden
          </label>
          <Input
            id="sort_order"
            type="number"
            value={values.sort_order}
            onChange={setField("sort_order")}
          />
          <p className="field-hint">Numero mas chico aparece primero.</p>
        </div>

        <ImageUpload
          label="Imagen de portada"
          value={cover?.url ?? null}
          onChange={(url, asset) => {
            //quitar la portada deja el proyecto sin `cover_media_id`; subir una
            //nueva guarda el asset entero, que es de donde salen la forma de la
            //imagen y su texto alternativo
            if (!url || !asset) {
              setCover(null);
              setCoverAlt("");
              return;
            }

            setCover({
              id: asset.id,
              url: asset.original_url,
              alt: asset.alt_text,
              width: asset.width,
              height: asset.height,
            });
            setCoverAlt(asset.alt_text ?? "");
          }}
        />

        {cover && (
          <div className="form-field">
            <label className="form-label" htmlFor="cover_alt">
              Texto alternativo de la portada
            </label>
            <Input
              id="cover_alt"
              value={coverAlt}
              required
              onChange={(e) => setCoverAlt(e.target.value)}
            />
            <p className="field-hint">
              Describe la imagen. Se guarda junto con el proyecto.
            </p>
          </div>
        )}

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
          <Link to="/admin/projects" className="btn-link">
            Cancelar
          </Link>
        </div>
      </form>
    </section>
  );
}
