<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Candidate;
use App\Models\Expense;
use App\Models\Instructor;
use App\Models\Payment;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $month = $request->month ?? now()->month;
        $year  = $request->year  ?? now()->year;

        // ── Candidates ─────────────────────────────────
        $candidates = [
            'total'     => Candidate::count(),
            'active'    => Candidate::where('status', 'active')->count(),
            'completed' => Candidate::where('status', 'completed')->count(),
            'new_this_month' => Candidate::whereMonth('registration_date', $month)
                                         ->whereYear('registration_date', $year)->count(),
        ];

        // ── Revenue ────────────────────────────────────
        $revenue = [
            'total_month' => Payment::whereMonth('payment_date', $month)
                                    ->whereYear('payment_date', $year)->sum('amount'),
            'total_year'  => Payment::whereYear('payment_date', $year)->sum('amount'),
            'outstanding' => DB::table('candidates')
                              ->join('payments', 'candidates.id', '=', 'payments.candidate_id', 'left')
                              ->select(DB::raw('SUM(candidates.total_price) - IFNULL(SUM(payments.amount),0) as remaining'))
                              ->value('remaining') ?? 0,
        ];

        // ── Appointments ───────────────────────────────
        $appointments = [
            'today'     => Appointment::whereDate('date', today())->count(),
            'this_week' => Appointment::whereBetween('date', [now()->startOfWeek(), now()->endOfWeek()])->count(),
            'scheduled' => Appointment::where('status', 'scheduled')->count(),
            'completed_month' => Appointment::where('status', 'completed')
                                            ->whereMonth('date', $month)
                                            ->whereYear('date', $year)->count(),
        ];

        // ── Expenses ───────────────────────────────────
        $expenses = [
            'total_month' => Expense::whereMonth('date', $month)->whereYear('date', $year)->sum('amount'),
            'total_year'  => Expense::whereYear('date', $year)->sum('amount'),
        ];

        // ── Staff ──────────────────────────────────────
        $staff = [
            'instructors' => Instructor::count(),
            'active_instructors' => Instructor::where('is_active', true)->count(),
            'vehicles'    => Vehicle::count(),
            'vehicles_active' => Vehicle::where('status', 'active')->count(),
        ];

        // ── Recent Payments ────────────────────────────
        $recent_payments = Payment::with('candidate.user')
            ->latest('payment_date')->take(5)->get();

        // ── Upcoming Appointments ──────────────────────
        $upcoming = Appointment::with(['instructor.user', 'candidates.user', 'vehicle'])
            ->where('date', '>=', today())
            ->where('status', 'scheduled')
            ->orderBy('date')->orderBy('start_time')
            ->take(5)->get();

        return response()->json([
            'candidates'         => $candidates,
            'revenue'            => $revenue,
            'appointments'       => $appointments,
            'expenses'           => $expenses,
            'staff'              => $staff,
            'recent_payments'    => $recent_payments,
            'upcoming_appointments' => $upcoming,
        ]);
    }
}
