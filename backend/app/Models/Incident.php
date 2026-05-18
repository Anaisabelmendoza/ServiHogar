<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Attributes\Fillable;

#[Fillable([
    'service_request_id',
    'reporter_id',
    'motivo',
    'detalle'
])]
class Incident extends Model
{
    public function serviceRequest()
    {
        return $this->belongsTo(ServiceRequest::class);
    }

    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }
}
