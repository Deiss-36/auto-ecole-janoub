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
                'message' => __('messages.unauthenticated'),
            ], 401);
        }

        // Check if user's role is in the allowed list
        if (!in_array($user->role, $roles)) {
            // 🔒 Production mode: return clean generic message without details
            if (config('app.env') === 'production' || !config('app.debug')) {
                return response()->json([
                    'message' => __('messages.access_denied'),
                ], 403);
            }

            // Debug mode: include detailed routing role debug keys
            return response()->json([
                'message'        => __('messages.access_denied_with_roles'),
                'required_roles' => $roles,
                'your_role'      => $user->role,
            ], 403);
        }

        return $next($request);
    }
}
