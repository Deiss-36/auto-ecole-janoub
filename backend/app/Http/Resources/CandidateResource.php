<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'cin'               => $this->cin,
            'phone'             => $this->phone,
            'address'           => $this->address,
            'license_type'      => $this->license_type,
            'total_price'       => (float) $this->total_price,
            'registration_date' => $this->registration_date?->format('Y-m-d'),
            'start_date'        => $this->start_date?->format('Y-m-d'),
            'expected_end_date' => $this->expected_end_date?->format('Y-m-d'),
            'rank'              => $this->rank,
            'status'            => $this->status,
            'folder_status'     => $this->folder_status,
            'photo_path'        => $this->photo_path ? asset('storage/' . $this->photo_path) : null,
            // Computed details

            'total_paid'        => (float) $this->totalPaid(),
            'remaining_balance' => (float) $this->remainingBalance(),

            // Relationships
            'user'              => new UserResource($this->whenLoaded('user')),
            'payments'          => PaymentResource::collection($this->whenLoaded('payments')),
            'appointments'      => AppointmentResource::collection($this->whenLoaded('appointments')),
            'skills'            => $this->whenLoaded('skills'), // Alternatively Map to SkillResource
        ];
    }
}
