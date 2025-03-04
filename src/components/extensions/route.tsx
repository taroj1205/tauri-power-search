import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "@yamada-ui/lucide"
import { Center, IconButton, VStack } from "@yamada-ui/react"
import { Route } from "../../routes/extensions.$id"

export const ExtensionRouteComponent = () => {
  const Extension = Route.useLoaderData()

  return (
    <Center as={VStack} h="100svh" maxH="100svh" p="sm">
      <IconButton
        as={Link}
        colorScheme="primary"
        variant="outline"
        to="/"
        position="absolute"
        top="md"
        left="md"
        zIndex="1"
      >
        <ArrowLeftIcon />
      </IconButton>
      <Extension.component />
    </Center>
  )
}
