import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type FC,
  For,
  HStack,
  InfiniteScrollArea,
  ScrollArea,
  type StackProps,
  assignRef,
  memo,
} from "@yamada-ui/react";
import type { MutableRefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_DISPLAY_COUNT } from "../../../constants";
import { type SearchResult, search } from "../../../utils/search";
import { ResultCard } from "./result-card";
import { ResultDetails } from "./result-details";

interface ResultProps {
  onChangeQueryRef: MutableRefObject<(query: string | null) => void>;
  onChangeActiveIndexRef: MutableRefObject<(index: number) => void>;
  defaultResults?: SearchResult[];
  onChangeTotalResults: (count: number) => void;
}

export const Results: FC<StackProps & ResultProps> = memo(
  ({
    onChangeQueryRef,
    onChangeActiveIndexRef,
    defaultResults,
    onChangeTotalResults,
    ...rest
  }) => {
    const queryClient = useQueryClient();
    const rootRef = useRef<HTMLDivElement>(null);
    const resetRef = useRef<() => void>(() => {});
    const [displayCount, setDisplayCount] = useState<number>(
      DEFAULT_DISPLAY_COUNT
    );
    const [activeIndex, setActiveIndex] = useState<number>(0);

    const { data: query } = useQuery({
      queryKey: ["currentQuery"],
      initialData: "",
    });

    const {
      data: searchResults = [],
      isPending,
      isLoading,
    } = useQuery({
      queryKey: ["search", query],
      queryFn: () => search(query),
      staleTime: 0,
    });

    useEffect(() => {
      if (rootRef.current) {
        const activeElement = document.querySelector(`#result-${activeIndex}`);
        if (activeElement) {
          activeElement.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }
      }
    }, [activeIndex]);

    assignRef(onChangeQueryRef, (query: string | null) => {
      queryClient.setQueryData(["currentQuery"], query);
      setDisplayCount(DEFAULT_DISPLAY_COUNT);
      resetRef.current();
    });

    assignRef(onChangeActiveIndexRef, setActiveIndex);

    const allResults =
      searchResults.length > 0 ? searchResults : (defaultResults ?? []);

    const filteredResults = allResults.slice(0, displayCount);

    useEffect(() => {
      if (filteredResults.length) {
        onChangeTotalResults(filteredResults.length);
      }
    }, [filteredResults, onChangeTotalResults]);

    return (
      <HStack {...rest}>
        <InfiniteScrollArea
          ref={rootRef}
          as={ScrollArea}
          onReset={() => {
            setDisplayCount(DEFAULT_DISPLAY_COUNT);
            setActiveIndex(0);
          }}
          resetRef={resetRef}
          gap="0"
          onLoad={() => setDisplayCount((prev) => prev + DEFAULT_DISPLAY_COUNT)}
          loading={isPending || isLoading || filteredResults.length === 0}
          maxH="full"
          overflowX="clip"
          h="full"
        >
          <For<SearchResult> each={filteredResults}>
            {(result, index) => (
              <ResultCard
                key={`result-${index}`}
                result={result}
                active={index === activeIndex}
                index={index}
                query={query}
              />
            )}
          </For>
        </InfiniteScrollArea>
        {filteredResults.length > 0 && (
          <ResultDetails result={filteredResults[activeIndex]} query={query} />
        )}
      </HStack>
    );
  }
);

Results.displayName = "Results";
