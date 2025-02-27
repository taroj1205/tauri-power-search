import { Outlet, createRootRoute } from "@tanstack/react-router"
import { Container } from "@yamada-ui/react"

export const Route = createRootRoute({
  component: () => (
    <Container
      maxH="100svh"
      overflow="hidden"
      p="0"
      rounded="calc($spaces.sm + $spaces.md)"
    >
      <Outlet />
    </Container>
  ),
})
