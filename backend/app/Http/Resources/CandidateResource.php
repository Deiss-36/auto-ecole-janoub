<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // ⚡ Performance: Fetch the sum directly from payments_sum_amount eager loaded field.
        // Fall back to relation sum or helper method only if not calculated at query level.
        $totalPaid = (float) ($this->payments_sum_amount ?? ($this->relationLoaded('payments') ? $this->payments->sum('amount') : $this->totalPaid()));

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
            'total_paid'        => $totalPaid,
            'remaining_balance' => (float) $this->total_price - $totalPaid,

            // Relationships
            'user'              => new UserResource($this->whenLoaded('user')),
            'payments'          => PaymentResource::collection($this->whenLoaded('payments')),
            'appointments'      => AppointmentResource::collection($this->whenLoaded('appointments')),
            'skills'            => $this->whenLoaded('skills'),
        ];
    }
}
