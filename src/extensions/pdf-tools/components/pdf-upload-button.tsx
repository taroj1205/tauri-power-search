import { FileTextIcon } from "@yamada-ui/lucide"
import { Button, FileInput, IconButton, Motion } from "@yamada-ui/react"
import { memo, useCallback, useRef } from "react"
import { Route as ExtensionsRoute } from "../../../routes/extensions.$id"
import { usePdfProcessing } from "../hooks/use-pdf-processing"
import type { PdfSearchData } from "../types"

export const PdfUploadButton = memo(() => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { results = [] } = ExtensionsRoute.useSearch() as PdfSearchData
  const { processPdfFiles } = usePdfProcessing()

  const handleFileChange = useCallback(
    (event: File[] | undefined) => {
      if (event) processPdfFiles(event)
    },
    [processPdfFiles],
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <>
      <FileInput
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf"
        display="none"
        multiple
      />
      <Motion
        animate={{
          width: results.length > 0 ? "48px" : "300px",
          height: "48px",
          transform:
            results.length > 0
              ? "translate(calc(50vw - 64px), calc(-50vh + 40px))"
              : "translate(-50%, -50%)",
        }}
        initial={{
          width: "300px",
          height: "48px",
          transform: "translate(-50%, -50%)",
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          position: "fixed",
          left: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <Motion
          animate={{
            opacity: results.length > 0 ? 0 : 1,
            scale: results.length > 0 ? 0.8 : 1,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
          }}
        >
          <Button
            startIcon={<FileTextIcon />}
            colorScheme="primary"
            size="lg"
            onClick={handleButtonClick}
          >
            Upload PDF to Extract Text
          </Button>
        </Motion>
        <Motion
          animate={{
            opacity: results.length > 0 ? 1 : 0,
            scale: results.length > 0 ? 1 : 0.8,
          }}
          initial={{
            opacity: 0,
            scale: 0.8,
          }}
          transition={{
            duration: 0.2,
            ease: "easeOut",
          }}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            zIndex: results.length === 0 ? -1 : undefined,
          }}
        >
          <IconButton
            icon={<FileTextIcon />}
            colorScheme="primary"
            size="md"
            onClick={handleButtonClick}
            aria-label="Upload more PDFs"
          />
        </Motion>
      </Motion>
    </>
  )
})

PdfUploadButton.displayName = "PdfUploadButton"
