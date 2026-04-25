<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Illuminate\Http\Request;
use App\Http\Requests\Appointment\StoreAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Http\Resources\AppointmentResource;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $appointments = Appointment::with(['instructor.user', 'candidates.user', 'vehicle'])
            ->when($request->date,          fn($q) => $q->where('date', $request->date))
            ->when($request->instructor_id, fn($q) => $q->where('instructor_id', $request->instructor_id))
            ->when($request->candidate_id,  fn($q) => $q->whereHas('candidates', fn($q) => $q->where('candidate_id', $request->candidate_id)))
            ->when($request->status,        fn($q) => $q->where('status', $request->status))
            ->when($request->license_type,  fn($q) => $q->where('license_type', $request->license_type))
            ->when($request->from,          fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to,            fn($q) => $q->whereDate('date', '<=', $request->to))
            ->when($request->search, function ($q) use ($request) {
                $q->where(function ($sub) use ($request) {
                    $sub->whereHas('candidates.user', fn($c) => $c->where('name', 'like', "%{$request->search}%"))
                        ->orWhereHas('instructor.user', fn($i) => $i->where('name', 'like', "%{$request->search}%"))
                        ->orWhereHas('vehicle', fn($v) => $v->where('plate_number', 'like', "%{$request->search}%"));
                });
            })
            ->orderBy('date')->orderBy('start_time')
            ->paginate($request->per_page ?? 100);

        return AppointmentResource::collection($appointments);
    }

    public function store(StoreAppointmentRequest $request)
    {
        $validated = $request->validated();

        $conflict = Appointment::where('instructor_id', $validated['instructor_id'])
            ->where('date', $validated['date'])
            ->where('status', 'scheduled')
            ->where(fn($q) =>
                $q->whereBetween('start_time', [$validated['start_time'], $validated['end_time']])
                  ->orWhereBetween('end_time',   [$validated['start_time'], $validated['end_time']])
            )->exists();

        if ($conflict) {
            return response()->json([
                'message' => 'Conflit d\'horaire détecté pour cet instructeur.',
            ], 422);
        }

        $appointment = Appointment::create(array_diff_key($validated, array_flip(['candidate_ids'])));

        if (isset($validated['candidate_ids'])) {
            $appointment->candidates()->sync($validated['candidate_ids']);
        }

        return response()->json([
            'message'     => 'Rendez-vous créé avec succès.',
            'appointment' => new AppointmentResource($appointment->load(['instructor.user', 'candidates.user', 'vehicle'])),
        ], 201);
    }

    public function show(Appointment $appointment)
    {
        return new AppointmentResource($appointment->load(['instructor.user', 'candidates.user', 'vehicle']));
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment)
    {
        $validated = $request->validated();
        $appointment->update(array_diff_key($validated, array_flip(['candidate_ids'])));

        if (isset($validated['candidate_ids'])) {
            $appointment->candidates()->sync($validated['candidate_ids']);
        }

        return response()->json([
            'message'     => 'Rendez-vous mis à jour.',
            'appointment' => new AppointmentResource($appointment->load(['instructor.user', 'candidates.user', 'vehicle'])),
        ]);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(['message' => 'Rendez-vous supprimé.']);
    }

    public function calendar(Request $request)
    {
        $request->validate([
            'from' => 'required|date',
            'to'   => 'required|date|after_or_equal:from',
        ]);

        $appointments = Appointment::with(['instructor.user', 'candidates.user', 'vehicle'])
            ->whereBetween('date', [$request->from, $request->to])
            ->orderBy('date')->orderBy('start_time')
            ->get();

        return AppointmentResource::collection($appointments);
    }
}
