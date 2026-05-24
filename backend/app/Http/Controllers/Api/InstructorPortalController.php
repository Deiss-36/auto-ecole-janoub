<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Candidate;
use App\Models\Instructor;
use App\Models\Exam;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\CandidateResource;
use Carbon\Carbon;

class InstructorPortalController extends Controller
{
    private function getInstructor(Request $request)
    {
        return Instructor::where('user_id', $request->user()->id)->firstOrFail();
    }

    public function dashboard(Request $request)
    {
        $instructor = $this->getInstructor($request);
        $today = now()->format('Y-m-d');
        
        // 1. Students stats
        $assignedCandidateIds = Candidate::whereHas('appointments', function($q) use ($instructor) {
            $q->where('instructor_id', $instructor->id);
        })->pluck('candidates.id');
        
        $totalStudents = $assignedCandidateIds->count();
        $newStudentsThisMonth = Candidate::whereIn('id', $assignedCandidateIds)
            ->whereMonth('created_at', now()->month)
            ->count();

        // 2. Hours stats (assuming 1 appointment = 1 hour for now, can be sophisticated later)
        $hoursThisMonth = $instructor->appointments()->whereMonth('date', now()->month)->where('status', 'completed')->count();
        $lastMonth = now()->subMonth();
        $hoursLastMonth = $instructor->appointments()->whereMonth('date', $lastMonth->month)->whereYear('date', $lastMonth->year)->where('status', 'completed')->count();
        $hoursDelta = $hoursThisMonth - $hoursLastMonth;

        // 3. Success Rate (current month vs last month)
        $studentsWithExams = Exam::whereIn('candidate_id', $assignedCandidateIds)->distinct()->pluck('candidate_id');
        $passedStudents    = Exam::whereIn('candidate_id', $assignedCandidateIds)->where('result', 'passed')->distinct()->count();
        $totalExamined     = $studentsWithExams->count();
        $successRate       = $totalExamined > 0 ? round(($passedStudents / $totalExamined) * 100) : 0;

        // Delta: compare pass rate this month vs last month
        $lastMonthPassed  = Exam::whereIn('candidate_id', $assignedCandidateIds)
            ->where('result', 'passed')
            ->whereMonth('date', $lastMonth->month)
            ->whereYear('date', $lastMonth->year)
            ->count();
        $lastMonthTotal   = Exam::whereIn('candidate_id', $assignedCandidateIds)
            ->whereMonth('date', $lastMonth->month)
            ->whereYear('date', $lastMonth->year)
            ->count();
        $lastMonthRate    = $lastMonthTotal > 0 ? round(($lastMonthPassed / $lastMonthTotal) * 100) : 0;
        $successDelta     = $successRate - $lastMonthRate;

        // 4. Recent activity from real appointments
        $recentAppointments = $instructor->appointments()
            ->with('candidates.user')
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->take(4)
            ->get();

        $recentActivity = $recentAppointments->map(function ($appt) {
            $candidateName = $appt->candidates->first()->user->name ?? '—';
            if ($appt->candidates->count() > 1) {
                $candidateName .= ' (+' . ($appt->candidates->count() - 1) . ')';
            }
            $statusMap = [
                'completed' => ['type' => 'validated', 'title' => 'Séance terminée',  'color' => 'success'],
                'cancelled' => ['type' => 'cancelled', 'title' => 'Séance annulée',   'color' => 'danger'],
                'scheduled' => ['type' => 'scheduled', 'title' => 'Séance programmée', 'color' => 'info'],
            ];
            $entry = $statusMap[$appt->status] ?? ['type' => 'info', 'title' => 'Séance', 'color' => 'secondary'];
            $date  = Carbon::parse($appt->date)->isToday()
                ? "Aujourd'hui à " . substr($appt->start_time, 0, 5)
                : Carbon::parse($appt->date)->locale('fr')->diffForHumans();
            return [
                'type'  => $entry['type'],
                'title' => $entry['title'],
                'desc'  => $candidateName,
                'time'  => $date,
                'color' => $entry['color'],
            ];
        })->values();

        return response()->json([
            'stats' => [
                'total_students'   => $totalStudents,
                'students_delta'   => $newStudentsThisMonth,
                'today_sessions'   => $instructor->appointments()->where('date', $today)->count(),
                'hours_this_month' => $hoursThisMonth,
                'hours_delta'      => $hoursDelta,
                'success_rate'     => $successRate,
                'success_delta'    => $successDelta,
            ],
            'today_planning' => AppointmentResource::collection(
                $instructor->appointments()
                    ->with(['candidates.user', 'vehicle'])
                    ->where('date', $today)
                    ->orderBy('start_time')
                    ->get()
            ),
            'recent_activity' => $recentActivity,
        ]);
    }

    public function planning(Request $request)
    {
        $instructor = $this->getInstructor($request);
        $appointments = $instructor->appointments()
            ->with(['candidates.user', 'vehicle'])
            ->orderBy('date', 'desc')
            ->orderBy('start_time', 'desc')
            ->get(); // Get all for grouping in frontend

        return AppointmentResource::collection($appointments);
    }

    public function candidates(Request $request)
    {
        $instructor = $this->getInstructor($request);
        $assignedCandidateIds = Candidate::whereHas('appointments', function($q) use ($instructor) {
            $q->where('instructor_id', $instructor->id);
        })->pluck('candidates.id');
        
        $candidates = Candidate::with(['user', 'skills'])
            ->whereIn('id', $assignedCandidateIds)
            ->paginate(15);

        return CandidateResource::collection($candidates);
    }

    public function updateAppointment(Request $request, Appointment $appointment)
    {
        $instructor = $this->getInstructor($request);

        if ($appointment->instructor_id !== $instructor->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'status' => 'required|in:scheduled,completed,cancelled',
            'notes' => 'nullable|string',
            'driving_level' => 'nullable|string',
        ]);

        $appointment->update([
            'status' => $request->status,
            'notes' => $request->notes,
            'driving_level' => $request->driving_level,
        ]);

        return response()->json([
            'message' => 'Rapport de séance enregistré avec succès.',
            'appointment' => new AppointmentResource($appointment->load('candidates.user'))
        ]);
    }

    public function profile(Request $request)
    {
        $user       = $request->user();
        $instructor = $this->getInstructor($request);

        // Calculate real success rate from exams of assigned candidates
        $assignedCandidateIds = Candidate::whereHas('appointments', function($q) use ($instructor) {
            $q->where('instructor_id', $instructor->id);
        })->pluck('candidates.id');

        $totalExamined  = Exam::whereIn('candidate_id', $assignedCandidateIds)->distinct()->count('candidate_id');
        $passedStudents = Exam::whereIn('candidate_id', $assignedCandidateIds)->where('result', 'passed')->distinct()->count('candidate_id');
        $successRate    = $totalExamined > 0 ? round(($passedStudents / $totalExamined) * 100) : 0;

        return response()->json([
            'user'    => $user,
            'details' => $instructor,
            'stats'   => [
                'total_sessions'   => $instructor->appointments()->where('status', 'completed')->count(),
                'students_trained' => Candidate::whereHas('appointments', function($q) use ($instructor) {
                    $q->where('instructor_id', $instructor->id)->where('status', 'completed');
                })->count(),
                'success_rate'     => $successRate,
            ]
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $instructor = $this->getInstructor($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->update(['name' => $request->name]);
        if ($request->password) {
            $user->update(['password' => Hash::make($request->password)]);
        }

        $instructor->update(['phone' => $request->phone]);

        return response()->json(['message' => 'Profil mis à jour avec succès !']);
    }

    public function storeReport(Request $request)
    {
        $instructor = $this->getInstructor($request);

        $request->validate([
            'candidate_id'  => 'required|exists:candidates,id',
            'session_type'  => 'required|in:code,driving',
            'date'          => 'required|date',
            'driving_level' => 'nullable|string',
            'notes'         => 'nullable|string',
        ]);

        $candidate = Candidate::findOrFail($request->candidate_id);

        $appointment = Appointment::create([
            'instructor_id' => $instructor->id,
            'license_type'  => $candidate->license_type,
            'session_type'  => $request->session_type,
            'date'          => $request->date,
            'start_time'    => now()->format('H:i:s'),
            'end_time'      => now()->addHour()->format('H:i:s'),
            'status'        => 'completed',
            'notes'         => $request->notes,
            'driving_level' => $request->driving_level,
        ]);

        $appointment->candidates()->sync([$request->candidate_id]);

        return response()->json([
            'message' => 'Rapport enregistré avec succès.',
            'appointment' => new AppointmentResource($appointment->load('candidates.user'))
        ]);
    }
}
