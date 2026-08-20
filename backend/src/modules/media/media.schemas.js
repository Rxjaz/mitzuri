import { z } from "zod";

//el texto alternativo se corrige despues de subir, cuando ya se ve la imagen
export const updateMediaSchema = z.object({
  alt_text: z.string().min(1, "Alt text is required"),
});
