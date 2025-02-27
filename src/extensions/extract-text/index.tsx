import { memo } from "react"
import { VStack, Center } from "@yamada-ui/react"
import { UploadButton } from "./components/upload-button"
import { ResultsGrid } from "./components/results-grid"

export const ExtractTextExtension = memo(() => {
  return (
    <Center as={VStack} gap="md" h="full">
      <UploadButton />
      <ResultsGrid />
    </Center>
  )
})

ExtractTextExtension.displayName = "ExtractTextExtension"
