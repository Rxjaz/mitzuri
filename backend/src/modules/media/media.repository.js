import { pool } from "../../shared/db/index.js";

export const createMediaAsset = async (data) => {

  const { rows } = await pool.query(`
        INSERT INTO media_assets (original_url, alt_text, mime_type, width, height, file_size_bytes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
    `, [
    data.original_url,
    data.alt_text || null,
    data.mime_type,
    data.width,
    data.height,
    data.file_size_bytes
  ]);

  return rows[0];
};

export const getMediaAssetById = async (id) => {

  const { rows } = await pool.query(
    "SELECT * FROM media_assets WHERE id = $1",
    [id]
  );

  return rows[0];
};

export const updateAltText = async (id, altText) => {

  const { rows } = await pool.query(`
        UPDATE media_assets
        SET alt_text = $1
        WHERE id = $2
        RETURNING *;
    `, [altText, id]);

  return rows[0];
};
