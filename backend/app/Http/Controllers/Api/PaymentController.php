<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Payment\StorePaymentRequest;
use App\Http\Requests\Payment\UpdatePaymentRequest;
use App\Http\Resources\PaymentResource;

class PaymentController extends Controller
{
    public function index(Request $request)
    {
        $payments = Payment::with('candidate.user')
            ->when($request->search, fn($q) => $q->whereHas('candidate.user', fn($q) =>
                $q->where('name', 'like', '%' . $request->search . '%')
            ))
            ->when($request->candidate_id, fn($q) => $q->where('candidate_id', $request->candidate_id))
            ->when($request->from,         fn($q) => $q->whereDate('payment_date', '>=', $request->from))
            ->when($request->to,           fn($q) => $q->whereDate('payment_date', '<=', $request->to))
            ->latest('payment_date')
            ->paginate($request->per_page ?? 20);

        return PaymentResource::collection($payments);
    }

    public function store(StorePaymentRequest $request)
    {
        $payment = Payment::create($request->validated());

        return response()->json([
            'message' => 'تم تسجيل الأداء بنجاح.',
            'payment' => new PaymentResource($payment->load('candidate.user')),
            'balance' => $this->getBalance($payment->candidate_id),
        ], 201);
    }

    public function show(Payment $payment)
    {
        return new PaymentResource($payment->load('candidate.user'));
    }

    public function update(UpdatePaymentRequest $request, Payment $payment)
    {
        $payment->update($request->validated());

        return response()->json([
            'message' => 'تم تحديث الأداء.',
            'payment' => new PaymentResource($payment->load('candidate.user')),
            'balance' => $this->getBalance($payment->candidate_id),
        ]);
    }

    public function destroy(Payment $payment)
    {
        $candidateId = $payment->candidate_id;
        $payment->delete();
        return response()->json([
            'message' => 'تم حذف الأداء.',
            'balance' => $this->getBalance($candidateId),
        ]);
    }

    public function summary(Request $request)
    {
        return response()->json([
            'total_collected' => Payment::when($request->from, fn($q) => $q->whereDate('payment_date', '>=', $request->from))
                                        ->when($request->to,   fn($q) => $q->whereDate('payment_date', '<=', $request->to))
                                        ->sum('amount'),
            'by_method'       => Payment::select('payment_method', DB::raw('SUM(amount) as total'))
                                        ->groupBy('payment_method')->get(),
            'by_month'        => Payment::select(
                                        DB::raw('YEAR(payment_date) as year'),
                                        DB::raw('MONTH(payment_date) as month'),
                                        DB::raw('SUM(amount) as total')
                                    )->groupBy('year', 'month')->orderBy('year')->orderBy('month')->get(),
        ]);
    }

    private function getBalance(int $candidateId): array
    {
        $candidate  = Candidate::find($candidateId);
        $totalPaid  = $candidate->totalPaid();
        return [
            'total_price'     => $candidate->total_price,
            'total_paid'      => $totalPaid,
            'remaining'       => $candidate->total_price - $totalPaid,
        ];
    }
}
