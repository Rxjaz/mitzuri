import crypto from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { imageSize } from "image-size";

import * as mediaRepository from "./media.repository.js";
import { r2 } from "../../shared/storage/r2Client.js";
import { getRequiredEnv } from "../../shared/utils/env.js";
import ValidationError from "../../shared/errors/validation.error.js";

//la extension sale del mime, nunca del nombre que manda el cliente
const ALLOWED_MIME_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

//la key es unica, asi que el archivo en esa URL nunca cambia
const CACHE_CONTROL = "public, max-age=31536000, immutable";

//las dimensiones sirven para reservar el espacio de la imagen en el feed y
//evitar que el layout salte al cargar. Si no se pueden leer, no es motivo
//para rechazar la subida: se guarda null y se sigue
const readDimensions = (buffer) => {
  try {
    const { width, height } = imageSize(buffer);

    return { width: width ?? null, height: height ?? null };
  } catch {
    return { width: null, height: null };
  }
};

export const uploadMedia = async (file, altText) => {
  if (!file) {
    throw new ValidationError("File is required");
  }

  const extension = ALLOWED_MIME_TYPES[file.mimetype];

  if (!extension) {
    throw new ValidationError(
      `Unsupported file type: ${file.mimetype}. Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(", ")}`
    );
  }

  const key = `media/${crypto.randomUUID()}.${extension}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: getRequiredEnv("R2_BUCKET"),
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: CACHE_CONTROL,
    })
  );

  const { width, height } = readDimensions(file.buffer);

  return await mediaRepository.createMediaAsset({
    original_url: `${getRequiredEnv("R2_PUBLIC_BASE_URL")}/${key}`,
    alt_text: altText,
    mime_type: file.mimetype,
    width,
    height,
    file_size_bytes: file.size,
  });
};
