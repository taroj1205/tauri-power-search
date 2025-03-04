import { createFileRoute } from "@tanstack/react-router";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import { VStack } from "@yamada-ui/react";
import { useCallback, useRef } from "react";
import { Results, SearchInput } from "../components/search";
import { getExtensions } from "../utils/extensions";
import { getInstalledApps } from "../utils/apps";
import type { SearchResult } from "../utils/search";
import { invoke } from "@tauri-apps/api/core";

const queryClient = new QueryClient();

export const Route = createFileRoute("/")({
  loader: () => getExtensions(),
  component: Index,
});

function Index() {
  const extensions = Route.useLoaderData();
  const extensionResults = extensions.map((extension) => ({
    ...extension,
    type: "extension" as const,
    id: extension.id,
  }));

  // const { data: installedApps = [] } = useQuery({
  //   queryKey: ["installedApps"],
  //   queryFn: getInstalledApps,
  //   staleTime: 0,
  //   refetchOnMount: true,
  // });

  const combinedResults = [
    ...extensionResults,
    // ...installedApps.map((app) => ({
    //   ...app,
    //   type: "app" as const,
    // })),
  ] as SearchResult[];

  const onChangeQueryRef = useRef<(query: string | null) => void>(() => void 0);
  const onChangeActiveIndexRef = useRef<(index: number) => void>(() => void 0);
  const onChangeTotalResultsRef = useRef<(count: number) => void>(() => void 0);

  const onChangeQuery = useCallback(
    (query: string | null) => onChangeQueryRef.current(query),
    []
  );

  const onChangeActiveIndex = useCallback(
    (index: number) => onChangeActiveIndexRef.current(index),
    []
  );

  const onChangeTotalResults = useCallback(
    (count: number) => onChangeTotalResultsRef.current(count),
    []
  );

  // invoke('refresh_apps')

  return (
    <QueryClientProvider client={queryClient}>
      <VStack h="100vh" p="md">
        <SearchInput
          onChangeQuery={onChangeQuery}
          onChangeActiveIndex={onChangeActiveIndex}
          onChangeTotalResultsRef={onChangeTotalResultsRef}
          defaultLength={combinedResults.length}
        />
        <Results
          onChangeQueryRef={onChangeQueryRef}
          onChangeActiveIndexRef={onChangeActiveIndexRef}
          onChangeTotalResults={onChangeTotalResults}
          flexGrow={1}
          overflow="auto"
          defaultResults={combinedResults}
        />
      </VStack>
    </QueryClientProvider>
  );
}
