<?php
namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'         => ['required', 'string', 'max:255'],
            'email'        => ['required', 'email', 'unique:users,email'],
            'password'     => ['required', 'string', 'min:8', 'confirmed'],
            // Informations candidat
            'license_type' => ['required', 'in:A,B,C,D,EC'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'cin'          => ['required', 'string', 'max:20', 'unique:candidates,cin'],
            'address'      => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required'         => 'Le nom complet est obligatoire.',
            'email.required'        => 'L\'adresse email est obligatoire.',
            'email.unique'          => 'Cette adresse email est déjà utilisée.',
            'password.required'     => 'Le mot de passe est obligatoire.',
            'password.min'          => 'Le mot de passe doit contenir au moins 8 caractères.',
            'password.confirmed'    => 'Les mots de passe ne correspondent pas.',
            'license_type' => 'Le type de permis est obligatoire.',
            'license_type.in'       => 'Type de permis invalide. Choisissez A, B, C, D ou EC.',
            'cin.required'          => 'Le numéro CIN est obligatoire.',
            'cin.unique'            => 'Ce numéro CIN est déjà enregistré.',
        ];
    }
}
