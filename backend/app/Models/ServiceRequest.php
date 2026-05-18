<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'cliente_id',
    'trabajador_id',
    'description',
    'appointment_type',
    'appointment_date',
    'address',
    'status',
    'rating',
    'comment',
    'phone'
])]
class ServiceRequest extends Model
{
    public function cliente()
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function trabajador()
    {
        return $this->belongsTo(User::class, 'trabajador_id');
    }
}
