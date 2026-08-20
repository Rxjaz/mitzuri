import { pool } from "../../shared/db/index.js";

export const getAllProjects = async () => {

  const { rows } = await pool.query(`
        SELECT * FROM projects
        ORDER BY created_at DESC;
    `);

  return rows;
};

export const createProject = async (data) => {

  const { rows } = await pool.query(`
        INSERT INTO projects (title, slug, description, year, client, cover_image_url, sort_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `, [
    data.title,
    data.slug,
    data.description,
    data.year,
    data.client || null,
    data.cover_image_url || null,
    data.sort_order ?? 0
  ]);

  return rows[0];
};

//se usa para garantizar que el slug generado sea unico; al editar hay que
//excluir el propio proyecto, si no chocaria consigo mismo
export const slugExists = async (slug, excludeId = null) => {

  const { rows } = await pool.query(`
        SELECT 1 FROM projects
        WHERE slug = $1 AND ($2::uuid IS NULL OR id <> $2)
        LIMIT 1;
    `, [slug, excludeId]);

  return rows.length > 0;
};

export const getProjectById = async (id) => {

  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );

  return rows[0];
};

export const updateProject = async (id, data) => {

  const { rows } = await pool.query(`
        UPDATE projects 
        SET
            title = $1,
            slug = $2,
            description = $3,
            year = $4,
            client = $5,
            cover_image_url = $6,
            sort_order = $7,
            updated_at = NOW()
        WHERE id = $8
        RETURNING *;
    `, [
    data.title,
    data.slug,
    data.description,
    data.year,
    data.client || null,
    data.cover_image_url || null,
    data.sort_order ?? 0,
    id
  ]);

  return rows[0];
};

export const deleteProject = async (id) => {

  const { rowCount } = await pool.query(
    "DELETE FROM projects WHERE id = $1",
    [id]
  );

  return rowCount;
};

//salir de borrador bloquea el slug para siempre: la URL ya pudo compartirse
export const publishProject = async (id) => {

  const { rows } = await pool.query(`
        UPDATE projects
        SET
            status = 'published',
            published_at = COALESCE(published_at, NOW()),
            slug_locked = true,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `, [id]);

  return rows[0];
};

export const unlistProject = async (id) => {

  const { rows } = await pool.query(`
        UPDATE projects
        SET
            status = 'unlisted',
            published_at = COALESCE(published_at, NOW()),
            slug_locked = true,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `, [id]);

  return rows[0];
};

//volver a borrador NO desbloquea el slug: el bloqueo es permanente
export const unpublishProject = async (id) => {

  const { rows } = await pool.query(`
        UPDATE projects
        SET
            status = 'draft',
            published_at = NULL,
            updated_at = NOW()
        WHERE id = $1
        RETURNING *;
    `, [id]);

  return rows[0];
};

//columnas explicitas y nunca `SELECT *`: estos endpoints no piden token, asi
//que no deben filtrar columnas internas como `status` o `slug_locked`
const PUBLIC_COLUMNS = `
    id, title, slug, description, cover_image_url, year, client, published_at
`;

export const getPublishedProjects = async () => {

  const { rows } = await pool.query(`
        SELECT ${PUBLIC_COLUMNS}
        FROM projects
        WHERE status = 'published'
        ORDER BY sort_order ASC, published_at DESC NULLS LAST, created_at DESC;
    `);

  return rows;
};

//`status` si viaja aqui, porque la pagina lo necesita para decidir el noindex
//de un no listado. Un borrador nunca sale por esta puerta
export const getPublicProjectBySlug = async (slug) => {

  const { rows } = await pool.query(`
        SELECT ${PUBLIC_COLUMNS}, status
        FROM projects
        WHERE slug = $1 AND status IN ('published', 'unlisted')
        LIMIT 1;
    `, [slug]);

  return rows[0];
};
