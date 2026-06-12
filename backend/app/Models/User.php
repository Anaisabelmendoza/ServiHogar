<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'role', 'apellidos', 'telefono', 'profesion', 'avatarUrl', 'is_active', 'domicilio', 'codigo_postal', 'ciudad', 'provincia', 'latitude', 'longitude', 'fcm_token', 'urgency_price'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $appends = ['average_rating'];

    public function getAverageRatingAttribute()
    {
        if ($this->role === 'worker') {
            $avg = \App\Models\ServiceRequest::where('trabajador_id', $this->id)
                ->where('status', 'finalizado')
                ->whereNotNull('rating')
                ->avg('rating');
        } else {
            $avg = \App\Models\ServiceRequest::where('cliente_id', $this->id)
                ->where('status', 'finalizado')
                ->whereNotNull('worker_rating')
                ->avg('worker_rating');
        }

        return $avg !== null ? round((float)$avg, 1) : 5.0;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
