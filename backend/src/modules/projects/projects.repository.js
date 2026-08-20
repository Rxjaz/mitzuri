import { pool } from "../../shared/db/index.js";

//la portada viaja siempre como objeto, armada en el mismo SELECT con un LEFT
//JOIN. Nunca una segunda consulta por proyecto
const COVER_JSON = `
    CASE
        WHEN m.id IS NULL THEN NULL
        ELSE json_build_object(
            'id', m.id,
            'url', m.original_url,
            'alt', m.alt_text,
            'width', m.width,
            'height', m.height
        )
    END AS cover
`;

const COVER_JOIN = "LEFT JOIN media_assets m ON m.id = p.cover_media_id";

export const getAllProjects = async () => {

  const { rows } = await pool.query(`
        SELECT p.*, ${COVER_JSON}
        FROM projects p
        ${COVER_JOIN}
        ORDER BY p.created_at DESC;
    `);

  return rows;
};

export const createProject = async (data) => {

  const { rows } = await pool.query(`
        INSERT INTO projects (
            title, slug, description, year, client, cover_media_id, sort_order,
            category, tools, accent_color, credits
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id;
    `, [
    data.title,
    data.slug,
    data.description,
    data.year,
    data.client || null,
    data.cover_media_id ?? null,
    data.sort_order ?? 0,
    data.category ?? null,
    //`pg` manda el array de JavaScript como `TEXT[]` sin conversion manual
    data.tools ?? [],
    data.accent_color ?? null,
    data.credits ?? null
  ]);

  //se relee para devolver la portada ya resuelta: `RETURNING` no sabe hacer el join
  return await getProjectById(rows[0].id);
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

  const { rows } = await pool.query(`
        SELECT p.*, ${COVER_JSON}
        FROM projects p
        ${COVER_JOIN}
        WHERE p.id = $1;
    `, [id]);

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
            cover_media_id = $6,
            sort_order = $7,
            category = $8,
            tools = $9,
            accent_color = $10,
            credits = $11,
            updated_at = NOW()
        WHERE id = $12
        RETURNING id;
    `, [
    data.title,
    data.slug,
    data.description,
    data.year,
    data.client || null,
    data.cover_media_id ?? null,
    data.sort_order ?? 0,
    data.category ?? null,
    data.tools ?? [],
    data.accent_color ?? null,
    data.credits ?? null,
    id
  ]);

  if (!rows[0]) {
    return undefined;
  }

  return await getProjectById(rows[0].id);
};

export const deleteProject = async (id) => {

  const { rowCount } = await pool.query(
    "DELETE FROM projects WHERE id = $1",
    [id]
  );

  return rowCount;
};

//las transiciones de estado no tocan la portada, pero la respuesta sigue el
//mismo contrato que el resto: siempre con `cover`
const setStatus = async (id, sql) => {

  const { rows } = await pool.query(sql, [id]);

  if (!rows[0]) {
    return undefined;
  }

  return await getProjectById(rows[0].id);
};

//salir de borrador bloquea el slug para siempre: la URL ya pudo compartirse
export const publishProject = async (id) => {

  return await setStatus(id, `
        UPDATE projects
        SET
            status = 'published',
            published_at = COALESCE(published_at, NOW()),
            slug_locked = true,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id;
    `);
};

export const unlistProject = async (id) => {

  return await setStatus(id, `
        UPDATE projects
        SET
            status = 'unlisted',
            published_at = COALESCE(published_at, NOW()),
            slug_locked = true,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id;
    `);
};

//volver a borrador NO desbloquea el slug: el bloqueo es permanente
export const unpublishProject = async (id) => {

  return await setStatus(id, `
        UPDATE projects
        SET
            status = 'draft',
            published_at = NULL,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id;
    `);
};

//columnas explicitas y nunca `SELECT *`: estos endpoints no piden token, asi
//que no deben filtrar columnas internas como `status` o `slug_locked`
const PUBLIC_COLUMNS = `
    p.id, p.title, p.slug, p.description, p.year, p.client, p.published_at,
    p.category, p.tools, p.accent_color, p.credits
`;

export const getPublishedProjects = async () => {

  const { rows } = await pool.query(`
        SELECT ${PUBLIC_COLUMNS}, ${COVER_JSON}
        FROM projects p
        ${COVER_JOIN}
        WHERE p.status = 'published'
        ORDER BY p.sort_order ASC, p.published_at DESC NULLS LAST, p.created_at DESC;
    `);

  return rows;
};

//`status` si viaja aqui, porque la pagina lo necesita para decidir el noindex
//de un no listado. Un borrador nunca sale por esta puerta
export const getPublicProjectBySlug = async (slug) => {

  const { rows } = await pool.query(`
        SELECT ${PUBLIC_COLUMNS}, p.status, ${COVER_JSON}
        FROM projects p
        ${COVER_JOIN}
        WHERE p.slug = $1 AND p.status IN ('published', 'unlisted')
        LIMIT 1;
    `, [slug]);

  return rows[0];
};
