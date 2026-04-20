CREATE TABLE IF NOT EXISTS sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    content JSONB NOT NULL,
    position INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT sections_position_check CHECK (position > 0)
);

CREATE INDEX IF NOT EXISTS idx_sections_project_id ON sections(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sections_project_position
    ON sections(project_id, position);
