export type ProjectStatus = "draft" | "unlisted" | "published";

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  status: ProjectStatus;
  //una vez que el proyecto sale de borrador el slug queda fijo para siempre
  slug_locked: boolean;
  year: number;
  client: string | null;
  //orden editorial del feed: numero mas chico aparece primero
  sort_order: number;
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
  //"" limpia la portada
  cover_image_url?: string;
  sort_order?: number;
};

//lo que devuelven los endpoints publicos. Es un subconjunto a proposito: sin
//token no viajan columnas internas como `status` o `slug_locked`
export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  year: number;
  client: string | null;
  published_at: string | null;
};

//la pagina de proyecto si necesita el estado, para marcar `noindex` cuando el
//proyecto es no listado
export type PublicProjectDetail = PublicProject & {
  status: "published" | "unlisted";
};
