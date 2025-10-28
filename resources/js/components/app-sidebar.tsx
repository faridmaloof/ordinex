import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Users, 
    Package, 
    FileText, 
    DollarSign, 
    CreditCard, 
    Settings,
    Shield,
    Tag,
    UserCog,
    Briefcase,
    Receipt,
    History
} from 'lucide-react';
import AppLogo from './app-logo';
import { usePermissions } from '@/hooks/usePermissions';
import { useMemo } from 'react';

// Definición completa de items del menú con permisos
const allNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    // Catálogos
    {
        title: 'Clientes',
        href: '/catalogos/clientes',
        icon: Users,
        permission: 'clientes.viewAny',
    },
    {
        title: 'Categorías',
        href: '/catalogos/categorias-items',
        icon: Tag,
        permission: 'categorias_items.viewAny',
    },
    {
        title: 'Items',
        href: '/catalogos/items',
        icon: Package,
        permission: 'items.viewAny',
    },
    {
        title: 'Formas de Pago',
        href: '/catalogos/formas-pago',
        icon: CreditCard,
        permission: 'formas_pago.viewAny',
    },
    // Documentos
    {
        title: 'Solicitudes',
        href: '/documentos/solicitudes',
        icon: FileText,
        permission: 'solicitudes.viewAny',
    },
    {
        title: 'Órdenes',
        href: '/documentos/ordenes',
        icon: Briefcase,
        permission: 'ordenes_servicio.viewAny',
    },
    // Transacciones
    {
        title: 'Caja',
        href: '/transacciones/caja',
        icon: DollarSign,
        permission: 'cajas.viewAny',
    },
    {
        title: 'Pagos',
        href: '/transacciones/pagos',
        icon: Receipt,
        permission: 'pagos.viewAny',
    },
    // Configuración
    {
        title: 'Usuarios',
        href: '/config/usuarios',
        icon: UserCog,
        permission: 'usuarios.viewAny',
    },
    {
        title: 'Roles',
        href: '/config/roles',
        icon: Shield,
        permission: 'roles.viewAny',
    },
    {
        title: 'Auditoría',
        href: '/config/auditoria',
        icon: History,
        permission: 'auditoria.viewAny',
    },
    {
        title: 'Configuración',
        href: '/config/empresa',
        icon: Settings,
        permission: 'configuracion.update',
    },
];

export function AppSidebar() {
    const { hasPermission, isSuperAdmin } = usePermissions();

    // Filtrar items del menú según permisos
    const visibleNavItems = useMemo(() => {
        if (isSuperAdmin()) {
            return allNavItems;
        }

        return allNavItems.filter(item => {
            // Si no requiere permiso, mostrar
            if (!item.permission) {
                return true;
            }
            // Verificar permiso
            return hasPermission(item.permission);
        });
    }, [hasPermission, isSuperAdmin]);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
