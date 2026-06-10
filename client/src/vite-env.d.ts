/// <reference types="vite/client" />

declare module '*.jsx' {
  import type { ComponentType } from 'react'
  const component: ComponentType
  export default component
}

declare module '*.json' {
  const value: unknown
  export default value
}
