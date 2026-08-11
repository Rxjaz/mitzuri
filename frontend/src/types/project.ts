export type ProjectStatus = "draft" | "published";

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url: string | null;
  status: ProjectStatus;
  year: number;
  client: string | null;
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
};
