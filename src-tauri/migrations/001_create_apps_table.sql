-- Create the apps table
CREATE TABLE IF NOT EXISTS apps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    path TEXT,
    version TEXT,
    publisher TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on the name column for faster searches
CREATE INDEX IF NOT EXISTS idx_apps_name ON apps(name);

-- Create an index on the path column for faster lookups and to ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_path ON apps(path) WHERE path IS NOT NULL;
