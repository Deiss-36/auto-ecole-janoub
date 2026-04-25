<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'license_type'  => $this->license_type,
            'session_type'  => $this->session_type,
            'date'          => $this->date?->format('Y-m-d'),

            'start_time'    => $this->start_time,
            'end_time'      => $this->end_time,
            'status'        => $this->status,
            'notes'         => $this->notes,
            'session_price' => (float) $this->session_price,
            'driving_level' => $this->driving_level,

            
            // Relationships
            'instructor'    => new InstructorResource($this->whenLoaded('instructor')),
            'candidates'    => CandidateResource::collection($this->whenLoaded('candidates')),
            'vehicle'       => new VehicleResource($this->whenLoaded('vehicle')),
        ];
    }
}
