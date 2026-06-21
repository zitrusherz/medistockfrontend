// src/pages/admin/Trabajadores.tsx
// T4.3 — Página Admin · Trabajadores. Contenedor: PageWrapper + PageHeader +
// WorkersView (alta + tabla del equipo). Protegida por RoleRoute (Proxy) en el
// router para el rol Administrador. Ruta: /admin/trabajadores (ya declarada en
// router/index.tsx y navItems.ts). Export default: el router la carga con lazy().

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
