import {
    Building2,
    Users,
    UserCog,
    Key,
    Banknote,
    type LucideIcon,
    FileText,
    Package,
    ClipboardList,
    ShoppingCart,
    Wrench,
    DollarSign,
    CreditCard,
    LayoutDashboard,
    FolderTree,
} from 'lucide-react';

export interface MenuItem {
    id: string;
    label: string;
    icon?: LucideIcon;
    href?: string;
    permission?: string;
    children?: MenuItem[];
}

export const menuItems: MenuItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/dashboard',
    },
    {
        id: 'config',
        label: 'Configuración',
        icon: UserCog,
        permission: 'config.ver',
        children: [
            {
                id: 'config.empresa',
                label: 'Empresa',
                icon: Building2,
                href: '/config/empresa',
                permission: 'config.empresa.ver',
            },
            {
                id: 'config.roles',
                label: 'Roles',
                icon: Key,
                href: '/config/roles',
                permission: 'config.roles.ver',
            },
            {
                id: 'config.permisos',
                label: 'Permisos',
                icon: Key,
                href: '/config/permisos',
                permission: 'config.permisos.ver',
            },
            {
                id: 'config.usuarios',
                label: 'Usuarios',
                icon: Users,
                href: '/config/usuarios',
                permission: 'config.usuarios.ver',
            },
            {
                id: 'config.cajas',
                label: 'Cajas',
                icon: Banknote,
                href: '/config/cajas',
                permission: 'config.cajas.ver',
            },
        ],
    },
    {
        id: 'catalogo',
        label: 'Catálogos',
        icon: FolderTree,
        permission: 'catalogo.ver',
        children: [
            {
                id: 'catalogo.clientes',
                label: 'Clientes',
                icon: Users,
                href: '/catalogo/clientes',
                permission: 'catalogo.clientes.ver',
            },
            {
                id: 'catalogo.categorias',
                label: 'Categorías',
                icon: FolderTree,
                href: '/catalogo/categorias',
                permission: 'catalogo.categorias.ver',
            },
            {
                id: 'catalogo.items',
                label: 'Items',
                icon: Package,
                href: '/catalogo/items',
                permission: 'catalogo.items.ver',
            },
        ],
    },
    {
        id: 'documentos',
        label: 'Documentos',
        icon: FileText,
        permission: 'documentos.ver',
        children: [
            {
                id: 'documentos.solicitudes',
                label: 'Solicitudes',
                icon: ClipboardList,
                href: '/documentos/solicitudes',
                permission: 'solicitud.ver',
            },
            {
                id: 'documentos.ordenes',
                label: 'Órdenes de Servicio',
                icon: Wrench,
                href: '/documentos/ordenes',
                permission: 'orden.ver',
            },
        ],
    },
    {
        id: 'transacciones',
        label: 'Transacciones',
        icon: DollarSign,
        permission: 'transacciones.ver',
        children: [
            {
                id: 'transacciones.caja',
                label: 'Caja',
                icon: Banknote,
                href: '/transacciones/caja/actual',
                permission: 'caja.acceder',
            },
            {
                id: 'transacciones.pagos',
                label: 'Pagos',
                icon: CreditCard,
                href: '/transacciones/pagos',
                permission: 'pagos.ver',
            },
        ],
    },
];

/**
 * Filtrar items del menú según permisos del usuario
 */
export function filterMenuByPermissions(
    items: MenuItem[],
    userPermissions: string[]
): MenuItem[] {
    return items
        .filter((item) => {
            // Si no requiere permiso, siempre se muestra
            if (!item.permission) return true;
            
            // Verificar si el usuario tiene el permiso
            return userPermissions.includes(item.permission);
        })
        .map((item) => {
            // Si tiene hijos, filtrarlos recursivamente
            if (item.children) {
                return {
                    ...item,
                    children: filterMenuByPermissions(item.children, userPermissions),
                };
            }
            return item;
        })
        // Remover items padre que no tienen hijos después del filtro
        .filter((item) => {
            if (item.children) {
                return item.children.length > 0;
            }
            return true;
        });
}
