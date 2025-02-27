import { useCallback } from "react";
import { useLoading } from "@yamada-ui/react";
import { invoke } from "@tauri-apps/api/core";
import { useNotice } from "@yamada-ui/react";
import { Route as ExtensionsRoute } from "../../../routes/extensions.$id";
import type { PdfResult } from "../../pdf-tools/types";

export const useFileProcessing = () => {
  const { page } = useLoading();
  const notice = useNotice();
  const navigate = ExtensionsRoute.useNavigate();

  const processFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) =>
        file.type.startsWith("image/")
      );

      if (validFiles.length === 0) {
        notice({
          title: "Invalid files",
          description: "Please select image files only",
          status: "error",
        });
        return;
      }

      // Create placeholder results with loading state
      const placeholders: PdfResult[] = validFiles.map((file) => ({
        id: `image-${crypto.randomUUID()}`,
        fileName: file.name,
        text: "",
        pages: [{
          pageNumber: 1,
          text: "",
          fileName: file.name
        }],
        imageUrl: URL.createObjectURL(file),
        isLoading: true,
        totalPages: 1,
        processingStage: "Starting",
        processingProgress: 0,
        processingMessage: "Preparing to extract text"
      }));

      navigate({
        search: () => ({
          results: placeholders,
        }),
      });

      const processPromises = validFiles.map(async (file, index) => {
        const buffer = await file.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(buffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        try {
          const placeholderId = placeholders[index].id;
          const extractedText = await invoke<string>("extract_text_from_base64", {
            base64Str: base64,
            id: placeholderId,
          });

          navigate({
            search: (prev) => {
              const results = [...(prev.results ?? [])] as PdfResult[];
              results[index] = {
                ...results[index],
                text: extractedText,
                pages: [{
                  pageNumber: 1,
                  text: extractedText,
                  fileName: file.name
                }],
                isLoading: false,
                processingStage: "Complete",
                processingProgress: 1,
                processingMessage: "Text extraction complete"
              };
              return { results };
            },
          });
          return { success: true, index };
        } catch (error) {
          console.error("Failed to process file:", error);
          navigate({
            search: (prev) => {
              const results = [...(prev.results ?? [])] as PdfResult[];
              results[index] = {
                ...results[index],
                text: "Error extracting text",
                pages: [{
                  pageNumber: 1,
                  text: "Error extracting text",
                  fileName: file.name
                }],
                isLoading: false,
                processingStage: "Error",
                processingProgress: 0,
                processingMessage: `Failed to extract text: ${error}`
              };
              return { results };
            },
          });
          return { success: false, index };
        }
      });

      await Promise.all(processPromises);
      page.finish();
    },
    [page, notice, navigate]
  );

  return { processFiles };
};
