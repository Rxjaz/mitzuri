export type MediaAsset = {
  id: string;
  original_url: string;
  //los derivados optimizados todavia no se generan
  optimized_url: string | null;
  alt_text: string | null;
  mime_type: string;
  //null si no se pudieron leer las dimensiones del archivo
  width: number | null;
  height: number | null;
  file_size_bytes: number | null;
  created_at: string;
};

//la portada tal como la devuelve el backend con el proyecto: una proyeccion del
//asset, no la fila entera. Trae la forma de la imagen, que es lo que el sitio
//necesita para no recortarla
export type CoverAsset = {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
};
