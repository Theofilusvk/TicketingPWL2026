<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\RegisterOtpMail;

class AuthController extends Controller
{
    /**
     * Send OTP to email for registration verification.
     */
    public function sendRegisterOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:150',
        ]);

        // Check if email is already registered
        if (User::where('email', $request->email)->exists()) {
            return response()->json([
                'message' => 'This email is already registered.'
            ], 422);
        }

        // Generate 6-digit OTP
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        // Store OTP in cache for 5 minutes, keyed by email
        Cache::put('register_otp_' . $request->email, $otp, now()->addMinutes(5));

        // Send OTP email
        Mail::to($request->email)->send(new RegisterOtpMail($otp));

        return response()->json([
            'message' => 'OTP sent successfully.'
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:100|unique:users,username',
            'email' => 'required|string|email|max:150|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8',
            'otp' => 'required|string|size:6',
        ]);

        // Verify OTP
        $cachedOtp = Cache::get('register_otp_' . $request->email);

        if (!$cachedOtp || $cachedOtp !== $request->otp) {
            return response()->json([
                'message' => 'Invalid or expired OTP code.'
            ], 422);
        }

        // OTP is valid, remove it from cache
        Cache::forget('register_otp_' . $request->email);

        // Create user
        $validated['role'] = 'user';
        // Remove otp from validated data before creating user
        unset($validated['otp']);

        $user = User::create($validated);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'data' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'password' => 'required'
        ]);

        $user = null;

        // Mendukung login dengan 'email' ataupun 'username'
        if ($request->has('email') && !empty($request->email)) {
            $user = User::where('email', $request->email)->first();
        } elseif ($request->has('username') && !empty($request->username)) {
            $user = User::where('username', $request->username)->first();
        } else {
            return response()->json(['message' => 'Please provide email or username'], 400);
        }

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'data' => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'message' => 'User details',
            'data' => $request->user(),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }
}
