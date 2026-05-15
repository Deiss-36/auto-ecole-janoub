<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\User;
use App\Mail\CandidateWelcomeMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();
        $plainPassword = $validated['password'];

        // 1. Create User account
        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($plainPassword),
            'role'     => 'candidate',
        ]);

        // 2. Create linked Candidate record
        Candidate::create([
            'user_id'           => $user->id,
            'cin'               => $validated['cin']          ?? null,
            'phone'             => $validated['phone']        ?? null,
            'address'           => $validated['address']      ?? null,
            'license_type'      => $validated['license_type'],
            'total_price'       => 0,
            'registration_date' => now()->toDateString(),
            'status'            => 'active',
        ]);

        // 3. Send welcome email (synchronous - no queue worker needed)
        try {
            Mail::to($user->email)
                ->send(new CandidateWelcomeMail($user, $plainPassword, $validated['license_type']));
        } catch (\Exception $e) {
            // Email failure should not block registration
            \Log::warning('Welcome email failed for ' . $user->email . ': ' . $e->getMessage());
        }

        // 4. Generate token
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم إنشاء الحساب بنجاح. تم إرسال بريد إلكتروني ترحيبي إليك.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['البريد الإلكتروني أو كلمة المرور غير صحيحة.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'تم تسجيل الدخول بنجاح.',
            'user'    => new UserResource($user),
            'token'   => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'تم تسجيل الخروج بنجاح.']);
    }

    public function profile(Request $request)
    {
        $user = $request->user()->load(['instructor', 'candidate']);
        return new UserResource($user);
    }

    public function updateProfile(UpdateProfileRequest $request)
    {
        $user = $request->user();
        $validated = $request->validated();

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'تم تحديث الملف الشخصي.',
            'user'    => new UserResource($user),
        ]);
    }
}

