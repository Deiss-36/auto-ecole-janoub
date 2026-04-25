<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Candidate;
use App\Models\Exam;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\CandidateResource;

class CandidatePortalController extends Controller
{
    private function getCandidate(Request $request)
    {
        return Candidate::where('user_id', $request->user()->id)->firstOrFail();
    }

    public function dashboard(Request $request)
    {
        $candidate = $this->getCandidate($request);
        $user = $request->user();

        // Stats
        $sessionsCount = $candidate->appointments()->where('status', 'completed')->count();
        $codeHours = $candidate->appointments()->where('session_type', 'code')->where('status', 'completed')->count(); // Assuming 1 session = 1 hour
        $remainingBalance = $candidate->remainingBalance();
        $nextExam = Exam::where('candidate_id', $candidate->id)->where('date', '>=', now())->orderBy('date')->first();

        // Mapping steps logic (Step 1-6)
        $steps = [
            ['id' => 1, 'title' => 'Inscription et dossier', 'status' => 'completed', 'date' => $candidate->registration_date->format('d/m/Y')],
            ['id' => 2, 'title' => 'Formation code', 'status' => $codeHours >= 20 ? 'completed' : 'active', 'progress' => $codeHours . 'h/20h'],
            ['id' => 3, 'title' => 'Examen code', 'status' => Exam::where('candidate_id', $candidate->id)->where('type', 'code')->where('result', 'passed')->exists() ? 'completed' : 'pending'],
            ['id' => 4, 'title' => 'Formation conduite', 'status' => $sessionsCount >= 30 ? 'completed' : 'pending', 'progress' => $sessionsCount . 'h/30h'],
            ['id' => 5, 'title' => 'Examen conduite', 'status' => Exam::where('candidate_id', $candidate->id)->where('type', 'driving')->exists() ? 'active' : 'pending'],
            ['id' => 6, 'title' => 'Obtention du permis', 'status' => Exam::where('candidate_id', $candidate->id)->where('type', 'driving')->where('result', 'passed')->exists() ? 'completed' : 'pending'],
        ];

        return response()->json([
            'user' => $user,
            'candidate' => new CandidateResource($candidate->load('user')),
            'stats' => [
                'sessions_done' => $sessionsCount,
                'code_hours' => $codeHours,
                'remaining_balance' => $remainingBalance,
                'next_exam_date' => $nextExam ? $nextExam->date->format('d M') : 'Non planifié',
            ],
            'steps' => $steps,
            'next_sessions' => AppointmentResource::collection(
                $candidate->appointments()->with(['instructor.user', 'vehicle'])->where('date', '>=', now()->toDateString())->orderBy('date')->take(3)->get()
            ),
            'progress' => [
                'driving' => round(($sessionsCount / 30) * 100),
                'code' => round(($codeHours / 20) * 100),
                'global' => round((count(array_filter($steps, fn($s) => $s['status'] === 'completed')) / 6) * 100),
            ]
        ]);
    }

    public function sessions(Request $request)
    {
        $candidate    = $this->getCandidate($request);
        $appointments = $candidate->appointments()
            ->with(['instructor.user', 'vehicle'])
            ->orderBy('date', 'desc')
            ->paginate($request->per_page ?? 15);

        return AppointmentResource::collection($appointments);
    }

    public function payments(Request $request)
    {
        $candidate = $this->getCandidate($request);
        return response()->json([
            'history' => $candidate->payments()->orderBy('payment_date', 'desc')->get(),
            'summary' => [
                'total' => $candidate->total_price,
                'paid' => $candidate->totalPaid(),
                'remaining' => $candidate->remainingBalance(),
            ]
        ]);
    }

    public function documents(Request $request)
    {
        $candidate = $this->getCandidate($request);
        $docs = DB::table('candidate_documents')->where('candidate_id', $candidate->id)->get();

        return response()->json($docs);
    }

    public function notifications(Request $request)
    {
        return response()->json(
            DB::table('notifications')->where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function exportSessions(Request $request)
    {
        $candidate = $this->getCandidate($request);
        $appointments = $candidate->appointments()
            ->with(['instructor.user', 'vehicle'])
            ->orderBy('date', 'asc')
            ->get();

        $filename = "planning_" . str_replace(' ', '_', strtolower($request->user()->name)) . ".csv";
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Date', 'Heure', 'Duree', 'Type', 'Moniteur', 'Vehicule', 'Statut'];

        $callback = function() use($appointments, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($appointments as $appt) {
                $duration = '';
                if ($appt->start_time && $appt->end_time) {
                    $start = \Carbon\Carbon::parse($appt->start_time);
                    $end = \Carbon\Carbon::parse($appt->end_time);
                    $diff = $start->diffInMinutes($end);
                    $h = floor($diff / 60);
                    $m = $diff % 60;
                    $duration = $h > 0 ? ($m > 0 ? "{$h}h{$m}" : "{$h}h") : "{$m} min";
                }

                $statusMap = [
                    'scheduled' => 'Prévu',
                    'completed' => 'Terminé',
                    'cancelled' => 'Annulé'
                ];

                fputcsv($file, [
                    $appt->date->format('d/m/Y'),
                    $appt->start_time . ' - ' . $appt->end_time,
                    $duration,
                    $appt->session_type === 'driving' ? 'Conduite' : 'Code',
                    $appt->instructor->user->name ?? '—',
                    $appt->vehicle ? ($appt->vehicle->brand . ' ' . $appt->vehicle->model) : '—',
                    $statusMap[$appt->status] ?? $appt->status
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
