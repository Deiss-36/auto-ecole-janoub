<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\Candidate\StoreCandidateRequest;
use App\Http\Requests\Candidate\UpdateCandidateRequest;
use App\Http\Resources\CandidateResource;

class CandidateController extends Controller
{
    public function index(Request $request)
    {
        $candidates = Candidate::with('user')
            ->when($request->status,       fn($q) => $q->where('status', $request->status))
            ->when($request->license_type, fn($q) => $q->where('license_type', $request->license_type))
            ->when($request->search,       fn($q) => $q->whereHas('user', fn($u) =>
                $u->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
            )->orWhere('cin', 'like', "%{$request->search}%"))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return CandidateResource::collection($candidates);
    }

    public function store(StoreCandidateRequest $request)
    {
        DB::beginTransaction();
        try {
            $validated = $request->validated();

            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role'     => 'candidate',
            ]);

            $photoPath = null;
            if ($request->hasFile('photo')) {
                $photoPath = $request->file('photo')->store('candidates/photos', 'public');
            }

            $candidate = Candidate::create([
                'user_id'           => $user->id,
                'cin'               => $validated['cin'],
                'phone'             => $validated['phone'] ?? null,
                'address'           => $validated['address'] ?? null,
                'license_type'      => $validated['license_type'],
                'total_price'       => $validated['total_price'],
                'registration_date' => $validated['registration_date'] ?? now()->toDateString(),
                'start_date'        => $validated['start_date'] ?? null,
                'expected_end_date' => $validated['expected_end_date'] ?? null,
                'status'            => $validated['status'] ?? 'active',
                'photo_path'        => $photoPath,
            ]);

            DB::commit();

            return response()->json([
                'message'   => 'تم إنشاء المرشح بنجاح.',
                'candidate' => new CandidateResource($candidate->load('user')),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur: ' . $e->getMessage()], 500);
        }
    }

    public function show(Candidate $candidate)
    {
        $candidate->load(['user', 'payments', 'appointments.instructor.user', 'skills', 'documents']);
        return new CandidateResource($candidate);
    }

    public function update(UpdateCandidateRequest $request, Candidate $candidate)
    {
        $validated = $request->validated();

        if (isset($validated['name']) || isset($validated['email'])) {
            $candidate->user->update(array_filter([
                'name'  => $validated['name']  ?? null,
                'email' => $validated['email'] ?? null,
            ]));
        }

        if ($request->hasFile('photo')) {
            if ($candidate->photo_path) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($candidate->photo_path);
            }
            $validated['photo_path'] = $request->file('photo')->store('candidates/photos', 'public');
        }
        unset($validated['photo']);

        $candidate->update(array_diff_key($validated, array_flip(['name', 'email'])));

        return response()->json([
            'message'   => 'تم تحديث المرشح.',
            'candidate' => new CandidateResource($candidate->load('user')),
        ]);
    }

    public function destroy(Candidate $candidate)
    {
        $candidate->user->delete();
        return response()->json(['message' => 'تم حذف المرشح.']);
    }

    public function stats()
    {
        return response()->json([
            'total'      => Candidate::count(),
            'active'     => Candidate::where('status', 'active')->count(),
            'completed'  => Candidate::where('status', 'completed')->count(),
            'suspended'  => Candidate::where('status', 'suspended')->count(),
            'by_license' => Candidate::select('license_type', DB::raw('count(*) as total'))
                            ->groupBy('license_type')->get(),
        ]);
    }

    public function sendReminder(Request $request, Candidate $candidate)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        try {
            \Illuminate\Support\Facades\Mail::to($candidate->user->email)
                ->send(new \App\Mail\CandidateReminderMail($candidate, $request->message));
                
            return response()->json(['message' => 'تم إرسال التذكير بنجاح.']);
        } catch (\Exception $e) {
            \Log::error('Erreur envoi rappel: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de l\'envoi de l\'email.'], 500);
        }
    }
}
