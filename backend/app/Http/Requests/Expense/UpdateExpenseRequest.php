<?php
namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category'    => ['sometimes', 'string'],
            'amount'      => ['sometimes', 'numeric', 'min:0'],
            'date'        => ['sometimes', 'date'],
            'description' => ['nullable', 'string'],
        ];
    }
}
