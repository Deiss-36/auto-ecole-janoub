<?php
namespace App\Http\Requests\Instructor;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInstructorRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $instructor = $this->route('instructor');

        return [
            'name'      => ['sometimes', 'string', 'max:255'],
            'email'     => ['sometimes', 'email', 'unique:users,email,' . $instructor->user_id],
            'specialty' => ['nullable', 'string'],
            'salary'    => ['nullable', 'numeric', 'min:0'],
            'phone'     => ['nullable', 'string'],
            'address'   => ['nullable', 'string'],
            'hire_date' => ['nullable', 'date'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
