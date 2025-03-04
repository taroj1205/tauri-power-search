import { createFileRoute } from "@tanstack/react-router"
import { ErrorComponent, PendingComponent } from "../components/extensions"
import { ExtensionRouteComponent } from "../components/extensions/route"
import type { PdfResult } from "../extensions/pdf-tools/types"
import { getExtension } from "../utils/extensions"

interface RouteSearchData {
  results: PdfResult[]
}

export const Route = createFileRoute("/extensions/$id")({
  loader: ({ params: { id } }) => getExtension(id),
  component: ExtensionRouteComponent,
  errorComponent: ErrorComponent,
  pendingComponent: PendingComponent,
  validateSearch: (search: Record<string, unknown>): RouteSearchData => ({
    results: Array.isArray(search.results)
      ? (search.results as PdfResult[])
      : [],
  }),
})
