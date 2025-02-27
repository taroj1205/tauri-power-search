import { invoke } from "@tauri-apps/api/core";
import type { SearchResult } from "./search";

export async function getInstalledApps(): Promise<SearchResult[]> {
  const apps = invoke<SearchResult[]>("get_apps");
  console.log(apps.then((apps) => console.log(apps)));
  return apps;
}
