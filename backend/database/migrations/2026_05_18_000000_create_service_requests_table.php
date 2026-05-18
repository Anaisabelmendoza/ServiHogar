<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cliente_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('trabajador_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('description');
            $table->string('appointment_type'); // 'urgente' o 'programar'
            $table->string('appointment_date')->nullable();
            $table->string('address')->nullable();
            $table->string('status')->default('pendiente'); // 'pendiente', 'en_progreso', 'finalizado', 'cancelado'
            $table->integer('rating')->nullable();
            $table->text('comment')->nullable();
            $table->string('phone')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_requests');
    }
};
