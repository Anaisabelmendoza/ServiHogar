<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'domicilio')) {
                $table->string('domicilio')->nullable();
            }
            if (!Schema::hasColumn('users', 'codigo_postal')) {
                $table->string('codigo_postal')->nullable();
            }
            if (!Schema::hasColumn('users', 'ciudad')) {
                $table->string('ciudad')->nullable();
            }
            if (!Schema::hasColumn('users', 'provincia')) {
                $table->string('provincia')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $cols = [];
            if (Schema::hasColumn('users', 'domicilio')) $cols[] = 'domicilio';
            if (Schema::hasColumn('users', 'codigo_postal')) $cols[] = 'codigo_postal';
            if (Schema::hasColumn('users', 'ciudad')) $cols[] = 'ciudad';
            if (Schema::hasColumn('users', 'provincia')) $cols[] = 'provincia';
            if (count($cols) > 0) {
                $table->dropColumn($cols);
            }
        });
    }
};
