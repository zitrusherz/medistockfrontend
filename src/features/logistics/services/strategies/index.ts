// src/features/logistics/services/strategies/index.ts
// Factory: elige el courier por entorno. VITE_USE_MOCKS=true → mock. Espejo del
// selector de pagos. Cambiar Chilexpress ↔ Shippo ↔ mock = una sola línea aquí.

import { chilexpressStrategy } from './ChilexpressStrategy';
import { mockCourierStrategy } from './MockCourierStrategy';
import type { CourierStrategy } from './CourierStrategy';

export const getCourierStrategy = (): CourierStrategy =>
    import.meta.env.VITE_USE_MOCKS === 'true'
        ? mockCourierStrategy
        : chilexpressStrategy;

export type { CourierStrategy } from './CourierStrategy';
