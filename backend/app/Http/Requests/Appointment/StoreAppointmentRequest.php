<?php
namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'instructor_id' => ['required', 'exists:instructors,id'],
            'candidate_ids' => ['nullable', 'array'],
            'candidate_ids.*' => ['exists:candidates,id'],
            'vehicle_id'    => ['nullable', 'exists:vehicles,id'],
            'license_type'  => ['required', 'in:A,B,C,D,EC'],
            'date'          => ['required', 'date'],
            'start_time'    => ['required', 'date_format:H:i'],
            'end_time'      => ['required', 'date_format:H:i', 'after:start_time'],
            'status'        => ['nullable', 'in:scheduled,completed,cancelled,no_show'],
            'notes'         => ['nullable', 'string'],
            'session_price' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
