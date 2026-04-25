<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InstructorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'specialty'    => $this->specialty,
            'salary'       => (float) $this->salary,
            'phone'        => $this->phone,
            'address'      => $this->address,
            'hire_date'    => $this->hire_date?->format('Y-m-d'),
            'is_active'    => (bool) $this->is_active,
            // Relationships
            'user'         => new UserResource($this->whenLoaded('user')),
            'appointments' => AppointmentResource::collection($this->whenLoaded('appointments')),
        ];
    }
}
