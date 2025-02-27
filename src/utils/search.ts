import { invoke } from "@tauri-apps/api/core";
import { isNumber } from "@yamada-ui/react";
import Fuse from "fuse.js";
import { getExtensions } from "./extensions";
import type { ExtensionMetadata } from "./extensions";
import { calculate } from "./string";
import { DEFAULT_DISPLAY_COUNT } from "../constants";

interface InstalledApp {
  name: string;
  path: string | null;
  type: "app";
}

type CalculatorResult = {
  type: "calculator";
  value: string;
};

type LinkResult = {
  type: "link";
  value: string;
};

type InstalledAppResult = InstalledApp & {
  type: "app";
};

type ExtensionResult = ExtensionMetadata & {
  type: "extension";
  id: string;
};

export type SearchResult =
  | CalculatorResult
  | LinkResult
  | InstalledAppResult
  | ExtensionResult;

export type SearchCallback = (results: SearchResult[]) => void;

let fuseExtensions: Fuse<ExtensionResult> | null = null;

const fuseOptions = {
  keys: ["name", "publisher"],
  threshold: 0.4,
  distance: 100,
  minMatchCharLength: 1,
  shouldSort: true,
  includeScore: true,
};

export const initializeAppCache = async () => {
  try {
    const extensions = getExtensions();
    const extensionResults = extensions.map((extension) => ({
      ...extension,
      type: "extension" as const,
      id: extension.id,
    }));
    if (extensionResults.length > 0) {
      fuseExtensions = new Fuse(extensionResults, fuseOptions);
    }
  } catch (error) {
    console.error("Failed to initialize app cache:", error);
  }
};

export const search = async (
  query?: string,
  displayCount = DEFAULT_DISPLAY_COUNT,
  onResults?: SearchCallback
) => {
  const resultsArray: SearchResult[] = [];

  if (!query) {
    if (onResults) onResults([]);
    return [];
  }

  // Filter extensions using Fuse
  if (fuseExtensions && query.length > 0) {
    const searchResults = fuseExtensions.search(query);
    const matchingExtensions = searchResults
      .filter((result) => result.score && result.score < 0.6)
      .map((result) => result.item);
    if (matchingExtensions.length > 0) {
      resultsArray.push(...matchingExtensions);
    }
  }

  // calculator
  try {
    const num = calculate(query);
    if (isNumber(num))
      resultsArray.push({ type: "calculator", value: num.toString() });
  } catch (error) {
    // just ignore
  }

  // installed apps using backend search
  if (query.length > 0) {
    try {
      const matchingApps = await invoke<InstalledApp[]>("search_apps", {
        query,
        limit: displayCount,
      });
      console.log(matchingApps);
      if (matchingApps.length > 0) {
        resultsArray.push(
          ...matchingApps.map((app) => ({ ...app, type: "app" as const }))
        );
      }
    } catch (error) {
      console.error("Failed to search apps:", error);
    }
  }

  if (onResults) {
    onResults(resultsArray);
  }

  // text to link
  resultsArray.push({ type: "link", value: `https://${query}` });

  // google search
  resultsArray.push({
    type: "link",
    value: `https://google.com/search?q=${query}`,
  });

  return resultsArray;
};
