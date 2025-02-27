import { memo } from "react"
import { VStack, Center } from "@yamada-ui/react"
import { PdfUploadButton } from "./components/pdf-upload-button"
import { PdfResults } from "./components/pdf-results"

export const PdfToolsExtension = memo(() => {
  return (
    <Center as={VStack} gap="md" h="full">
      <PdfUploadButton />
      <PdfResults />
    </Center>
  )
})

PdfToolsExtension.displayName = "PdfToolsExtension"
