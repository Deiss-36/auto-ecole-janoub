<?php
namespace App\Http\Requests\Vehicle;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $vehicle = $this->route('vehicle');
        return [
            'brand'            => ['sometimes', 'string'],
            'model'            => ['sometimes', 'string'],
            'plate_number'     => ['sometimes', 'string', 'unique:vehicles,plate_number,' . $vehicle->id],
            'status'           => ['nullable', 'in:active,maintenance,out_of_service'],
            'last_maintenance' => ['nullable', 'date'],
        ];
    }
}
