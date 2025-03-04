import { invoke } from "@tauri-apps/api/core"

export interface AppInfo {
  name: string
  displayName: string
  execPath: string
  description?: string
  iconPath?: string
  publisher?: string
  version?: string
}

export interface AppIndexState {
  lastUpdated: number
  apps: AppInfo[]
}

const APP_INDEX_KEY = "app_index_state"

export async function getAppIndex(): Promise<AppIndexState | null> {
  try {
    const stored = localStorage.getItem(APP_INDEX_KEY)
    return stored ? JSON.parse(stored) : null
  } catch (error) {
    console.error("Failed to get app index:", error)
    return null
  }
}

export async function saveAppIndex(apps: AppInfo[]): Promise<void> {
  const state: AppIndexState = {
    lastUpdated: Date.now(),
    apps,
  }
  localStorage.setItem(APP_INDEX_KEY, JSON.stringify(state))
}

export async function checkAndUpdateIndex(): Promise<AppInfo[]> {
  try {
    // Start background indexing
    await invoke("start_background_indexing")

    // Get current index
    const currentIndex = await getAppIndex()

    // If no index exists or it's older than 1 hour, force reindex
    if (!currentIndex || Date.now() - currentIndex.lastUpdated > 3600000) {
      await invoke("reindex")
      const apps = await invoke<AppInfo[]>("search_apps", { pattern: "" })
      await saveAppIndex(apps)
      return apps
    }

    return currentIndex.apps
  } catch (error) {
    console.error("Failed to check and update index:", error)
    throw error
  }
}
