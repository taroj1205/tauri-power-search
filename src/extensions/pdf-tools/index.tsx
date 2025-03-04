import { Center, VStack } from "@yamada-ui/react"
import { memo } from "react"
import { PdfResults } from "./components/pdf-results"
import { PdfUploadButton } from "./components/pdf-upload-button"

export const PdfToolsExtension = memo(() => {
  return (
    <Center as={VStack} gap="md" h="full">
      <PdfUploadButton />
      <PdfResults />
    </Center>
  )
})

PdfToolsExtension.displayName = "PdfToolsExtension"
