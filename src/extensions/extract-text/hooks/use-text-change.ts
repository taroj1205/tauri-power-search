import { useCallback } from "react"
import { Route as ExtensionsRoute } from "../../../routes/extensions.$id"
import type { PdfResult } from "../../pdf-tools/types"

export const useTextChange = () => {
  const navigate = ExtensionsRoute.useNavigate()

  const handleTextChange = useCallback(
    (index: number, newText: string) => {
      navigate({
        search: (prev) => {
          const results = Array.isArray(prev.results) ? [...prev.results] : []

          results[index] = results[index]
            ? {
                ...results[index],
                text: newText,
                pages: [
                  {
                    pageNumber: 1,
                    text: newText,
                    fileName: results[index].fileName || `file-${index}`,
                  },
                ],
              }
            : ({
                id: `temp-${index}`,
                fileName: `file-${index}`,
                text: newText,
                pages: [
                  {
                    pageNumber: 1,
                    text: newText,
                    fileName: `file-${index}`,
                  },
                ],
                imageUrl: "",
                isLoading: false,
                totalPages: 1,
                processingStage: "Complete",
                processingProgress: 1,
                processingMessage: "Text manually edited",
              } as PdfResult)

          return { results }
        },
      })
    },
    [navigate],
  )

  return { handleTextChange }
}
