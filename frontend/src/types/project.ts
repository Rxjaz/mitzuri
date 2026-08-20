import type { CoverAsset } from "./media";
import type { Section } from "./section";

export type ProjectStatus = "draft" | "unlisted" | "published";

//se guarda sin acentos y en minusculas; en la base es el valor de un CHECK
export type ProjectCategory = "editorial" | "marca" | "ilustracion";

//unico lugar donde vive la etiqueta legible. La usan el admin y el publico:
//nunca escribas estos textos a mano en un componente
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  editorial: "Editorial",
  marca: "Marca",
  ilustracion: "Ilustración",
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover: CoverAsset | null;
  status: ProjectStatus;
  //una vez que el proyecto sale de borrador el slug queda fijo para siempre
  slug_locked: boolean;
  year: number;
  client: string | null;
  //orden editorial del feed: numero mas chico aparece primero
  sort_order: number;
  //los proyectos anteriores a la ficha no tienen categoria: por eso admite null
  category: ProjectCategory | null;
  tools: string[];
  //hex de seis digitos; tine la pagina publica sustituyendo el azul del sitio
  accent_color: string | null;
  credits: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

//lo que acepta el backend. El slug no va aqui a proposito: siempre lo deriva
//el backend desde el titulo, y se congela cuando el proyecto se publica
export type ProjectInput = {
  title: string;
  description: string;
  year: number;
  client?: string;
  //`null` quita la portada. Ya no viaja una URL: la portada es una referencia
  //al asset, y de ahi salen su ancho, su alto y su texto alternativo
  cover_media_id?: string | null;
  sort_order?: number;
  category?: ProjectCategory | null;
  tools?: string[];
  accent_color?: string | null;
  credits?: string | null;
};

//lo que devuelven los endpoints publicos. Es un subconjunto a proposito: sin
//token no viajan columnas internas como `status` o `slug_locked`
export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover: CoverAsset | null;
  year: number;
  client: string | null;
  category: ProjectCategory | null;
  tools: string[];
  accent_color: string | null;
  credits: string | null;
  published_at: string | null;
};

//la pagina de proyecto si necesita el estado, para marcar `noindex` cuando el
//proyecto es no listado
export type PublicProjectDetail = PublicProject & {
  status: "published" | "unlisted";
  //la galeria viaja con el proyecto: una sola peticion arma la pagina. El feed
  //no las trae
  sections: Section[];
};
