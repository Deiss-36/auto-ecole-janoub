<?php
namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount'         => ['sometimes', 'numeric', 'min:0.01'],
            'payment_date'   => ['sometimes', 'date'],
            'payment_method' => ['nullable', 'string'],
            'notes'          => ['nullable', 'string'],
        ];
    }
}
