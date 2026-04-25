<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Candidate;
use Illuminate\Http\Request;

/**
 * ReceiptController
 * 
 * Handles generation of payment receipts for candidates.
 * Future feature: Generate PDF receipts via a library like DomPDF.
 */
class ReceiptController extends Controller
{
    /**
     * Generate a receipt for a given payment.
     * Route: GET /api/payments/{payment}/receipt
     */
    public function generate(Payment $payment)
    {
        $payment->load('candidate.user');

        return response()->json([
            'receipt' => [
                'payment_id'    => $payment->id,
                'candidate'     => $payment->candidate->user->name ?? '—',
                'amount'        => $payment->amount,
                'payment_date'  => $payment->payment_date,
                'payment_method'=> $payment->payment_method,
                'notes'         => $payment->notes,
            ],
            'message' => 'Reçu généré avec succès.',
        ]);
    }
}
