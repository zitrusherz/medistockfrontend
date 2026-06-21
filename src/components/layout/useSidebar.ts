import { useContext } from "react"
import { SidebarContext } from "./SidebarContext"
import type { SidebarContextValue } from "./SidebarContext"

export function useSidebar(): SidebarContextValue {
  return useContext(SidebarContext)
}
