import { Link } from "@tanstack/react-router"
import { ArrowLeftIcon } from "@yamada-ui/lucide"
import { Center, IconButton, Text, VStack } from "@yamada-ui/react"

export const ErrorComponent = () => {
  return (
    <VStack>
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
      <Center>
        <Text>Extension not found</Text>
      </Center>
    </VStack>
  )
}

export const PendingComponent = () => {
  return (
    <VStack>
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
    </VStack>
  )
}
