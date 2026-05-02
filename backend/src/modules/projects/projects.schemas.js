import { z } from "zod";

export const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),

  year: z.coerce.number({
    invalid_type_error: "Year must be a number"
  }),

  slug: z.string().min(1).optional(),
  client: z.string().optional(),

  cover_image_url: z
    .string()
    .url("Cover image must be a valid URL")
    .optional()
});

export const updateProjectSchema = createProjectSchema.partial();