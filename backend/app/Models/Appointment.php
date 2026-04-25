<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'instructor_id', 'vehicle_id',
        'license_type', 'session_type', 'date', 'start_time', 'end_time',
        'status', 'notes', 'session_price', 'driving_level',
    ];



    protected $casts = [
        'date'          => 'date',
        'session_price' => 'decimal:2',
    ];

    // ─── Relations ───────────────────────────────────────
    public function instructor()
    {
        return $this->belongsTo(Instructor::class);
    }

    public function candidates()
    {
        return $this->belongsToMany(Candidate::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
