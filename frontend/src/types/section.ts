//hoy la galeria es el unico bloque que existe. El backend valida por tipo con
//un mapa de schemas, asi que agregar `text` o `quote` no rompe este contrato
export type SectionType = "image";

export type ImageContent = {
  url: string;
  //obligatorio: sin texto alternativo la imagen no existe para un buscador ni
  //para quien usa lector de pantalla
  alt: string;
  caption?: string | null;
  //vienen de la subida y sirven para reservar el espacio antes de que cargue
  width?: number | null;
  height?: number | null;
};

export type Section = {
  id: string;
  type: SectionType;
  content: ImageContent;
  position: number;
};

//lo que acepta el backend al crear o actualizar
export type SectionInput = {
  type: SectionType;
  content: ImageContent;
};
