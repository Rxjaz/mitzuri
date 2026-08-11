import { z } from "zod";

//el slug no se acepta desde el cliente: siempre se deriva del titulo
export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  year: z.coerce.number({ error: "Year must be a number" }).int(),

  client: z.string().optional(),

  //"" es valido y significa quitar la portada; cualquier otra cosa debe ser URL
  cover_image_url: z
    .union([z.url("Cover image must be a valid URL"), z.literal("")])
    .optional()
});

export const updateProjectSchema = createProjectSchema.partial();
