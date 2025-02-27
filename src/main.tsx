import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"

import { UIProvider, getColorModeScript } from "@yamada-ui/react"
// Import the generated route tree
import { routeTree } from "./routeTree.gen"

// Create a new router instance
const router = createRouter({ routeTree })

// Create a client
const queryClient = new QueryClient()

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

const injectColorModeScript = () => {
  const scriptContent = getColorModeScript({
    initialColorMode: "dark",
  })

  const script = document.createElement("script")

  script.textContent = scriptContent

  document.head.appendChild(script)
}

injectColorModeScript()

// Render the app
const rootElement = document.getElementById("root")
if (!rootElement) throw new Error("Root element not found")
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <UIProvider>
          <RouterProvider router={router} />
        </UIProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}
