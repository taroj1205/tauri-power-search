import {
  Center,
  Highlight,
  memo,
  NativeTable,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@yamada-ui/react";
import {
  VStack,
  HStack,
  Text,
  Badge,
  Separator,
  ScrollArea,
} from "@yamada-ui/react";
import {
  AppWindowIcon,
  BlocksIcon,
  CalculatorIcon,
  LinkIcon,
  FileIcon,
  CopyIcon,
} from "@yamada-ui/lucide";
import type { SearchResult } from "../../../utils/search";
import { useClipboard } from "@yamada-ui/react";

export interface ResultDetailsProps {
  result?: SearchResult;
  query?: string | null;
}

// const getRelativeTime = (date: Date): string => {
//   const now = new Date();
//   const diff = now.getTime() - date.getTime();
//   const seconds = Math.floor(diff / 1000);
//   const minutes = Math.floor(seconds / 60);
//   const hours = Math.floor(minutes / 60);
//   const days = Math.floor(hours / 24);

//   if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
//   if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
//   if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
//   return "just now";
// };

export const ResultDetails = memo(({ result, query }: ResultDetailsProps) => {
  const { onCopy } = useClipboard();

  if (!result) {
    return (
      <Center w="full" h="full">
        <Text color="muted">No result selected</Text>
      </Center>
    );
  }

  const renderIcon = () => {
    const iconProps = { boxSize: "2rem" };
    switch (result.type) {
      case "extension":
        return <BlocksIcon {...iconProps} />;
      case "calculator":
        return <CalculatorIcon {...iconProps} />;
      case "link":
        return <LinkIcon {...iconProps} />;
      case "app":
        return <AppWindowIcon {...iconProps} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  };

  const getContentType = () => {
    switch (result.type) {
      case "extension":
        return "Extension";
      case "calculator":
        return "Calculation";
      case "link":
        return "Web Link";
      case "app":
        return "Application";
      default:
        return "File";
    }
  };

  const handleCopy = () => {
    if (result.type === "link" || result.type === "calculator") {
      onCopy(result.value);
    }
  };

  return (
    <VStack w="full" h="full" overflow="hidden">
      {/* Header */}
      <HStack w="full" justify="space-between" align="center">
        <HStack>
          {renderIcon()}
          <Text fontSize="xl" fontWeight="bold" lineClamp={1}>
            {result.type === "extension" || result.type === "app"
              ? result.name
              : result.value}
          </Text>
        </HStack>
        <Badge variant="subtle" colorScheme="blue">
          {getContentType()}
        </Badge>
      </HStack>

      <Separator />

      {/* Content */}
      <VStack w="full" h="full">
        {/* Main Content */}
        <ScrollArea flexGrow="1">
          <Highlight
            as={Text}
            query={query?.split(" ") ?? []}
            markProps={{ px: 0 }}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            w="full"
            p={3}
            bg="whiteAlpha.100"
            borderRadius="md"
            h="full"
          >
            {result.type === "extension" || result.type === "app"
              ? result.name
              : result.value}
          </Highlight>
        </ScrollArea>

        {/* Metadata */}
        <ScrollArea as={TableContainer}>
          <NativeTable withColumnBorders>
            <Thead>
              <Tr>
                <Th>{getContentType()}</Th>
                <Th>Metadata</Th>
              </Tr>
            </Thead>

            <Tbody>
              {result.type && (
                <Tr>
                  <Td>Type</Td>
                  <Td>{result.type}</Td>
                </Tr>
              )}
              {result.type === "link" && (
                <Tr>
                  <Td>URL</Td>
                  <Td>
                    <HStack>
                      <Text>{result.value}</Text>
                      <CopyIcon
                        cursor="pointer"
                        onClick={handleCopy}
                        color="muted"
                      />
                    </HStack>
                  </Td>
                </Tr>
              )}

              {result.type === "calculator" && (
                <Tr>
                  <Td>Calculation</Td>
                  <Td>
                    <HStack>
                      <Text>{result.value}</Text>
                      <CopyIcon
                        cursor="pointer"
                        onClick={handleCopy}
                        color="muted"
                      />
                    </HStack>
                  </Td>
                </Tr>
              )}

              {result.type === "app" && (
                <>
                  {result.name && (
                    <Tr>
                      <Td>Name</Td>
                      <Td>{result.name}</Td>
                    </Tr>
                  )}
                  {result.path && (
                    <Tr>
                      <Td>Path</Td>
                      <Td>{result.path}</Td>
                    </Tr>
                  )}
                </>
              )}

              {result.type === "extension" && (
                <>
                  <Tr>
                    <Td>ID</Td>
                    <Td>{result.id}</Td>
                  </Tr>
                  {result.description && (
                    <Tr>
                      <Td>Description</Td>
                      <Td>{result.description}</Td>
                    </Tr>
                  )}
                </>
              )}
            </Tbody>
          </NativeTable>
        </ScrollArea>
      </VStack>
    </VStack>
  );
});

ResultDetails.displayName = "ResultDetails";
