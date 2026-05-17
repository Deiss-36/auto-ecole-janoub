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

        // 🔒 Complete Interval Intersection Algorithm: (new.start < existing.end AND new.end > existing.start)
        $conflict = Appointment::where('instructor_id', $validated['instructor_id'])
            ->where('date', $validated['date'])
            ->where('status', 'scheduled')
            ->where(function($q) use ($validated) {
                $q->where('start_time', '<', $validated['end_time'])
                  ->where('end_time', '>', $validated['start_time']);
            })->exists();

        if ($conflict) {
            return response()->json([
                'message' => __('messages.appointment_conflict'),
            ], 422);
        }

        $appointment = Appointment::create(array_diff_key($validated, array_flip(['candidate_ids'])));

        if (isset($validated['candidate_ids'])) {
            $appointment->candidates()->sync($validated['candidate_ids']);
        }

        return response()->json([
            'message'     => __('messages.appointment_created'),
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

        $instructorId = $validated['instructor_id'] ?? $appointment->instructor_id;
        $date         = $validated['date']          ?? $appointment->date;
        $startTime    = $validated['start_time']    ?? $appointment->start_time;
        $endTime      = $validated['end_time']      ?? $appointment->end_time;

        // 🔒 Complete Interval Intersection Algorithm for Update
        $conflict = Appointment::where('instructor_id', $instructorId)
            ->where('id', '!=', $appointment->id)
            ->where('date', $date)
            ->where('status', 'scheduled')
            ->where(function($q) use ($startTime, $endTime) {
                $q->where('start_time', '<', $endTime)
                  ->where('end_time', '>', $startTime);
            })->exists();

        if ($conflict) {
            return response()->json([
                'message' => __('messages.appointment_conflict'),
            ], 422);
        }

        $appointment->update(array_diff_key($validated, array_flip(['candidate_ids'])));

        if (isset($validated['candidate_ids'])) {
            $appointment->candidates()->sync($validated['candidate_ids']);
        }

        return response()->json([
            'message'     => __('messages.appointment_updated'),
            'appointment' => new AppointmentResource($appointment->load(['instructor.user', 'candidates.user', 'vehicle'])),
        ]);
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->delete();
        return response()->json(['message' => __('messages.appointment_deleted')]);
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
