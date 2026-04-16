<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\URL;
use App\Mail\RegisterOtpMail;
use App\Mail\VerifyEmailMail;

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

        // Create user with unverified email
        $validated['role'] = 'user';
        $validated['password'] = Hash::make($validated['password']);
        unset($validated['otp']);

        $user = User::create($validated);

        // Generate signed email verification URL
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $user->user_id, 'hash' => sha1($user->email)]
        );

        // Send verification email
        Mail::to($user->email)->send(new VerifyEmailMail($user, $verificationUrl));

        return response()->json([
            'message' => 'Registration successful. Please check your email to verify your account.',
            'data' => [
                'user' => $user,
                'email_verified' => false,
                'verification_pending' => true,
            ],
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

        // Check if email is verified
        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Please verify your email before logging in.',
                'email_verified' => false,
                'data' => ['email' => $user->email],
            ], 403);
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

    /**
     * Send verification email to unverified user
     */
    public function resendVerificationEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Check if already verified
        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email is already verified.'
            ], 422);
        }

        // Generate signed email verification URL
        $verificationUrl = URL::temporarySignedRoute(
            'verification.verify',
            now()->addHours(24),
            ['id' => $user->user_id, 'hash' => sha1($user->email)]
        );

        // Send verification email
        Mail::to($user->email)->send(new VerifyEmailMail($user, $verificationUrl));

        return response()->json([
            'message' => 'Verification email sent successfully.'
        ]);
    }

    /**
     * Verify email from signed URL (API endpoint)
     */
    public function verifyEmail(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        // Verify hash
        if (sha1($user->email) !== $hash) {
            return response()->json([
                'message' => 'Invalid verification link.'
            ], 422);
        }

        // Check if already verified
        if ($user->email_verified_at) {
            return response()->json([
                'message' => 'Email is already verified.'
            ]);
        }

        // Mark as verified
        $user->email_verified_at = now();
        $user->save();

        // Generate token for auto-login
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Email verified successfully. You can now login.',
            'data' => $user,
            'token' => $token,
            'email_verified' => true,
        ]);
    }
}
