<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Instructor;
use App\Models\Candidate;
use App\Models\Vehicle;
use App\Models\Appointment;
use App\Models\Payment;
use App\Models\CandidateSkill;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Admins
        User::create([
            'name' => 'Admin Janoub',
            'email' => 'admin@janoub.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Secretary Fatima',
            'email' => 'fatima@janoub.com',
            'password' => Hash::make('password'),
            'role' => 'secretary',
        ]);

        // 2. Create Vehicles
        $car1 = Vehicle::create([
            'brand' => 'Dacia',
            'model' => 'Logan',
            'plate_number' => '12345-A-1',
            'status' => 'active',
        ]);

        $car2 = Vehicle::create([
            'brand' => 'Renault',
            'model' => 'Clio',
            'plate_number' => '67890-B-2',
            'status' => 'active',
        ]);

        // 3. Create Instructors
        $instructorUser = User::create([
            'name' => 'Ahmed El Mansouri',
            'email' => 'ahmed@janoub.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
        ]);

        $instructor = Instructor::create([
            'user_id' => $instructorUser->id,
            'specialty' => 'Permis B',
            'salary' => 4500,
            'phone' => '0661223344',
            'hire_date' => now()->subYear(),
        ]);

        // 4. Create Candidates
        $candidateUser = User::create([
            'name' => 'Driss Candidate',
            'email' => 'driss@example.com',
            'password' => Hash::make('password'),
            'role' => 'candidate',
        ]);

        $candidate = Candidate::create([
            'user_id' => $candidateUser->id,
            'cin' => 'AB123456',
            'phone' => '0677889900',
            'license_type' => 'B',
            'total_price' => 3000,
            'registration_date' => now()->subMonth(),
            'status' => 'active',
            'rank' => 'Candidat de niveau intermédiaire',
        ]);

        // 5. Create Skills for Candidate
        CandidateSkill::create([
            'candidate_id' => $candidate->id,
            'skill_name' => 'Code de la Route',
            'progress' => 85,
        ]);
        CandidateSkill::create([
            'candidate_id' => $candidate->id,
            'skill_name' => 'Stationnement/Créneau',
            'progress' => 60,
        ]);
        CandidateSkill::create([
            'candidate_id' => $candidate->id,
            'skill_name' => 'Conduite en ville',
            'progress' => 45,
        ]);

        // 6. Create Payments
        Payment::create([
            'candidate_id' => $candidate->id,
            'amount' => 1000,
            'payment_date' => now()->subWeeks(2),
            'payment_method' => 'cash',
            'notes' => 'First installment',
        ]);

        Payment::create([
            'candidate_id' => $candidate->id,
            'amount' => 500,
            'payment_date' => now()->subDays(3),
            'payment_method' => 'cash',
        ]);

        // 7. Create Appointments (using pivot table for candidates)
        $appt1 = Appointment::create([
            'instructor_id' => $instructor->id,
            'vehicle_id'    => $car1->id,
            'license_type'  => 'B',
            'date'          => now()->toDateString(),
            'start_time'    => '10:00:00',
            'end_time'      => '11:00:00',
            'status'        => 'completed',
            'session_price' => 150,
        ]);
        $appt1->candidates()->sync([$candidate->id]);

        $appt2 = Appointment::create([
            'instructor_id' => $instructor->id,
            'vehicle_id'    => $car1->id,
            'license_type'  => 'B',
            'date'          => now()->addDays(2)->toDateString(),
            'start_time'    => '14:00:00',
            'end_time'      => '15:00:00',
            'status'        => 'scheduled',
            'session_price' => 150,
        ]);
        $appt2->candidates()->sync([$candidate->id]);

        // Call SettingsSeeder if exists
        if (class_exists('Database\Seeders\SettingsSeeder')) {
            $this->call(SettingsSeeder::class);
        }
    }
}
