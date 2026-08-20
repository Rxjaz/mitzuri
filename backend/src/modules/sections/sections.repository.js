import { pool } from "../../shared/db/index.js";

export const getByProject = async (projectId) => {

  const { rows } = await pool.query(`
        SELECT * FROM sections
        WHERE project_id = $1
        ORDER BY position ASC;
    `, [projectId]);

  return rows;
};

export const getById = async (id) => {

  const { rows } = await pool.query(
    "SELECT * FROM sections WHERE id = $1",
    [id]
  );

  return rows[0];
};

export const create = async (projectId, type, content, position) => {

  const { rows } = await pool.query(`
        INSERT INTO sections (project_id, type, content, position)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `, [projectId, type, content, position]);

  return rows[0];
};

//solo el contenido: el tipo, la posicion y el proyecto no se tocan por esta via
export const update = async (id, content) => {

  const { rows } = await pool.query(`
        UPDATE sections
        SET
            content = $1,
            updated_at = NOW()
        WHERE id = $2
        RETURNING *;
    `, [content, id]);

  return rows[0];
};

export const remove = async (id) => {

  const { rowCount } = await pool.query(
    "DELETE FROM sections WHERE id = $1",
    [id]
  );

  return rowCount;
};

export const getMaxPosition = async (projectId) => {

  const { rows } = await pool.query(`
        SELECT COALESCE(MAX(position), 0) AS max_position
        FROM sections
        WHERE project_id = $1;
    `, [projectId]);

  return Number(rows[0].max_position);
};

//todas las posiciones se mueven dentro de una sola transaccion: la restriccion
//diferible se valida al hacer COMMIT, no en cada UPDATE, asi que los choques
//intermedios no existen
export const reorder = async (projectId, orderedIds) => {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const [index, id] of orderedIds.entries()) {
      await client.query(`
                UPDATE sections
                SET position = $1, updated_at = NOW()
                WHERE id = $2 AND project_id = $3;
            `, [index + 1, id, projectId]);
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

//tras borrar quedan huecos en la numeracion; renumerar de 1 a N los cierra
export const compactPositions = async (projectId) => {

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`
            UPDATE sections AS s
            SET position = ordered.new_position, updated_at = NOW()
            FROM (
                SELECT id, ROW_NUMBER() OVER (ORDER BY position ASC) AS new_position
                FROM sections
                WHERE project_id = $1
            ) AS ordered
            WHERE s.id = ordered.id AND s.position <> ordered.new_position;
        `, [projectId]);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

//el feed publico no las trae; la pagina de proyecto si, en una sola peticion
export const getPublicByProject = async (projectId) => {

  const { rows } = await pool.query(`
        SELECT id, type, content, position
        FROM sections
        WHERE project_id = $1
        ORDER BY position ASC;
    `, [projectId]);

  return rows;
};
