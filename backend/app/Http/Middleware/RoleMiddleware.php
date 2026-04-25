<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * Usage in routes:
     *   ->middleware('role:admin')
     *   ->middleware('role:admin,secretary')
     *
     * @param  string  ...$roles  Accepted roles (comma-separated via Laravel route binding)
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        // Must be authenticated first
        if (!$user) {
            return response()->json([
                'message' => 'Non authentifié. Veuillez vous connecter.',
            ], 401);
        }

        // Check if user's role is in the allowed list
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Accès refusé. Vous n\'avez pas les droits requis.',
                'required_roles' => $roles,
                'your_role'      => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
