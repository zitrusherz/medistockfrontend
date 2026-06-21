import { createContext } from "react"

export type ToastVariant = "info" | "success" | "warning" | "error" | "default" | "destructive"
export type ToastPosition =
    | "top-right"
    | "top-left"
    | "top-center"
    | "bottom-right"
    | "bottom-left"
    | "bottom-center"

export interface ToastInput {
    variant?: ToastVariant
    title?: string
    message?: string
    description?: string
    duration?: number
}

export interface ToastItem {
    id: string
    variant: ToastVariant
    title?: string
    message?: string
    description?: string
    duration?: number
}

export interface ToastContextValue {
    toast: (item: ToastInput) => string
    dismiss: (id: string) => void
    dismissAll: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)