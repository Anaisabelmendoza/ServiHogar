<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->integer('worker_rating')->nullable();
            $table->text('worker_report')->nullable();
            $table->decimal('invoice_price', 10, 2)->nullable();
            $table->text('invoice_materials')->nullable();
            $table->decimal('invoice_hours', 5, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('service_requests', function (Blueprint $table) {
            $table->dropColumn(['worker_rating', 'worker_report', 'invoice_price', 'invoice_materials', 'invoice_hours']);
        });
    }
};
