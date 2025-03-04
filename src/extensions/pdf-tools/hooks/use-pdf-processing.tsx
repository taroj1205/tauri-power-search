import { invoke } from "@tauri-apps/api/core"
import { listen } from "@tauri-apps/api/event"
import { useCallback } from "react"
import { Route as ExtensionsRoute } from "../../../routes/extensions.$id"
import type { PdfResult } from "../types"

interface ProgressEvent {
  id: string
  stage: string
  progress: number
  message: string
}

interface PageExtractedEvent {
  id: string
  page_number: number
  text: string
  total_pages: number
  file_name: string
}

export const usePdfProcessing = () => {
  const navigate = ExtensionsRoute.useNavigate()
  const { results = [] } = ExtensionsRoute.useSearch() as {
    results?: PdfResult[]
  }
  listen<ProgressEvent>("pdf-progress", (event) => {
    const { id, stage, progress, message } = event.payload

    navigate({
      search: (prev) => {
        const updatedResults = [...(prev.results || [])]
        const existingIndex = updatedResults.findIndex(
          (r) => r.id === id && r.isLoading,
        )

        if (existingIndex !== -1) {
          updatedResults[existingIndex] = {
            ...updatedResults[existingIndex],
            processingStage: stage,
            processingProgress: progress,
            processingMessage: message,
          }
        }

        return { results: updatedResults }
      },
    })
  })

  listen<PageExtractedEvent>("pdf-page-extracted", (event) => {
    const { id, page_number, text, total_pages, file_name } = event.payload

    navigate({
      search: (prev) => {
        const updatedResults = [...(prev.results || [])]
        const existingIndex = updatedResults.findIndex((r) => r.id === id)

        if (existingIndex !== -1) {
          const currentResult = updatedResults[existingIndex]
          const updatedPages = [...(currentResult.pages || [])]

          // Update or add the page
          const pageIndex = updatedPages.findIndex(
            (p) => p.pageNumber === page_number,
          )
          if (pageIndex !== -1) {
            updatedPages[pageIndex] = {
              pageNumber: page_number,
              text,
              fileName: file_name,
            }
          } else {
            updatedPages.push({
              pageNumber: page_number,
              text,
              fileName: file_name,
            })
          }

          // Sort pages by number
          updatedPages.sort((a, b) => a.pageNumber - b.pageNumber)

          updatedResults[existingIndex] = {
            ...currentResult,
            pages: updatedPages,
            totalPages: total_pages,
            text: updatedPages.map((p) => p.text).join("\n"),
            fileName: file_name,
          }
        }

        return { results: updatedResults }
      },
    })
  })

  const processPdfFiles = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return

      // Update search state with loading results
      const initialResults: PdfResult[] = files.map((file) => ({
        id: `pdf-${Date.now()}-${file.name}`,
        fileName: file.name,
        pages: [],
        isLoading: true,
        totalPages: 0,
        text: "",
        processingStage: "Starting",
        processingProgress: 0,
        processingMessage: "Preparing to process PDF",
      }))

      navigate({
        search: (prev) => ({
          ...prev,
          results: [...(prev.results || []), ...initialResults],
        }),
      })

      // Process PDFs
      const processedResults = await Promise.all(
        files.map(async (file) => {
          try {
            // Read file as base64
            const fileData = await readFileAsBase64(file)

            const result = (await invoke("extract_pdf_text", {
              fileData,
              fileName: file.name,
            })) as PdfResult

            // Update search state with processed result
            navigate({
              search: (prev) => {
                const updatedResults = [...(prev.results || [])]
                const existingIndex = updatedResults.findIndex(
                  (r) => r.fileName === result.fileName && r.isLoading,
                )

                if (existingIndex !== -1) {
                  updatedResults[existingIndex] = {
                    ...result,
                    isLoading: false,
                    processingStage: "Complete",
                    processingProgress: 1,
                    processingMessage: "PDF processing complete",
                  }
                }

                return { ...prev, results: updatedResults }
              },
            })

            return result
          } catch (error) {
            console.error(`Failed to process PDF ${file.name}:`, error)

            // Update search state with error
            navigate({
              search: (prev) => {
                const updatedResults = [...(prev.results || [])]
                const existingIndex = updatedResults.findIndex(
                  (r) => r.fileName === file.name && r.isLoading,
                )

                if (existingIndex !== -1) {
                  updatedResults[existingIndex] = {
                    ...updatedResults[existingIndex],
                    isLoading: false,
                    processingStage: "Error",
                    processingProgress: 0,
                    processingMessage: `Failed to process: ${error}`,
                    text: "Failed to extract text",
                  }
                }

                return { ...prev, results: updatedResults }
              },
            })

            return null
          }
        }),
      )

      // Filter out null results and cast to PdfResult[]
      const validResults = processedResults.filter(
        (result): result is PdfResult => result !== null,
      )
      return validResults
    },
    [navigate],
  )

  return {
    processPdfFiles,
    results,
  }
}

// Helper function to read file as base64
async function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      resolve(reader.result as string)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
