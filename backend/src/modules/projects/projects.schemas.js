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
  sort_order: z.coerce.number().int().optional(),

  //la categoria se guarda sin acentos y en minusculas; la etiqueta legible la
  //arma el frontend. Admite `null` porque los proyectos anteriores no la tienen
  category: z.enum(["editorial", "marca", "ilustracion"]).nullable().optional(),

  tools: z.array(z.string().min(1)).max(12).optional(),

  //el hex entra tal cual como variable CSS en la pagina publica: cualquier otro
  //formato seria una inyeccion en el atributo `style`
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un hex de seis digitos")
    .nullable()
    .optional(),

  credits: z.string().max(500).nullable().optional()
});

export const updateProjectSchema = createProjectSchema.partial();
