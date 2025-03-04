import { Link as TanStackLink } from "@tanstack/react-router";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  AppWindowIcon,
  BlocksIcon,
  CalculatorIcon,
  LinkIcon,
} from "@yamada-ui/lucide";
import {
  Card,
  CardBody,
  HStack,
  Highlight,
  memo,
  useClipboard,
} from "@yamada-ui/react";
import type { SearchResult } from "../../../utils/search";

export interface ResultCardProps {
  result: SearchResult;
  active?: boolean;
  index: number;
  query: string | null;
}

export const ResultCard = memo(
  ({ result, active, index, query }: ResultCardProps) => {
    const isExtensionResult = result.type === "extension";
    // const isInstalledApp = result.type === "app";
    const isLinkResult = result.type === "link";
    const isCalculatorResult = result.type === "calculator";

    const text = isExtensionResult
      ? //  || isInstalledApp
        result.name
      : result.value;

    const isFilePath =
      !isLinkResult &&
      // !isInstalledApp &&
      !isExtensionResult &&
      (text.includes("/") || text.includes("\\"));

    const { onCopy } = useClipboard();

    const handleResultClick = (result: SearchResult) => {
      if (result.type === "link" || result.type === "calculator") {
        // Copy to clipboard
        onCopy(result.value);
        getCurrentWindow().hide();
      }
      // else if (result.type === "app") {
      //   // Open the app using Rust
      //   console.log(result.path);
      //   invoke("open_app", { appPath: result.path });
      //   getCurrentWindow().hide();
      // }
    };

    return (
      <Card
        variant="subtle"
        position="relative"
        bg="transparent"
        _active={{ bg: "whiteAlpha.100" }}
        _hover={{ bg: "whiteAlpha.200" }}
        data-active={active ? "true" : undefined}
      >
        <TanStackLink
          to={
            isExtensionResult
              ? "/extensions/$id"
              : isLinkResult
                ? text
                : isFilePath
                  ? text
                  : ""
          }
          params={isExtensionResult ? { id: result.id } : {}}
          style={{ position: "absolute", inset: "0" }}
          id={`result-${index}`}
          onClick={(e) => {
            if (!isExtensionResult) {
              e.preventDefault();
              handleResultClick(result);
            }
          }}
        />
        <CardBody>
          <HStack>
            {isExtensionResult ? (
              <BlocksIcon />
            ) : isCalculatorResult ? (
              <CalculatorIcon />
            ) : isLinkResult ? (
              <LinkIcon />
            ) : (
              <AppWindowIcon />
            )}

            <Highlight
              fontSize="lg"
              fontWeight="bold"
              query={query?.split(" ") || []}
              markProps={{ px: 0 }}
              lineClamp={1}
            >
              {text}
            </Highlight>
          </HStack>
        </CardBody>
      </Card>
    );
  }
);

ResultCard.displayName = "ResultCard";
