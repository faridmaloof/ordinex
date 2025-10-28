import { usePage } from '@inertiajs/react';
import type { Auth } from '@/types';

/**
 * Hook para verificar permisos del usuario autenticado
 * 
 * @example
 * const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();
 * 
 * if (hasPermission('clientes.create')) {
 *   // Mostrar botón crear
 * }
 */
export function usePermissions() {
    const { auth } = usePage<{ auth: Auth }>().props;

    /**
     * Verificar si el usuario tiene un permiso específico
     */
    const hasPermission = (permission: string): boolean => {
        if (!auth.user) return false;
        if (auth.user.es_super_admin) return true;
        return auth.permissions.includes(permission);
    };

    /**
     * Verificar si el usuario tiene al menos uno de los permisos
     */
    const hasAnyPermission = (...permissions: string[]): boolean => {
        if (!auth.user) return false;
        if (auth.user.es_super_admin) return true;
        return permissions.some(permission => auth.permissions.includes(permission));
    };

    /**
     * Verificar si el usuario tiene todos los permisos
     */
    const hasAllPermissions = (...permissions: string[]): boolean => {
        if (!auth.user) return false;
        if (auth.user.es_super_admin) return true;
        return permissions.every(permission => auth.permissions.includes(permission));
    };

    /**
     * Verificar si es super admin
     */
    const isSuperAdmin = (): boolean => {
        return auth.user?.es_super_admin ?? false;
    };

    /**
     * Obtener todos los permisos del usuario
     */
    const getPermissions = (): string[] => {
        return auth.permissions;
    };

    /**
     * Verificar acceso a módulo completo (al menos view)
     */
    const canAccessModule = (module: string): boolean => {
        return hasAnyPermission(
            `${module}.view`,
            `${module}.viewAny`,
            `${module}.create`,
            `${module}.update`,
            `${module}.delete`
        );
    };

    return {
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        isSuperAdmin,
        getPermissions,
        canAccessModule,
        user: auth.user,
    };
}

/**
 * Componente de protección por permisos
 */
interface CanProps {
    permission?: string;
    anyPermission?: string[];
    allPermissions?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function Can({ 
    permission, 
    anyPermission, 
    allPermissions, 
    children, 
    fallback = null 
}: CanProps) {
    const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (anyPermission && anyPermission.length > 0) {
        hasAccess = hasAnyPermission(...anyPermission);
    } else if (allPermissions && allPermissions.length > 0) {
        hasAccess = hasAllPermissions(...allPermissions);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}
