<?php
namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'candidate_id'   => ['required', 'exists:candidates,id'],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'payment_date'   => ['required', 'date'],
            'payment_method' => ['nullable', 'string'],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
