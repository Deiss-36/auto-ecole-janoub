<?php
namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand'            => ['required', 'string'],
            'model'            => ['required', 'string'],
            'plate_number'     => ['required', 'string', 'unique:vehicles,plate_number'],
            'status'           => ['nullable', 'in:active,maintenance,out_of_service'],
            'last_maintenance' => ['nullable', 'date'],
        ];
    }
}
