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
            // 🔒 Inscription publique réservée aux candidats uniquement.
            'role'         => ['sometimes', 'in:candidate'],
            // Informations candidat
            'license_type' => ['required', 'in:A,B,C,D,E'],
            'phone'        => ['nullable', 'string', 'max:20'],
            'cin'          => ['nullable', 'string', 'max:20'],
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
            'license_type.required' => 'Le type de permis est obligatoire.',
            'license_type.in'       => 'Type de permis invalide. Choisissez A, B, C, D ou E.',
        ];
    }
}
