<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use Illuminate\Http\Request;

/**
 * RegistrationController
 * 
 * Handles candidate registration status and folder tracking.
 * Future feature: Manage registration steps, document uploads, status changes.
 */
class RegistrationController extends Controller
{
    /**
     * Get registration status summary for a candidate.
     * Route: GET /api/candidates/{candidate}/registration
     */
    public function status(Candidate $candidate)
    {
        $candidate->load(['user', 'payments', 'appointments']);

        return response()->json([
            'candidate'     => $candidate->user->name ?? '—',
            'license_type'  => $candidate->license_type,
            'status'        => $candidate->status,
            'folder_status' => $candidate->folder_status ?? 'incomplete',
            'registration_date' => $candidate->registration_date?->format('d/m/Y'),
            'total_price'   => $candidate->total_price,
            'total_paid'    => $candidate->totalPaid(),
            'remaining'     => $candidate->remainingBalance(),
        ]);
    }
}
