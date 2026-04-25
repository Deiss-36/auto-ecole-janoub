<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $fillable = [
        'candidate_id', 'type', 'date', 'result', 'attempt_number', 'notes'
    ];

    protected $casts = [
        'date' => 'date',
        'attempt_number' => 'integer',
    ];

    public function candidate()
    {
        return $this->belongsTo(Candidate::class);
    }
}
