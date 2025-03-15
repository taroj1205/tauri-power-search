import type { ExtensionMetadata } from "../utils/extensions";
import { metadata as extractTextMetadata } from "./extract-text/metadata";
import { metadata as pdfToolsMetadata } from "./pdf-tools/metadata";
import { metadata as calendarMetadata } from "./calendar/metadata";

export const extensionMetadata: Record<string, ExtensionMetadata> = {
  "extract-text": extractTextMetadata,
  "pdf-tools": pdfToolsMetadata,
  calendar: calendarMetadata,
};
