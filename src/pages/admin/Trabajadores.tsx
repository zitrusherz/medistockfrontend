

import { PageWrapper } from '@/components/layout/PageWrapper';
import { PageHeader } from '@/components/layout/PageHeader';
import { WorkersView } from '@/features/accounts/components/WorkersView';

export default function AdminTrabajadores() {
    return (
        <PageWrapper size="xl">
            <PageHeader
                title="Trabajadores"
                description="Crea cuentas internas y administra el acceso del equipo por rol."
                breadcrumb={[{ label: 'Inicio' }, { label: 'Trabajadores' }]}
            />

            <div className="mt-6">
                <WorkersView />
            </div>
        </PageWrapper>
    );
}
