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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('domain');
            $table->string('document')->nullable()->after('phone'); // CNPJ/CPF
            $table->json('address')->nullable()->after('document');
            $table->json('plan_metadata')->nullable()->after('settings');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'document',
                'address',
                'plan_metadata'
            ]);
        });
    }
};
