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
        Schema::create('webhooks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('whatsapp_connection_id')->constrained()->onDelete('cascade');
            $table->string('url');
            $table->boolean('add_url_events')->default(false);
            $table->boolean('add_url_types_messages')->default(false);
            $table->text('events')->nullable();
            $table->text('exclude_events')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->boolean('synced')->default(false);
            $table->string('external_webhook_id')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('webhooks');
    }
};
