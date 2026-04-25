<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'category'    => $this->category,
            'amount'      => (float) $this->amount,
            'date'        => $this->date?->format('Y-m-d'),
            'description' => $this->description,
            'user'        => new UserResource($this->whenLoaded('user')),
        ];
    }
}
