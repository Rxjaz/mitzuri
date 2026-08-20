import { z } from "zod";

//el slug no se acepta desde el cliente: siempre se deriva del titulo
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  year: z.coerce.number({ error: "Year must be a number" }).int(),

  client: z.string().optional(),

  //la portada es una referencia al asset, no una URL suelta: asi el proyecto
  //recupera ancho, alto y texto alternativo. `null` la quita
  cover_media_id: z.uuid().nullable().optional(),

  //orden editorial del feed: numero mas chico aparece primero
  sort_order: z.coerce.number().int().optional()
});

export const updateProjectSchema = createProjectSchema.partial();
