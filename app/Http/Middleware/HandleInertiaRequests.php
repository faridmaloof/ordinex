<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        $user = $request->user();
        
        // Obtener permisos del usuario
        $permissions = [];
        if ($user) {
            if ($user->esSuperAdmin()) {
                // Super admin tiene todos los permisos
                $permissions = \App\Models\Config\Permiso::pluck('codigo')->toArray();
            } elseif ($user->rol) {
                // Permisos del rol
                $permissions = $user->rol->permisos->pluck('codigo')->toArray();
            }
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'es_super_admin' => $user->esSuperAdmin(),
                    'rol' => $user->rol ? [
                        'id' => $user->rol->id,
                        'nombre' => $user->rol->nombre,
                        'nivel' => $user->rol->nivel,
                    ] : null,
                ] : null,
                'permissions' => $permissions,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'ziggy' => fn () => [
                ...(new \Tightenco\Ziggy\Ziggy)->toArray(),
                'location' => $request->url(),
            ],
        ];
    }
}
