CREATE TABLE IF NOT EXISTS project_preview_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_preview_tokens_project_id
    ON project_preview_tokens(project_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_preview_tokens_token
    ON project_preview_tokens(token);
