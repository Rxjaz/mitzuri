ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS cover_media_id UUID REFERENCES media_assets(id) ON DELETE SET NULL;

-- las portadas que se subieron por el admin ya tienen su fila en media_assets;
-- se emparejan por URL. Las que se pegaron a mano no tienen respaldo y quedan
-- en NULL: hay que volver a subirlas
UPDATE projects p
SET cover_media_id = m.id
FROM media_assets m
WHERE m.original_url = p.cover_image_url;

ALTER TABLE projects DROP COLUMN cover_image_url;

CREATE INDEX IF NOT EXISTS idx_projects_cover_media_id ON projects(cover_media_id);
