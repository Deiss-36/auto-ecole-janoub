<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'category', 'amount', 'date', 'description',
    ];

    protected $casts = [
        'date'   => 'date',
        'amount' => 'decimal:2',
    ];

    // ─── Relations ───────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
