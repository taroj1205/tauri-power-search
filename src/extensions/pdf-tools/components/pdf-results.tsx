import { listen } from "@tauri-apps/api/event"
// import { useQueryClient } from "@tanstack/react-query"
import { CopyIcon } from "@yamada-ui/lucide"
import {
  Accordion,
  AccordionItem,
  AccordionLabel,
  AccordionPanel,
  Badge,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Heading,
  IconButton,
  Progress,
  ScrollArea,
  Spacer,
  Text,
  Tooltip,
  VStack,
  useNotice,
} from "@yamada-ui/react"
import { memo, useCallback, useRef, useState } from "react"
// import { Route as ExtensionsRoute } from "../../../routes/extensions.$id"
import type { PdfPage } from "../types"

interface PageExtractedEvent {
  id: string
  page_number: number
  text: string
  total_pages: number
  file_name: string
}

interface PageProgressEvent {
  id: string
  page_number: number
  total_page: number
}

export const PdfResults = memo(() => {
  // const navigate = ExtensionsRoute.useNavigate()
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([])
  // const queryClient = useQueryClient()
  const notice = useNotice({ placement: "bottom-right" })
  // const [totalPages, setTotalPages] = useState<number>(0)

  const [extractionData, setExtractionData] = useState<
    Record<string, PdfPage[]>
  >({})
  const [progressData, setProgressData] = useState<
    Record<string, { current: number; total: number }>
  >({})

  listen<PageProgressEvent>("pdf-progress", (event) => {
    const { id, page_number, total_page } = event.payload
    setProgressData(
      (prev: Record<string, { current: number; total: number }> = {}) => ({
        ...prev,
        [id]: { current: page_number, total: total_page },
      }),
    )
    // setTotalPages(total_page)
  })

  listen<PageExtractedEvent>("pdf-page-extracted", (event) => {
    const { id, page_number, text, file_name } = event.payload

    setExtractionData((prev: Record<string, PdfPage[]> = {}) => ({
      ...prev,
      [id]: [
        ...(prev[id] || []),
        {
          pageNumber: page_number,
          text,
          fileName: file_name,
        },
      ],
    }))

    // // Also update the individual extraction query
    // queryClient.setQueryData(["pdf-extraction", id], (old: any) => ({
    //   ...old,
    //   pages:
    //     queryClient.getQueryData<Record<string, PdfPage[]>>([
    //       "pdf-extractions",
    //     ])?.[id] || [],
    // }))

    // if (page_number === total_pages) {
    //   notice({
    //     title: "Extraction Complete",
    //     description: `Successfully extracted ${total_pages} pages`,
    //     status: "success",
    //   })
    // }
  })

  const handleCopy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text)
      notice({
        title: "Copied",
        description: "Page text copied to clipboard",
        status: "success",
        duration: 2000,
      })
    },
    [notice],
  )

  const setScrollRef = useCallback((index: number) => {
    return (el: HTMLDivElement | null) => {
      scrollRefs.current[index] = el
    }
  }, [])

  return (
    <ScrollArea mt="2xl" h="full">
      <Accordion defaultIndex={[0]} multiple>
        {Object.entries(extractionData)?.map(([id, pages]) => {
          const progress = progressData[id]
          const isComplete = progress?.current === progress?.total

          return (
            <AccordionItem as={Card} key={id}>
              <AccordionLabel as={CardHeader}>
                <HStack>
                  <VStack>
                    <HStack>
                      <Heading size="md" minW="md">
                        {extractionData[id][0].fileName}
                      </Heading>
                      <Badge colorScheme={isComplete ? "green" : "blue"}>
                        {isComplete ? "Complete" : "Extracting..."}
                      </Badge>
                    </HStack>
                    {progress.current ? (
                      <Text size="sm" color="gray.500">
                        {progress
                          ? `Page ${progress.current} of ${progress.total}`
                          : "Processing..."}
                      </Text>
                    ) : null}
                  </VStack>
                  <Tooltip label="Copy All Text">
                    <IconButton
                      aria-label="Copy all text"
                      icon={<CopyIcon />}
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const text = pages.map((p) => p.text).join("\n\n")
                        handleCopy(text)
                      }}
                    />
                  </Tooltip>
                </HStack>
                {progress && (
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    size="sm"
                    colorScheme={isComplete ? "green" : "blue"}
                  />
                )}
              </AccordionLabel>
              <CardBody as={AccordionPanel}>
                <VStack>
                  {pages.map((page, index) => (
                    <Card key={page.pageNumber} variant="outline">
                      <CardHeader>
                        <Text fontWeight="bold">{page.pageNumber}</Text>
                        <Spacer />
                        <Tooltip label="Copy Page Text">
                          <IconButton
                            aria-label="Copy page text"
                            icon={<CopyIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const text = page.text
                              handleCopy(text)
                            }}
                          />
                        </Tooltip>
                      </CardHeader>
                      <CardBody>
                        <ScrollArea
                          ref={setScrollRef(index)}
                          maxH="300px"
                          overflowY="auto"
                          whiteSpace="pre-wrap"
                          p={2}
                          borderRadius="md"
                          fontSize="sm"
                          contentEditable
                          w="full"
                        >
                          {page.text}
                        </ScrollArea>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </CardBody>
            </AccordionItem>
          )
        })}
      </Accordion>
    </ScrollArea>
  )
})

PdfResults.displayName = "PdfResults"
