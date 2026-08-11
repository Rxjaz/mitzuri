ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS slug_locked BOOLEAN NOT NULL DEFAULT false;

-- los proyectos que ya salieron de borrador tienen su URL potencialmente
-- compartida, asi que nacen bloqueados
UPDATE projects SET slug_locked = true WHERE status <> 'draft';

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
    CHECK (status IN ('draft', 'unlisted', 'published'));

-- un borrador nunca tiene fecha de publicacion; unlisted y published si pueden
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_published_at_check;
ALTER TABLE projects ADD CONSTRAINT projects_published_at_check
    CHECK (published_at IS NULL OR status <> 'draft');
