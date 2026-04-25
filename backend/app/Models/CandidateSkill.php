<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CandidateSkill extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id', 'skill_name', 'progress',
    ];

    // ─── Relations ───────────────────────────────────────
    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
