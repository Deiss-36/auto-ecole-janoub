<?php

use App\Http\Controllers\Api\AppointmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CandidateController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\InstructorController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\InstructorPortalController;
use App\Http\Controllers\Api\CandidatePortalController;
use App\Http\Controllers\Api\ReceiptController;
use App\Http\Controllers\Api\RegistrationController;
use Illuminate\Support\Facades\Route;



/*
|----------------------------------------------------------------------
|  Public Routes — No authentication required
|----------------------------------------------------------------------
*/
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

/*
|----------------------------------------------------------------------
|  Protected Routes — Sanctum token required
|----------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth (any authenticated user) ──────────────────────────
    Route::prefix('auth')->group(function () {
        Route::get('/profile',  [AuthController::class, 'profile']);
        Route::put('/profile',  [AuthController::class, 'updateProfile']);
        Route::post('/logout',  [AuthController::class, 'logout']);
    });

    // ── Dashboard (admin + secretary) ──────────────────────────
    Route::get('/dashboard', [DashboardController::class, 'index'])
        ->middleware('role:admin,secretary');

    // ── Candidates ─────────────────────────────────────────────
    Route::middleware('role:admin,secretary')->group(function () {
        Route::get('/candidates/stats', [CandidateController::class, 'stats']);
        Route::post('/candidates/{candidate}/reminder', [CandidateController::class, 'sendReminder']);
        Route::apiResource('/candidates', CandidateController::class);
    });

    // ── Instructors ────────────────────────────────────────────
    Route::middleware('role:admin,secretary')->group(function () {
        Route::get('/instructors/{instructor}/schedule', [InstructorController::class, 'schedule']);
        Route::apiResource('/instructors', InstructorController::class);
    });

    // ── Vehicles (admin only for write, admin+secretary for read) ─
    Route::get('/vehicles',        [VehicleController::class, 'index'])->middleware('role:admin,secretary');
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show'])->middleware('role:admin,secretary');
    Route::middleware('role:admin')->group(function () {
        Route::post('/vehicles',             [VehicleController::class, 'store']);
        Route::put('/vehicles/{vehicle}',    [VehicleController::class, 'update']);
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy']);
    });

    // ── Appointments ────────────────────────────────────────────
    Route::middleware('role:admin,secretary,instructor')->group(function () {
        Route::get('/appointments/calendar', [AppointmentController::class, 'calendar']);
        Route::apiResource('/appointments', AppointmentController::class);
    });

    // ── Payments ────────────────────────────────────────────────
    Route::middleware('role:admin,secretary')->group(function () {
        Route::get('/payments/summary', [PaymentController::class, 'summary']);
        Route::apiResource('/payments', PaymentController::class);
    });

    // ── Expenses (admin only) ───────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::get('/expenses/summary', [ExpenseController::class, 'summary']);
        Route::apiResource('/expenses', ExpenseController::class);
    });
    // ── Staff Management (admin only) ──────────────────────────
    Route::middleware('role:admin')->group(function () {
        Route::apiResource('/staff', \App\Http\Controllers\Api\StaffController::class);
    });

    // ── Exams ──────────────────────────────────────────────────
    Route::middleware('role:admin,secretary')->group(function () {
        Route::apiResource('/exams', \App\Http\Controllers\Api\ExamController::class);
    });

    // ── Settings ───────────────────────────────────────────────
    Route::middleware('role:admin')->group(function () {
        // use strings to avoid issues if settings controllers doesn't exist yet in some environments
        Route::get('/settings',        [\App\Http\Controllers\Api\SettingsController::class, 'index']);
        Route::post('/settings/update', [\App\Http\Controllers\Api\SettingsController::class, 'update']);
    });

    // ── Receipts (admin + secretary) ────────────────────────────
    Route::middleware('role:admin,secretary')->group(function () {
        Route::get('/payments/{payment}/receipt', [\App\Http\Controllers\Api\ReceiptController::class, 'generate']);
    });

    // ── Registration Status (admin + secretary) ─────────────────
    Route::middleware('role:admin,secretary')->group(function () {
        Route::get('/candidates/{candidate}/registration', [\App\Http\Controllers\Api\RegistrationController::class, 'status']);
    });

    // 🏫 Portail Moniteur (Instructor Portal)
    Route::prefix('instructor')->middleware('role:instructor')->group(function () {
        Route::get('dashboard', [InstructorPortalController::class, 'dashboard']);
        Route::get('planning', [InstructorPortalController::class, 'planning']);
        Route::get('candidates', [InstructorPortalController::class, 'candidates']);
        Route::put('appointment/{appointment}', [InstructorPortalController::class, 'updateAppointment']);
        Route::get('profile', [InstructorPortalController::class, 'profile']);
        Route::post('profile/update', [InstructorPortalController::class, 'updateProfile']);
        Route::post('reports/store', [InstructorPortalController::class, 'storeReport']);
    });

    // 🎓 Portail Candidat (Candidate Portal)
    Route::prefix('candidate')->middleware('role:candidate')->group(function () {
        Route::get('dashboard', [CandidatePortalController::class, 'dashboard']);
        Route::get('sessions', [CandidatePortalController::class, 'sessions']);
        Route::get('sessions/export', [CandidatePortalController::class, 'exportSessions']);
        Route::get('payments', [CandidatePortalController::class, 'payments']);
        Route::get('documents', [CandidatePortalController::class, 'documents']);
        Route::post('documents/upload', [CandidatePortalController::class, 'uploadDocument']);
        Route::get('notifications', [CandidatePortalController::class, 'notifications']);
        Route::put('notifications/{notification}/read', [CandidatePortalController::class, 'markNotificationAsRead']);
    });
});
