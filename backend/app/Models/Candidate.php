<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'cin', 'phone', 'address',
        'license_type', 'total_price', 'registration_date',
        'start_date', 'expected_end_date', 'rank', 'status',
        'folder_status', 'photo_path',
    ];


    protected $casts = [
        'registration_date'  => 'date',
        'start_date'         => 'date',
        'expected_end_date'  => 'date',
        'total_price'        => 'decimal:2',
    ];

    // ─── Relations ───────────────────────────────────────
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function appointments()
    {
        return $this->belongsToMany(Appointment::class);
    }

    public function skills()
    {
        return $this->hasMany(CandidateSkill::class);
    }

    public function documents()
    {
        return $this->hasMany(CandidateDocument::class);
    }

    // ─── Helpers ─────────────────────────────────────────
    public function totalPaid(): float
    {
        return (float) $this->payments()->sum('amount');
    }

    public function remainingBalance(): float
    {
        return (float) $this->total_price - $this->totalPaid();
    }
}
