

import { useState } from 'react';
import { ProductsList } from './ProductsList';
import { ProductForm } from './ProductForm';
import { cn } from '@/utils/cn';

type Tab = 'lista' | 'alta';

type TabButtonProps = {
    value: Tab;
    children: string;
    active: boolean;
    onClick: (value: Tab) => void;
};

function TabButton({ value, children, active, onClick }: TabButtonProps) {
    return (
        <button
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onClick(value)}
            className={cn(
                'rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-muted hover:bg-surface-muted hover:text-text',
            )}
        >
            {children}
        </button>
    );
}

export function ProductsSection() {
    const [tab, setTab] = useState<Tab>('lista');

    return (
        <div className="space-y-6">
            <div
                role="tablist"
                aria-label="Vista de productos"
                className="inline-flex gap-1 rounded-lg border border-border bg-surface p-1"
            >
                <TabButton value="lista" active={tab === 'lista'} onClick={setTab}>
                    Listado
                </TabButton>
                <TabButton value="alta" active={tab === 'alta'} onClick={setTab}>
                    Nuevo producto
                </TabButton>
            </div>

            {tab === 'lista' ? (
                <ProductsList />
            ) : (
                <ProductForm onCreated={() => setTab('lista')} />
            )}
        </div>
    );
}
