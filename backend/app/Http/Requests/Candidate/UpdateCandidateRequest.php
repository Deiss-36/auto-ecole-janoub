<?php
namespace App\Http\Requests\Candidate;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCandidateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $candidate = $this->route('candidate');
        
        return [
            'name'              => ['sometimes', 'string', 'max:255'],
            'email'             => ['sometimes', 'email', 'unique:users,email,' . $candidate->user_id],
            'cin'               => ['sometimes', 'string', 'unique:candidates,cin,' . $candidate->id],
            'phone'             => ['nullable', 'string'],
            'address'           => ['nullable', 'string'],
            'license_type'      => ['sometimes', 'in:A,B,C,D,EC'],
            'total_price'       => ['sometimes', 'numeric', 'min:0'],
            'registration_date' => ['nullable', 'date'],
            'start_date'        => ['nullable', 'date'],
            'expected_end_date' => ['nullable', 'date'],
            'rank'              => ['nullable', 'string'],
            'status'            => ['sometimes', 'in:active,completed,suspended,cancelled'],
            'photo'             => ['nullable', 'image', 'max:2048'],
        ];
    }
}
