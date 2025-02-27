import { memo } from "react"
import {
  For,
  Text,
  VStack,
  Grid,
  Image,
  ScrollArea,
  SkeletonText,
} from "@yamada-ui/react"
import { useTextChange } from "../hooks/use-text-change"
import { Route as ExtensionsRoute } from "../../../routes/extensions.$id"
import type { ExtractedData } from "../types"

interface ExtractTextSearchData {
  results: ExtractedData[]
}

export const ResultsGrid = memo(() => {
  const { results = [] } = ExtensionsRoute.useSearch() as ExtractTextSearchData
  const { handleTextChange } = useTextChange()

  if (results.length === 0) return null

  return (
    <ScrollArea
      as={Grid}
      w="full"
      templateColumns="repeat(auto-fit, minmax(300px, 1fr))"
      gap="md"
      overflowY="auto"
      maxH="calc(100svh - 350px)"
    >
      <For each={results}>
        {(item: ExtractedData, index) => (
          <VStack
            gap="sm"
            p="sm"
            rounded="calc($spaces.md - $spaces.sm)"
            borderColor="border"
            borderWidth="1px"
          >
            <Image
              src={item.imageUrl}
              alt="Uploaded image"
              maxH="100px"
              objectFit="cover"
              rounded="md"
            />
            <SkeletonText
              loaded={!item.isLoading}
              minH="150px"
              maxH="500px"
              overflowY="auto"
            >
              <ScrollArea
                as={Text}
                fontSize="sm"
                contentEditable
                whiteSpace="pre-wrap"
                onBlur={(e) =>
                  handleTextChange(index, e.currentTarget.textContent || "")
                }
                p="2"
                borderWidth="1px"
                borderColor="border"
                rounded="md"
              >
                {item.text.length > 0 ? item.text : "Empty"}
              </ScrollArea>
            </SkeletonText>
          </VStack>
        )}
      </For>
    </ScrollArea>
  )
})

ResultsGrid.displayName = "ResultsGrid"
