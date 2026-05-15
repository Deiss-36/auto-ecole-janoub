<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Instructor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Instructor\StoreInstructorRequest;
use App\Http\Requests\Instructor\UpdateInstructorRequest;
use App\Http\Resources\InstructorResource;
use App\Http\Resources\AppointmentResource;

class InstructorController extends Controller
{
    public function index(Request $request)
    {
        $instructors = Instructor::with('user')
            ->when($request->search, fn($q) => $q->whereHas('user', fn($u) =>
                $u->where('name', 'like', "%{$request->search}%")
            ))
            ->when(isset($request->is_active), fn($q) => $q->where('is_active', $request->is_active))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return InstructorResource::collection($instructors);
    }

    public function store(StoreInstructorRequest $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validated();

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'instructor',
            ]);

            $instructor = Instructor::create([
                'user_id'   => $user->id,
                'specialty' => $validated['specialty'] ?? null,
                'salary'    => $validated['salary'] ?? 0,
                'phone'     => $validated['phone'] ?? null,
                'address'   => $validated['address'] ?? null,
                'hire_date' => $validated['hire_date'] ?? null,
                'is_active' => $validated['is_active'] ?? true,
            ]);

            DB::commit();

            return response()->json([
                'message'    => 'تم إنشاء المدرب بنجاح.',
                'instructor' => new InstructorResource($instructor->load('user')),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function show(Instructor $instructor)
    {
        $instructor->load(['user', 'appointments.candidate.user', 'appointments.vehicle']);
        return new InstructorResource($instructor);
    }

    public function update(UpdateInstructorRequest $request, Instructor $instructor)
    {
        $validated = $request->validated();

        if (isset($validated['name']) || isset($validated['email'])) {
            $instructor->user->update(array_filter([
                'name'  => $validated['name']  ?? null,
                'email' => $validated['email'] ?? null,
            ]));
        }

        $instructor->update(array_diff_key($validated, array_flip(['name', 'email'])));

        return response()->json([
            'message'    => 'تم تحديث المدرب.',
            'instructor' => new InstructorResource($instructor->load('user')),
        ]);
    }

    public function destroy(Instructor $instructor)
    {
        $instructor->user->delete();
        return response()->json(['message' => 'تم حذف المدرب.']);
    }

    public function schedule(Request $request, Instructor $instructor)
    {
        $appointments = $instructor->appointments()
            ->with(['candidate.user', 'vehicle'])
            ->when($request->date, fn($q) => $q->where('date', $request->date))
            ->orderBy('date')->orderBy('start_time')
            ->get();

        return AppointmentResource::collection($appointments);
    }
}
