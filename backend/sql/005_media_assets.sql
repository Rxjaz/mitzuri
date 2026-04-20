CREATE TABLE IF NOT EXISTS media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_url TEXT NOT NULL,
    optimized_url TEXT,
    alt_text TEXT,
    mime_type TEXT NOT NULL,
    width INT,
    height INT,
    file_size_bytes BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT media_assets_file_size_check CHECK (
        file_size_bytes IS NULL OR file_size_bytes >= 0
    )
);
