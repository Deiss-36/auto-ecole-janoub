<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $staff = \App\Models\User::whereIn('role', ['admin', 'secretary'])
            ->when($request->search, function ($q, $search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            })
            ->latest()
            ->paginate($request->per_page ?? 15);

        return \App\Http\Resources\UserResource::collection($staff);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:admin,secretary',
        ]);

        $user = \App\Models\User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role'     => $validated['role'],
        ]);

        return response()->json([
            'message' => 'Membre du personnel ajouté avec succès.',
            'user'    => new \App\Http\Resources\UserResource($user),
        ], 201);
    }

    public function update(Request $request, \App\Models\User $staff)
    {
        // Prevent editing instructors/candidates through this controller
        if (!in_array($staff->role, ['admin', 'secretary'])) {
            return response()->json(['message' => 'Action non autorisée.'], 403);
        }

        $validated = $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $staff->id,
            'password' => 'sometimes|string|min:8',
            'role'     => 'sometimes|in:admin,secretary',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = \Illuminate\Support\Facades\Hash::make($validated['password']);
        }

        $staff->update($validated);

        return response()->json([
            'message' => 'Informations mises à jour.',
            'user'    => new \App\Http\Resources\UserResource($staff),
        ]);
    }

    public function destroy(\App\Models\User $staff)
    {
        // Don't allow deleting the last admin or yourself? (Simpler for now)
        if ($staff->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 403);
        }

        $staff->delete();
        return response()->json(['message' => 'Compte supprimé.']);
    }

}
