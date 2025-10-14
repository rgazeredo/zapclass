<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Adicionar a coluna enabled como boolean
        Schema::table('webhooks', function (Blueprint $table) {
            $table->boolean('enabled')->default(true)->after('exclude_events');
        });

        // Migrar dados existentes: 'active' -> true, 'inactive' -> false
        DB::statement("UPDATE webhooks SET enabled = CASE WHEN status = 'active' THEN true ELSE false END");

        // Remover a coluna status antiga
        Schema::table('webhooks', function (Blueprint $table) {
            $table->dropColumn('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recriar a coluna status como enum
        Schema::table('webhooks', function (Blueprint $table) {
            $table->enum('status', ['active', 'inactive'])->default('active')->after('exclude_events');
        });

        // Migrar dados de volta: true -> 'active', false -> 'inactive'
        DB::statement("UPDATE webhooks SET status = CASE WHEN enabled = true THEN 'active' ELSE 'inactive' END");

        // Remover a coluna enabled
        Schema::table('webhooks', function (Blueprint $table) {
            $table->dropColumn('enabled');
        });
    }
};
