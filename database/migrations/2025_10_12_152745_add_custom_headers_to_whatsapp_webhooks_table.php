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
        Schema::table('whatsapp_webhooks', function (Blueprint $table) {
            $table->json('custom_headers')->nullable()->after('exclude_events');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('whatsapp_webhooks', function (Blueprint $table) {
            $table->dropColumn('custom_headers');
        });
    }
};
