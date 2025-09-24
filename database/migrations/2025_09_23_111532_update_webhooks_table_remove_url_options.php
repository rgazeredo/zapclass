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
        Schema::table('webhooks', function (Blueprint $table) {
            $table->dropColumn(['add_url_events', 'add_url_types_messages']);
        });

        // Para PostgreSQL, vamos renomear e recriar as colunas
        DB::statement('ALTER TABLE webhooks RENAME COLUMN events TO events_old');
        DB::statement('ALTER TABLE webhooks RENAME COLUMN exclude_events TO exclude_events_old');

        Schema::table('webhooks', function (Blueprint $table) {
            $table->json('events')->nullable();
            $table->json('exclude_events')->nullable();
        });

        // Migrar dados existentes se houver
        DB::statement("UPDATE webhooks SET events = CASE WHEN events_old IS NOT NULL AND events_old != '' THEN JSON_BUILD_ARRAY(events_old) ELSE NULL END");
        DB::statement("UPDATE webhooks SET exclude_events = CASE WHEN exclude_events_old IS NOT NULL AND exclude_events_old != '' THEN JSON_BUILD_ARRAY(exclude_events_old) ELSE NULL END");

        Schema::table('webhooks', function (Blueprint $table) {
            $table->dropColumn(['events_old', 'exclude_events_old']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('webhooks', function (Blueprint $table) {
            $table->boolean('add_url_events')->default(false);
            $table->boolean('add_url_types_messages')->default(false);
            $table->text('events')->nullable()->change();
            $table->text('exclude_events')->nullable()->change();
        });
    }
};
