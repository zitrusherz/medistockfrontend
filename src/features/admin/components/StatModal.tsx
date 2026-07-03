

import type { ReactNode } from 'react';
import { Modal } from '@/components/ui';

export interface StatModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
}

export function StatModal({ open, onClose, title, description, children }: StatModalProps) {
    return (
        <Modal open={open} onClose={onClose} size="lg">
            <div className="mb-4">
                <h3 className="font-display text-lg font-bold text-text">{title}</h3>
                {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
            </div>
            <div className="max-h-[60vh] overflow-auto">{children}</div>
        </Modal>
    );
}
