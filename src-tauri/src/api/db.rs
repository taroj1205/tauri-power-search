use serde::{Deserialize, Serialize};
use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstalledApp {
    pub id: Option<i64>,
    pub name: String,
    pub path: Option<String>,
    pub version: Option<String>,
    pub publisher: Option<String>,
}

pub const MIGRATIONS: [Migration; 1] = [Migration {
    version: 1,
    description: "Create installed_apps table",
    sql: "CREATE TABLE IF NOT EXISTS installed_apps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        path TEXT,
        version TEXT,
        publisher TEXT
    )",
    kind: MigrationKind::Up,
}];

pub async fn insert_app(
    db: tauri_plugin_sql::SqlitePool,
    app: &InstalledApp,
) -> Result<i64, Box<dyn std::error::Error>> {
    let row_id = sqlx::query!(
        "INSERT INTO installed_apps (name, path, version, publisher) VALUES (?, ?, ?, ?)",
        app.name,
        app.path,
        app.version,
        app.publisher
    )
    .execute(&db)
    .await?
    .last_insert_rowid();

    Ok(row_id)
}

pub async fn get_all_apps(
    db: tauri_plugin_sql::SqlitePool,
) -> Result<Vec<InstalledApp>, Box<dyn std::error::Error>> {
    let apps = sqlx::query_as!(
        InstalledApp,
        "SELECT id, name, path, version, publisher FROM installed_apps"
    )
    .fetch_all(&db)
    .await?;

    Ok(apps)
}

pub async fn clear_apps(
    db: tauri_plugin_sql::SqlitePool,
) -> Result<(), Box<dyn std::error::Error>> {
    sqlx::query!("DELETE FROM installed_apps")
        .execute(&db)
        .await?;

    Ok(())
}
