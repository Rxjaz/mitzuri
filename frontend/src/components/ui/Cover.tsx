import type { CSSProperties } from "react";
import { cn } from "../../lib/cn";
import type { CoverAsset } from "../../types/media";

type CoverProps = {
  cover: CoverAsset | null;
  //tope de alto en vh, para que una pieza muy vertical no se coma la pantalla
  maxHeightVh?: number;
  className?: string;
};

//cuando el asset no trae dimensiones no se puede saber su forma; 4/3 es lo mas
//comun en el material impreso con el que trabaja Mitzuri
const FALLBACK_RATIO = 4 / 3;

export default function Cover({ cover, maxHeightVh, className }: CoverProps) {
  const ratio =
    cover?.width && cover?.height ? cover.width / cover.height : FALLBACK_RATIO;

  //el marco toma la proporcion real de la imagen, asi que `object-cover` llena
  //sin recortar nada. Reservar el espacio antes de cargar evita que salte
  const style: CSSProperties = {
    aspectRatio: `${ratio}`,
    //el tope se aplica al ancho, no al alto: limitar el alto directamente
    //romperia la proporcion y volveria a recortar
    ...(maxHeightVh
      ? { maxWidth: `calc(${maxHeightVh}vh * ${ratio})` }
      : {}),
  };

  return (
    <div className={cn("cover-frame", className)} style={style}>
      {cover ? (
        <img
          src={cover.url}
          alt={cover.alt ?? ""}
          className="cover-image"
          width={cover.width ?? undefined}
          height={cover.height ?? undefined}
          loading="lazy"
        />
      ) : (
        <span className="cover-empty">Sin portada</span>
      )}
    </div>
  );
}
