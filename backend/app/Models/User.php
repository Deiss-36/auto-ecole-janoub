<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
    ];

    // ─── Role helpers ─────────────────────────────────────
    public function isAdmin(): bool      { return $this->role === 'admin'; }
    public function isSecretary(): bool  { return $this->role === 'secretary'; }
    public function isInstructor(): bool { return $this->role === 'instructor'; }
    public function isCandidate(): bool  { return $this->role === 'candidate'; }

    // ─── Relations ────────────────────────────────────────
    public function instructor()
    {
        return $this->hasOne(Instructor::class);
    }

    public function candidate()
    {
        return $this->hasOne(Candidate::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }
}
