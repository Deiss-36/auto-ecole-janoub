<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Create pivot table
        Schema::create('appointment_candidate', function (Blueprint $table) {
            $table->id();
            $table->foreignId('appointment_id')->constrained()->onDelete('cascade');
            $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });

        // We could move existing data here if we wanted to, but user said not to worry about it.
        // Drop candidate_id from appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropForeign(['candidate_id']);
            $table->dropColumn('candidate_id');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->foreignId('candidate_id')->nullable()->constrained('candidates')->onDelete('cascade');
        });

        Schema::dropIfExists('appointment_candidate');
    }
};
