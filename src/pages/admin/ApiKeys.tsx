

import { useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { CrearApiClientForm } from '@/features/integrations/components/CrearApiClientForm';
import { ApiClientsTable } from '@/features/integrations/components/ApiClientsTable';
import { RevealKeyModal } from '@/features/integrations/components/RevealKeyModal';
import type {
    CrearApiClientResponse,
    ActualizarApiClientResponse,
} from '@/features/integrations/types';

/** Datos mínimos para el modal de revelado, vengan de crear o de rotar. */
interface KeyRevelada {
    apiKey: string;
    institucion: string;
    nombre?: string;
    advertencia?: string;
}

export default function AdminApiKeys() {
    const [revelada, setRevelada] = useState<KeyRevelada | null>(null);

    const handleCreated = (res: CrearApiClientResponse) =>
        setRevelada({
            apiKey: res.api_key,
            institucion: res.institucion,
            nombre: res.nombre_cliente_api,
            advertencia: res.advertencia,
        });

    const handleRotated = (res: ActualizarApiClientResponse) => {
        if (!res.nueva_api_key) return; // rotar siempre devuelve key; guard defensivo
        setRevelada({
            apiKey: res.nueva_api_key,
            institucion: res.institucion,
            advertencia: res.advertencia,
        });
    };

    return (
        <PageWrapper size="xl">
            <PageHeader
                title="API Keys ERP"
                description="Emite y administra las credenciales que permiten a los ERP de las clínicas consumir la API (integración B2B)."
                breadcrumb={[{ label: 'Inicio' }, { label: 'API Keys ERP' }]}
            />

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
                <CrearApiClientForm onCreated={handleCreated} />
                <ApiClientsTable onRotated={handleRotated} />
            </div>

            <RevealKeyModal
                open={revelada !== null}
                onClose={() => setRevelada(null)}
                apiKey={revelada?.apiKey ?? null}
                institucion={revelada?.institucion ?? ''}
                nombre={revelada?.nombre}
                advertencia={revelada?.advertencia}
            />
        </PageWrapper>
    );
}
