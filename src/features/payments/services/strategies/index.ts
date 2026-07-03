

import { webpayStrategy } from './WebpayStrategy';
import { mockPaymentStrategy } from './MockPaymentStrategy';
import type { PaymentStrategy } from './PaymentStrategy';

export const getPaymentStrategy = (): PaymentStrategy =>
    import.meta.env.VITE_USE_MOCKS === 'true'
        ? mockPaymentStrategy
        : webpayStrategy;

export type { PaymentStrategy } from './PaymentStrategy';