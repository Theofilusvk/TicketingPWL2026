<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): View
    {
        return view('profile.edit', [
            'user' => $request->user(),
        ]);
    }

    /**
     * Update the user's profile information.
     *
     * Handles three scenarios for profile_photo:
     *  1. A new file is uploaded  → store it, delete the old one, save new path.
     *  2. The "remove" flag is set → delete the current photo, set DB to null.
     *  3. No change               → leave the existing value untouched.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        // Fill validated text fields (name, email, …) but NOT profile_photo
        // because we manage that field manually below.
        $user->fill($request->safe()->except('profile_photo'));

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        // ── Profile photo handling ────────────────────────────────────────────
        if ($request->hasFile('profile_photo') && $request->file('profile_photo')->isValid()) {
            // 1. Delete the old photo from storage (if one exists)
            if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }

            // Store the new photo under storage/app/public/profile-photos/
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $user->profile_photo = $path;

        } elseif ($request->boolean('remove_profile_photo')) {
            // 2. User explicitly requested removal
            if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
                Storage::disk('public')->delete($user->profile_photo);
            }
            $user->profile_photo = null;
        }
        // 3. No file & no remove flag → $user->profile_photo stays unchanged.

        $user->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     *
     * Also removes their profile photo from storage so no orphan files remain.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validateWithBag('userDeletion', [
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        // Clean up profile photo before deleting the account
        if ($user->profile_photo && Storage::disk('public')->exists($user->profile_photo)) {
            Storage::disk('public')->delete($user->profile_photo);
        }

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
