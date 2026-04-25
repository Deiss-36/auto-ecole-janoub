<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::updateOrCreate(['key' => 'school_name'], [
            'value' => 'Auto École JANOUB',
            'label' => 'Nom de l\'établissement',
            'category' => 'general'
        ]);

        Setting::updateOrCreate(['key' => 'school_address'], [
            'value' => '2 rue 1, Hay Saïda 2, 46000 Safi, Morocco',
            'label' => 'Adresse complète',
            'category' => 'general'
        ]);

        Setting::updateOrCreate(['key' => 'school_phone'], [
            'value' => '06 61 22 33 44',
            'label' => 'Téléphone de contact',
            'category' => 'general'
        ]);

        Setting::updateOrCreate(['key' => 'school_email'], [
            'value' => 'contact@janoub.com',
            'label' => 'Email de contact',
            'category' => 'general'
        ]);

        Setting::updateOrCreate(['key' => 'currency'], [
            'value' => 'DH',
            'label' => 'Devise',
            'category' => 'finance'
        ]);
    }
}
