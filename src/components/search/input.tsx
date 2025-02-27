import { SearchIcon } from "@yamada-ui/lucide";
import {
  assignRef,
  type FC,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  type InputProps,
} from "@yamada-ui/react";
import { memo, type RefObject, useCallback, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";

interface SearchInputProps extends Omit<InputProps, "onChange"> {
  onChangeQuery: (query: string | null) => void;
  onChangeActiveIndex: (index: number) => void;
  onChangeTotalResultsRef: RefObject<(count: number) => void>;
  defaultLength: number;
}

export const SearchInput: FC<SearchInputProps> = memo(
  ({
    onChangeQuery,
    onChangeActiveIndex,
    onChangeTotalResultsRef,
    defaultLength,
    ...props
  }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const activeIndexRef = useRef<number>(0);
    const [totalResults, setTotalResults] = useState(defaultLength);
    const queryClient = useQueryClient();
    
    const { data: query } = useQuery({
      queryKey: ["currentQuery"],
      initialData: "",
    });

    const [inputValue, setInputValue] = useState(query || "");

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        queryClient.setQueryData(["currentQuery"], value);
        queryClient.invalidateQueries({ queryKey: ["search", value] });
        onChangeQuery(value || null);
      },
      [onChangeQuery, queryClient]
    );

    const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
      setTimeout(() => {
        e.target.focus();
      }, 10);
    }, []);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (inputRef.current) {
          if (e.key === "Escape") {
            if (inputValue.length === 0) getCurrentWindow().hide();
            else {
              setInputValue("");
              onChangeQuery("");
              inputRef.current.focus();
            }
          } else if (e.key === "ArrowUp") {
            activeIndexRef.current = Math.max(activeIndexRef.current - 1, 0);
            onChangeActiveIndex(activeIndexRef.current);
          } else if (e.key === "ArrowDown") {
            activeIndexRef.current = Math.min(
              activeIndexRef.current + 1,
              totalResults - 1
            );
            onChangeActiveIndex(activeIndexRef.current);
          } else if (e.key === "Enter") {
            const activeResultElement = document.querySelector(
              `#result-${activeIndexRef.current}`
            ) as HTMLLinkElement;
            activeResultElement?.click();
          }
        }
      },
      [onChangeQuery, onChangeActiveIndex, totalResults, inputValue]
    );

    assignRef(onChangeTotalResultsRef, setTotalResults);

    listen("tauri://focus", () => {
      if (inputRef.current) inputRef.current.select();
    });

    return (
      <HStack>
        <InputGroup>
          <InputLeftElement>
            <SearchIcon />
          </InputLeftElement>
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search or type an equation..."
            autoFocus
            {...props}
          />
        </InputGroup>
      </HStack>
    );
  }
);

SearchInput.displayName = "SearchInput";
