

import { chilexpressStrategy } from './ChilexpressStrategy';
import { mockCourierStrategy } from './MockCourierStrategy';
import type { CourierStrategy } from './CourierStrategy';

export const getCourierStrategy = (): CourierStrategy =>
    import.meta.env.VITE_USE_MOCKS === 'true'
        ? mockCourierStrategy
        : chilexpressStrategy;

export type { CourierStrategy } from './CourierStrategy';
