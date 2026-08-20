import { useRef, useState } from "react";
import { uploadMedia } from "../../services/media.service";
import type { MediaAsset } from "../../types/media";
import Button from "./Button";

type ImageUploadProps = {
  value: string | null;
  //el asset y el archivo viajan como extras para quien necesite mas que la
  //URL —la galeria usa las dimensiones y el nombre del archivo—; quien solo
  //quiere la portada los ignora
  onChange: (
    url: string | null,
    asset?: MediaAsset,
    file?: File
  ) => void;
  label?: string;
  //texto del boton cuando no hay imagen todavia
  actionLabel?: string;
};

const ACCEPTED = "image/jpeg,image/png,image/webp,image/avif";

export default function ImageUpload({
  value,
  onChange,
  label,
  actionLabel = "Elegir imagen",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError(null);
    setUploading(true);

    try {
      const asset = await uploadMedia(file);

      onChange(asset.original_url, asset, file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setUploading(false);

      //se limpia el input para poder reintentar con el mismo archivo: si no,
      //elegir el mismo nombre otra vez no dispara `change`
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="form-field">
      {label && <span className="form-label">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleSelect}
      />

      {value ? (
        <div className="upload-preview">
          <img src={value} alt="" className="upload-thumb" />

          <div className="upload-preview-body">
            <p className="field-hint break-all">{value}</p>

            <Button
              variant="danger"
              className="mt-3 px-3 py-1.5"
              disabled={uploading}
              onClick={() => onChange(null)}
            >
              Quitar portada
            </Button>
          </div>
        </div>
      ) : (
        <div className="upload-dropzone">
          <Button
            variant="secondary"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? "Subiendo..." : actionLabel}
          </Button>

          <p className="field-hint mt-3">
            JPG, PNG, WebP o AVIF · hasta 10 MB
          </p>
        </div>
      )}

      {error && <p className="form-error mt-4">{error}</p>}
    </div>
  );
}
