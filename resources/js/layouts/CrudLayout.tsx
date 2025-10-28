import { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface CrudLayoutProps {
    title: string;
    description?: string;
    createRoute?: string;
    createLabel?: string;
    createPermission?: string; // Permiso requerido para ver botón crear
    showCreateButton?: boolean;
    headerActions?: ReactNode;
    children: ReactNode;
}

export default function CrudLayout({
    title,
    description,
    createRoute,
    createLabel = 'Crear Nuevo',
    createPermission,
    showCreateButton = true,
    headerActions,
    children,
}: CrudLayoutProps) {
    const { hasPermission } = usePermissions();

    // Verificar si tiene permiso para crear
    const canCreate = !createPermission || hasPermission(createPermission);

    return (
        <AppLayout>
            <Head title={title} />

            <div className="space-y-6">
                {/* Header personalizado con título y acciones */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-2xl text-gray-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {headerActions}
                        {showCreateButton && createRoute && canCreate && (
                            <Link href={createRoute}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {createLabel}
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Contenido principal */}
                <Card>
                    <CardContent className="pt-6">
                        {children}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
