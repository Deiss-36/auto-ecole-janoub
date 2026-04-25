<?php
namespace App\Http\Requests\Candidate;

use Illuminate\Foundation\Http\FormRequest;

class StoreCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:255'],
            'email'             => ['required', 'email', 'unique:users,email'],
            'password'          => ['required', 'string', 'min:6'],
            'cin'               => ['required', 'string', 'unique:candidates,cin'],
            'phone'             => ['nullable', 'string'],
            'address'           => ['nullable', 'string'],
            'license_type'      => ['required', 'in:A,B,C,D,EC'],
            'total_price'       => ['required', 'numeric', 'min:0'],
            'registration_date' => ['nullable', 'date'],
            'start_date'        => ['nullable', 'date'],
            'expected_end_date' => ['nullable', 'date'],
            'status'            => ['nullable', 'in:active,completed,suspended,cancelled'],
            'photo'             => ['nullable', 'image', 'max:2048'],
        ];
    }
}
