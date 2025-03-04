import { Center, VStack } from "@yamada-ui/react"
import { memo } from "react"
import { ResultsGrid } from "./components/results-grid"
import { UploadButton } from "./components/upload-button"

export const ExtractTextExtension = memo(() => {
  return (
    <Center as={VStack} gap="md" h="full">
      <UploadButton />
      <ResultsGrid />
    </Center>
  )
})

ExtractTextExtension.displayName = "ExtractTextExtension"
