import { z } from "zod";

//un schema por tipo de bloque. Hoy solo existe `image`; agregar un tipo nuevo
//es agregar una entrada aqui, no tocar la logica de validacion
const contentSchemas = {
  image: z.object({
    url: z.url(),
    //obligatorio: una imagen sin texto alternativo no existe para un buscador
    //ni para quien usa lector de pantalla
    alt: z.string().min(1, "Alt text is required"),
    caption: z.string().nullable().optional(),
    //vienen de la subida y sirven para reservar el espacio antes de que cargue
    width: z.number().int().positive().nullable().optional(),
    height: z.number().int().positive().nullable().optional(),
  }),
};

const sectionTypes = Object.keys(contentSchemas);

export const createSectionSchema = z
  .object({
    type: z.enum(sectionTypes, {
      error: `Type must be one of: ${sectionTypes.join(", ")}`,
    }),
    content: z.unknown(),
  })
  //el contenido depende del tipo, asi que se valida despues de saber cual es
  .superRefine((data, ctx) => {
    const result = contentSchemas[data.type].safeParse(data.content);

    if (result.success) {
      data.content = result.data;
      return;
    }

    for (const issue of result.error.issues) {
      ctx.addIssue({
        code: "custom",
        path: ["content", ...issue.path],
        message: issue.message,
      });
    }
  });

//actualizar no cambia el tipo, asi que el tipo viaja para saber que validar
export const updateSectionSchema = createSectionSchema;

export const reorderSectionsSchema = z.object({
  ids: z.array(z.uuid()).min(1, "At least one section id is required"),
});
