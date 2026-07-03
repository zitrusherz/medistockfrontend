// src/router/withSuspense.tsx
import { Suspense, type ReactElement } from "react"
import { Spinner, ProgressBar } from "@/components/ui"




export const Fallback = () => (
    <>
        <div className="fixed inset-x-0 top-0 z-[60]" role="presentation">
            <ProgressBar indeterminate size="xs" variant="primary" />
        </div>
        <div className="flex min-h-[50vh] items-center justify-center">
            <Spinner size="lg" />
        </div>
    </>
)

/** Envuelve un elemento (página lazy) en Suspense con el fallback compartido. */
export const S = (el: ReactElement) => (
    <Suspense fallback={<Fallback />}>{el}</Suspense>
)
