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
        // 1. Update Candidates table
        Schema::table('candidates', function (Blueprint $table) {
            $table->enum('folder_status', ['complete', 'incomplete'])->default('incomplete')->after('status');
            $table->string('photo_path')->nullable()->after('folder_status');
        });

        // 2. Update Appointments table
        Schema::table('appointments', function (Blueprint $table) {
            $table->enum('session_type', ['code', 'driving'])->default('driving')->after('license_type');
        });

        // 3. Create Exams table
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->enum('type', ['code', 'driving'])->default('code');
            $table->date('date');
            $table->enum('result', ['pending', 'passed', 'failed'])->default('pending'); // Admis / Refusé
            $table->integer('attempt_number')->default(1);
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Create Settings table
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->text('value')->nullable();
            $table->string('label')->nullable();
            $table->string('category')->default('general');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('settings');
        Schema::dropIfExists('exams');

        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('session_type');
        });

        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn(['folder_status', 'photo_path']);
        });
    }

};
