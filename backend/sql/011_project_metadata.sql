ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS category TEXT,
    ADD COLUMN IF NOT EXISTS tools TEXT[] NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS accent_color TEXT,
    ADD COLUMN IF NOT EXISTS credits TEXT;

ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_category_check;
ALTER TABLE projects ADD CONSTRAINT projects_category_check
    CHECK (category IS NULL OR category IN ('editorial', 'marca', 'ilustracion'));

-- solo hex de seis digitos: cualquier otra cosa entraria como variable CSS
-- directo al atributo `style` de la pagina publica
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_accent_color_check;
ALTER TABLE projects ADD CONSTRAINT projects_accent_color_check
    CHECK (accent_color IS NULL OR accent_color ~ '^#[0-9A-Fa-f]{6}$');

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
