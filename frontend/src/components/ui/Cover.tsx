import { cn } from "../../lib/cn";

type CoverRatio = "hero" | "card";

type CoverProps = {
  src: string | null;
  alt: string;
  ratio?: CoverRatio;
  className?: string;
};

//el texto alternativo real vive en `media_assets` y hoy es inalcanzable desde
//el proyecto: la portada sigue siendo una URL suelta
const RATIOS: Record<CoverRatio, string> = {
  hero: "cover-frame cover-frame-hero",
  card: "cover-frame cover-frame-card",
};

export default function Cover({
  src,
  alt,
  ratio = "card",
  className,
}: CoverProps) {
  return (
    <div className={cn(RATIOS[ratio], className)}>
      {src ? (
        <img src={src} alt={alt} className="cover-image" loading="lazy" />
      ) : (
        <span className="cover-empty">Sin portada</span>
      )}
    </div>
  );
}
