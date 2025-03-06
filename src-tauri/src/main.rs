// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod utils;
use api::image::extract_text_from_base64;
use api::pdf::extract_pdf_text;
use api::window::center_window_on_current_monitor;
// use utils::apps::{
//     get_cached_apps, initialize_apps_in_background, open_app, refresh_apps, search_apps,
// };

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};
#[cfg(target_os = "windows")]
use window_vibrancy::apply_acrylic;
#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, clear_vibrancy, NSVisualEffectMaterial};

#[tauri::command]
fn get_apps() -> Vec<utils::apps::InstalledApp> {
    get_cached_apps()
}

fn toggle_app_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("popup") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            center_window_on_current_monitor(&window);
            let _ = window.set_focus();
        }
    }
}

#[tauri::command(rename_all = "snake_case")]
fn message(message: String) {
    println!("{}", message);
}

fn main() {
    // initialize_apps_in_background();

    let mut builder = tauri::Builder::default().plugin(tauri_plugin_fs::init());
    #[cfg(desktop)]
    {
        builder = builder.plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            let _ = app
                .get_webview_window("popup")
                .expect("no popup window")
                .set_focus();
        }));
    }
    builder
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_clipboard::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                // use tauri::Manager;
                use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};

                use tauri_plugin_autostart::MacosLauncher;

                let _ = app.handle().plugin(tauri_plugin_autostart::init(
                    MacosLauncher::LaunchAgent,
                    Some(vec![]),
                ));

                // Try to register the global shortcut with error handling
                match app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_shortcuts(["alt+space"])?
                        .with_handler(|app, shortcut, event| {
                            if event.state == ShortcutState::Pressed {
                                if shortcut.matches(Modifiers::ALT, Code::Space) {
                                    toggle_app_window(app);
                                }
                            }
                        })
                        .build(),
                ) {
                    Ok(_) => println!("Global shortcut registered successfully"),
                    Err(e) => eprintln!("Failed to register global shortcut (Alt+H may be in use by another application): {}", e),
                }
            }

            let window = app.get_webview_window("popup").expect("Failed to create popup window");

            #[cfg(target_os = "macos")]
            apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                .expect("Unsupported platform! 'apply_vibrancy' is only supported on macOS");

            #[cfg(target_os = "windows")]
            // apply_mica(&window, Some(true))
            //     .expect("Unsupported platform! 'apply_mica' is only supported on Windows");
            apply_acrylic(&window, Some((0, 0, 0, 30))).expect("Unsupported platform! 'apply_acrylic' is only supported on Windows");

            use std::sync::{Arc, Mutex};
            let app_handle = Arc::new(Mutex::new(app.handle().clone()));
            let autostart_i = MenuItem::with_id(app, "autostart", "Enable Autostart", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&autostart_i,&quit_i])?;

            let _tray = TrayIconBuilder::new()
                .on_menu_event(move |menu_app, event| {
                    let app_handle = app_handle.lock().unwrap();
                    match event.id.as_ref() {
                        "quit" => {
                            menu_app.exit(0);
                        }
                        "autostart" => {
                            use tauri_plugin_autostart::ManagerExt;
                            let autostart_manager = app_handle.autolaunch();
                            match autostart_manager.is_enabled() {
                                Ok(true) => {
                                    let _ = autostart_manager.disable();
                                    let _ = autostart_i.set_text("Enable Autostart");
                                }
                                Ok(false) => {
                                    let _ = autostart_manager.enable();
                                    let _ = autostart_i.set_text("Disable Autostart");
                                }
                                Err(e) => {
                                    eprintln!("Error checking autostart status: {:?}", e);
                                }
                            }
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        // in this example, let's show and focus the main window when the tray is clicked
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("popup") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .menu(&menu)
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .build(app)?;

            Ok(())
        })
        .on_window_event(|app, event| {
            #[cfg(not(dev))]
            if let tauri::WindowEvent::Focused(false) = event {
                if let Some(window) = app.get_webview_window("popup") {
                    let _ = window.hide();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            message,
            // get_apps,
            extract_text_from_base64,
            extract_pdf_text,
            // open_app,
            // search_apps,
            // refresh_apps
        ])
        .on_window_event(|_app, _event| {
            // Placeholder for window event handling
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
