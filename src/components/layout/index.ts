export { Stack } from "./Stack"
export type { StackProps, StackDirection, StackAlign, StackJustify, StackGap } from "./Stack"

export { Grid, GridItem } from "./Grid"
export type { GridProps, GridItemProps, GridCols, GridGap, GridColSpan } from "./Grid"

export { Section } from "./Section"
export type { SectionProps } from "./Section"

export { PageWrapper } from "./PageWrapper"
export type { PageWrapperProps, PageWrapperSize } from "./PageWrapper"

export { PageHeader } from "./PageHeader"
export type { PageHeaderProps, BreadcrumbItem } from "./PageHeader"

export { Navbar } from "./Navbar"
export type { NavbarProps } from "./Navbar"

export { Sidebar, SidebarSection, SidebarNavItem } from "./Sidebar"
export type { SidebarProps, SidebarNavItemProps, SidebarSectionProps, SidebarContextValue } from "./Sidebar"

export { SidebarContext } from "./SidebarContext"

export { useSidebar } from "./useSidebar"

export { AuthLayout } from "./AuthLayout"
export type { AuthLayoutProps } from "./AuthLayout"

export { DashboardLayout } from "./DashboardLayout"
export type { DashboardLayoutProps } from "./DashboardLayout"

// ─── Layout por rol (T1.6) ─────────────────────────────────────────────────────
export { AppShell } from "./AppShell"
export { RoleSidebar } from "./RoleSidebar"
export { LogoMark } from "./LogoMark"
export { NAV_ITEMS, itemsForRole } from "./navItems"
export type { NavItem, NavIconComponent } from "./navItems"
