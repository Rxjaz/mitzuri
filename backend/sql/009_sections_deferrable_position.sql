-- reordenar mueve varias posiciones a la vez, y un indice unico se valida fila
-- por fila: a mitad de la operacion dos filas chocan aunque el estado final sea
-- valido. Una restriccion diferible se valida al cerrar la transaccion
DROP INDEX IF EXISTS idx_sections_project_position;

ALTER TABLE sections
    ADD CONSTRAINT sections_project_position_unique
    UNIQUE (project_id, position) DEFERRABLE INITIALLY DEFERRED;
