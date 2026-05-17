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
            'email' => 'admin@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Youssef',
            'email' => 'youssef@gmail.com',
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
        $instructorUser1 = User::create([
            'name' => 'Ahmed El Mansouri',
            'email' => 'ahmed@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
        ]);

        $instructor1 = Instructor::create([
            'user_id' => $instructorUser1->id,
            'specialty' => 'Permis B, EC',
            'salary' => 4500,
            'phone' => '0661223344',
            'hire_date' => now()->subYear(),
        ]);

        $instructorUser2 = User::create([
            'name' => 'Sara Bennani',
            'email' => 'sara@gmail.com',
            'password' => Hash::make('password'),
            'role' => 'instructor',
        ]);

        $instructor2 = Instructor::create([
            'user_id' => $instructorUser2->id,
            'specialty' => 'Permis A, B',
            'salary' => 4200,
            'phone' => '0665443322',
            'hire_date' => now()->subMonths(6),
        ]);

        // 4. Create Candidates
        $candidatesData = [
            ['name' => 'Driss Candidate', 'email' => 'driss@gmail.com', 'cin' => 'AB123456', 'type' => 'B', 'price' => 3000],
            ['name' => 'Yassine Alami', 'email' => 'yassine@gmail.com', 'cin' => 'CD789012', 'type' => 'EC', 'price' => 5000],
            ['name' => 'Meryem Tazi', 'email' => 'meryem@gmail.com', 'cin' => 'EF345678', 'type' => 'B', 'price' => 3000],
            ['name' => 'Omar Idrisi', 'email' => 'omar@gmail.com', 'cin' => 'GH901234', 'type' => 'A', 'price' => 2000],
            ['name' => 'Sofia Kadiri', 'email' => 'sofia@gmail.com', 'cin' => 'IJ567890', 'type' => 'B', 'price' => 3000],
        ];

        $candidates = [];
        foreach ($candidatesData as $data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make('password'),
                'role' => 'candidate',
            ]);

            $candidates[] = Candidate::create([
                'user_id' => $user->id,
                'cin' => $data['cin'],
                'phone' => '06' . rand(10000000, 99999999),
                'license_type' => $data['type'],
                'total_price' => $data['price'],
                'registration_date' => now()->subDays(rand(10, 60)),
                'status' => 'active',
                'rank' => 'Candidat de niveau ' . ['Débutant', 'Intermédiaire', 'Avancé'][rand(0, 2)],
            ]);
        }

        // 5. Create Skills and Payments for some candidates
        foreach ($candidates as $cand) {
            CandidateSkill::create(['candidate_id' => $cand->id, 'skill_name' => 'Code de la Route', 'progress' => rand(40, 95)]);
            CandidateSkill::create(['candidate_id' => $cand->id, 'skill_name' => 'Conduite Technique', 'progress' => rand(10, 60)]);
            
            Payment::create([
                'candidate_id' => $cand->id,
                'amount' => 1000,
                'payment_date' => now()->subDays(5),
                'payment_method' => 'cash',
            ]);
        }

        // 7. Create Appointments (Today and Future)
        $today = now()->toDateString();
        
        // Ahmed's sessions today
        $appt1 = Appointment::create([
            'instructor_id' => $instructor1->id,
            'vehicle_id'    => $car1->id,
            'license_type'  => 'B',
            'date'          => $today,
            'start_time'    => '09:00:00',
            'end_time'      => '10:00:00',
            'status'        => 'completed',
            'session_price' => 150,
        ]);
        $appt1->candidates()->sync([$candidates[0]->id]);

        $appt2 = Appointment::create([
            'instructor_id' => $instructor1->id,
            'vehicle_id'    => $car1->id,
            'license_type'  => 'B',
            'date'          => $today,
            'start_time'    => '11:00:00',
            'end_time'      => '12:00:00',
            'status'        => 'scheduled',
            'session_price' => 150,
        ]);
        $appt2->candidates()->sync([$candidates[2]->id, $candidates[4]->id]); // Group session

        // Sara's sessions today
        $appt3 = Appointment::create([
            'instructor_id' => $instructor2->id,
            'vehicle_id'    => $car2->id,
            'license_type'  => 'B',
            'date'          => $today,
            'start_time'    => '15:00:00',
            'end_time'      => '16:00:00',
            'status'        => 'scheduled',
            'session_price' => 150,
        ]);
        $appt3->candidates()->sync([$candidates[3]->id]);

        // Future session
        $appt4 = Appointment::create([
            'instructor_id' => $instructor1->id,
            'vehicle_id'    => $car1->id,
            'license_type'  => 'EC',
            'date'          => now()->addDays(2)->toDateString(),
            'start_time'    => '10:00:00',
            'end_time'      => '12:00:00',
            'status'        => 'scheduled',
            'session_price' => 300,
        ]);
        $appt4->candidates()->sync([$candidates[1]->id]);

        // Call SettingsSeeder if exists
        if (class_exists('Database\Seeders\SettingsSeeder')) {
            $this->call(SettingsSeeder::class);
        }
    }
}
