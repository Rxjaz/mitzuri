import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProject,
  getProject,
  updateProject,
} from "../../../services/projects.service";
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
  cover_image_url: string;
};

const EMPTY_FORM: FormValues = {
  title: "",
  description: "",
  year: String(new Date().getFullYear()),
  client: "",
  cover_image_url: "",
};

//los opcionales se mandan siempre, incluso vacios: asi se pueden limpiar
const buildPayload = (values: FormValues): ProjectInput => ({
  title: values.title.trim(),
  description: values.description.trim(),
  year: Number(values.year),
  client: values.client.trim(),
  cover_image_url: values.cover_image_url.trim(),
});

export default function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
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
        setValues({
          title: project.title,
          description: project.description,
          year: String(project.year),
          client: project.client ?? "",
          cover_image_url: project.cover_image_url ?? "",
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

    setError(null);
    setSaving(true);

    try {
      const payload = buildPayload(values);

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

        <ImageUpload
          label="Imagen de portada"
          value={values.cover_image_url || null}
          //el contrato de projects no cambia: la portada sigue viajando como
          //string, y "" la quita
          onChange={(url) =>
            setValues((prev) => ({ ...prev, cover_image_url: url ?? "" }))
          }
        />

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
