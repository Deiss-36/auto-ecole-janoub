<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'brand'            => $this->brand,
            'model'            => $this->model,
            'plate_number'     => $this->plate_number,
            'status'           => $this->status,
            'last_maintenance' => $this->last_maintenance?->format('Y-m-d'),
            'appointments'     => AppointmentResource::collection($this->whenLoaded('appointments')),
        ];
    }
}
