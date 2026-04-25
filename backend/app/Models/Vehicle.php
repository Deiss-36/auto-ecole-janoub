<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'brand', 'model', 'plate_number', 'status', 'last_maintenance',
    ];

    protected $casts = [
        'last_maintenance' => 'date',
    ];

    // ─── Relations ───────────────────────────────────────
    public function appointments()
    {
        return $this->hasMany(Appointment::class);
    }
}
