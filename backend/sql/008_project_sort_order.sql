-- el orden del portafolio es editorial, no cronologico: con pocos proyectos
-- publicos importa mas cual va primero que cuando se hizo
ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(sort_order);
