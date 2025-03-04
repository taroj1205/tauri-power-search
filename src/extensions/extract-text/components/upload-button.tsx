import { UploadIcon } from "@yamada-ui/lucide"
import { Button, IconButton, Motion } from "@yamada-ui/react"
import { memo, useCallback, useRef } from "react"
import { Route as ExtensionsRoute } from "../../../routes/extensions.$id"
import { useFileProcessing } from "../hooks/use-file-processing"

export const UploadButton = memo(() => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { results = [] } = ExtensionsRoute.useSearch()
  const { processFiles } = useFileProcessing()

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(event.target.files)
    },
    [processFiles],
  )

  const handleButtonClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: "none" }}
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
          top: "50%",
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
            startIcon={<UploadIcon />}
            colorScheme="primary"
            size="lg"
            onClick={handleButtonClick}
            w="full"
          >
            Upload Images
          </Button>
        </Motion>
        <Motion
          animate={{
            opacity: results.length > 0 ? 1 : 0,
            scale: results.length > 0 ? 1 : 0.8,
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
            icon={<UploadIcon />}
            colorScheme="primary"
            size="md"
            onClick={handleButtonClick}
            aria-label="Upload more images"
          />
        </Motion>
      </Motion>
    </>
  )
})
