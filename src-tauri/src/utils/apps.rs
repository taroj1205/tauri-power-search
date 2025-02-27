use fuse_rust::Fuse;
use log::error;
use once_cell::sync::Lazy;
use serde::{Deserialize, Serialize};
use serde_json;
use std::process::Command;
use std::str;
use std::sync::Mutex;

static INSTALLED_APPS: Lazy<Mutex<Vec<InstalledApp>>> = Lazy::new(|| Mutex::new(Vec::new()));
static INITIALIZED: Lazy<Mutex<bool>> = Lazy::new(|| Mutex::new(false));

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InstalledApp {
    pub name: String,
    pub path: Option<String>,
}

pub fn get_installed_apps() -> Vec<InstalledApp> {
    let mut apps = Vec::new();

    // Get apps from user's Start Menu
    let user_profile = std::env::var("USERPROFILE").unwrap();
    let command = format!(
        "Get-ChildItem -Path \"{}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\" -Recurse -Filter *.lnk | ForEach-Object {{ [PSCustomObject]@{{ name = $_.BaseName; path = $_.FullName; version = $null; publisher = $null; install_date = $null; package_full_name = $null }} }} | ConvertTo-Json",
        user_profile
    );

    let user_start_menu = Command::new("powershell")
        .args(["-Command", &command])
        .output()
        .expect("Failed to execute PowerShell command");

    // Parse JSON output into InstalledApp structs
    if let Ok(output) = str::from_utf8(&user_start_menu.stdout) {
        if let Ok(parsed_apps) = serde_json::from_str::<Vec<InstalledApp>>(output) {
            apps.extend(parsed_apps);
        }
    }

    // Get apps from system-wide Start Menu
    let system_command = "Get-ChildItem -Path \"C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\" -Recurse -Filter *.lnk | ForEach-Object { [PSCustomObject]@{ name = $_.BaseName; path = $_.FullName; version = $null; publisher = $null; install_date = $null; package_full_name = $null } } | ConvertTo-Json";

    let system_start_menu = Command::new("powershell")
        .args(["-Command", system_command])
        .output()
        .expect("Failed to execute PowerShell command");

    if let Ok(output) = str::from_utf8(&system_start_menu.stdout) {
        if let Ok(parsed_apps) = serde_json::from_str::<Vec<InstalledApp>>(output) {
            apps.extend(parsed_apps);
        }
    }

    // Sort apps by name (case-insensitive)
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    apps
}

pub fn initialize_apps_in_background() {
    std::thread::spawn(|| {
        let mut apps = get_installed_apps();
        apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

        // Debug print detected apps
        println!("Detected {} apps:", apps.len());

        if let Ok(mut installed_apps) = INSTALLED_APPS.lock() {
            *installed_apps = apps
                .into_iter()
                .map(|app| InstalledApp {
                    name: app
                        .name
                        .strip_suffix(".lnk")
                        .unwrap_or(&app.name)
                        .to_string(),
                    path: app.path,
                })
                .collect();

            if let Ok(mut initialized) = INITIALIZED.lock() {
                *initialized = true;
            }
        }
    });
}

#[tauri::command]
pub fn get_cached_apps() -> Vec<InstalledApp> {
    INSTALLED_APPS.lock().unwrap().clone()
}

#[tauri::command]
pub fn open_app(app_path: String) -> Result<(), String> {
    let mut command = Command::new("rundll32.exe");
    command.arg("shell32.dll,ShellExec_RunDLL");
    command.arg(&app_path);

    command.spawn().map_err(|e| {
        error!("Failed to open app at path '{}': {}", app_path, e);
        e.to_string()
    })?;
    Ok(())
}

#[tauri::command]
pub fn search_apps(query: String, limit: Option<usize>) -> Vec<InstalledApp> {
    if !INITIALIZED.lock().unwrap().clone() {
        initialize_apps_in_background();
    }
    let apps = get_cached_apps();
    let fuse = Fuse::default();

    if query.is_empty() {
        return apps;
    }

    // Handle the Option properly
    let pattern = match fuse.create_pattern(&query) {
        Some(p) => p,
        None => return Vec::new(),
    };

    let mut results: Vec<(f64, &InstalledApp)> = apps
        .iter()
        .filter_map(|app| {
            fuse.search(Some(&pattern), &app.name)
                .map(|score_result| (score_result.score, app))
        })
        .collect();

    results.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

    let limit = limit.unwrap_or(usize::MAX);

    results
        .into_iter()
        .take(limit)
        .map(|(_, app)| app.clone())
        .collect()
}
