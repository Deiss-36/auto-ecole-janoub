<?php
namespace App\Http\Requests\Expense;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpenseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'category'    => ['required', 'string'],
            'amount'      => ['required', 'numeric', 'min:0'],
            'date'        => ['required', 'date'],
            'description' => ['nullable', 'string'],
        ];
    }
}
