import { createFileRoute } from "@tanstack/react-router"
import { getExtension } from "../utils/extensions"
import { ErrorComponent, PendingComponent } from "../components/extensions"
import type { PdfResult } from "../extensions/pdf-tools/types"
import { ExtensionRouteComponent } from "../components/extensions/route"

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
