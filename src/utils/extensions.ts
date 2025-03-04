import { extensionMetadata } from "../extensions"

export interface ExtensionMetadata {
  id: string
  name: string
  description: string
  component: React.MemoExoticComponent<() => JSX.Element>
}

export function getExtensions(): ExtensionMetadata[] {
  try {
    return Object.values(extensionMetadata)
  } catch (error) {
    console.error("Error loading extensions:", error)
    return []
  }
}

export function getExtension(id: string): ExtensionMetadata {
  const metadata = extensionMetadata[id]
  if (metadata === undefined) {
    throw new Error(`Extension with id ${id} not found`)
  }
  return metadata
}
