<?php
namespace App\Http\Requests\Instructor;

use Illuminate\Foundation\Http\FormRequest;

class StoreInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'      => ['required', 'string', 'max:255'],
            'email'     => ['required', 'email', 'unique:users,email'],
            'password'  => ['required', 'string', 'min:6'],
            'specialty' => ['nullable', 'string'],
            'salary'    => ['nullable', 'numeric', 'min:0'],
            'phone'     => ['nullable', 'string'],
            'address'   => ['nullable', 'string'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
