<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'amount'         => (float) $this->amount,
            'payment_date'   => $this->payment_date?->format('Y-m-d'),
            'payment_method' => $this->payment_method,
            'notes'          => $this->notes,
            'candidate'      => new CandidateResource($this->whenLoaded('candidate')),
        ];
    }
}
