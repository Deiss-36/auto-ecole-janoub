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
        // 1. USERS TABLE - Base for all roles
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->enum('role', ['admin', 'secretary', 'instructor', 'candidate'])->default('admin');
            $table->rememberToken();
            $table->timestamps();
        });

        // 2. VEHICLES TABLE - School Fleet
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('brand');
            $table->string('model');
            $table->string('plate_number')->unique();
            $table->enum('status', ['active', 'maintenance', 'out_of_service'])->default('active');
            $table->date('last_maintenance')->nullable();
            $table->timestamps();
        });

        // 3. INSTRUCTORS TABLE - Profile Extension
        Schema::create('instructors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('specialty')->nullable();
            $table->decimal('salary', 10, 2)->default(0);
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->date('hire_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 4. CANDIDATES TABLE - Profile Extension
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('cin')->unique();
            $table->string('phone')->nullable();
            $table->text('address')->nullable();
            $table->enum('license_type', ['A', 'B', 'C', 'D', 'EC'])->default('B');
            $table->decimal('total_price', 10, 2)->default(0);
            $table->date('registration_date')->nullable();
            $table->date('start_date')->nullable();
            $table->date('expected_end_date')->nullable();
            $table->string('rank')->default('Débutant');
            $table->enum('status', ['active', 'completed', 'suspended', 'cancelled'])->default('active');
            $table->timestamps();
        });

        // 5. CANDIDATE SKILLS TABLE
        Schema::create('candidate_skills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->string('skill_name');
            $table->integer('progress')->default(0); // 0-100
            $table->timestamps();
        });

        // 6. PAYMENTS TABLE - Transaction History
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained('candidates')->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('payment_date');
            $table->string('payment_method')->default('cash'); // cash, bank, etc.
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 7. APPOINTMENTS TABLE - The "Link"
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('instructor_id')->constrained('instructors')->onDelete('cascade');
            $table->foreignId('candidate_id')->nullable()->constrained('candidates')->onDelete('cascade');
            $table->foreignId('vehicle_id')->nullable()->constrained('vehicles')->onDelete('set null');

            $table->enum('license_type', ['A', 'B', 'C', 'D', 'EC']);
            $table->date('date');
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'no_show'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->decimal('session_price', 8, 2)->default(0);
            $table->timestamps();

            $table->index(['date', 'instructor_id']);
        });

        // 8. EXPENSES TABLE - School Costs
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users'); // Who recorded it
            $table->string('category'); // rent, electricity, fuel, maintenance, etc.
            $table->decimal('amount', 10, 2);
            $table->date('date');
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // 10. PERSONAL ACCESS TOKENS (Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');

        Schema::dropIfExists('expenses');
        Schema::dropIfExists('appointments');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('candidate_skills');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('instructors');
        Schema::dropIfExists('vehicles');
        Schema::dropIfExists('users');
    }
};
