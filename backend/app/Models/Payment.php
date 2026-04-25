<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id', 'amount', 'payment_date', 'payment_method', 'notes',
    ];

    protected $casts = [
        'payment_date' => 'date',
        'amount'       => 'decimal:2',
    ];

    // ─── Relations ───────────────────────────────────────
    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
