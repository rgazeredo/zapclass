<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('webhooks', function (Blueprint $table) {
            $table->string('webhook_code', 64)->nullable()->after('url');
            $table->index('webhook_code');
        });

        // Gerar códigos únicos para webhooks existentes
        $webhooks = DB::table('webhooks')->whereNull('webhook_code')->get();
        foreach ($webhooks as $webhook) {
            DB::table('webhooks')
                ->where('id', $webhook->id)
                ->update(['webhook_code' => Str::random(32)]);
        }

        // Tornar o campo obrigatório e único após popular
        Schema::table('webhooks', function (Blueprint $table) {
            $table->string('webhook_code', 64)->nullable(false)->unique()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('webhooks', function (Blueprint $table) {
            $table->dropIndex(['webhook_code']);
            $table->dropColumn('webhook_code');
        });
    }
};
