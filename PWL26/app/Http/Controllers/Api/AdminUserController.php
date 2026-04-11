<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminUserController extends Controller
{
    /**
     * Get all users with their current tier and credits.
     */
    public function index()
    {
        $users = User::select('users.user_id', 'users.username', 'users.email', 'users.role', 'users.updated_at')
            ->leftJoin('credit_transactions as ct', function ($join) {
                // Get the latest transaction to determine current balance
                $join->on('users.user_id', '=', 'ct.user_id')
                     ->whereRaw('ct.transaction_id = (SELECT MAX(transaction_id) FROM credit_transactions WHERE user_id = users.user_id)');
            })
            ->addSelect(DB::raw('COALESCE(ct.balance_after, 0) as current_credits'))
            ->get();

        // Map tiers based on credits
        // Tiers typically: PHANTOM (0), SQUIRE (some), KNIGHT, LORD, SOVEREIGN
        // We will fetch real tiers to assign dynamically
        $tiers = DB::table('tiers')->orderBy('min_credits', 'desc')->get();

        $mappedUsers = $users->map(function ($user) use ($tiers) {
            $userTier = 'PHANTOM'; // default
            foreach ($tiers as $tier) {
                if ($user->current_credits >= $tier->min_credits) {
                    $userTier = $tier->name;
                    break;
                }
            }

            return [
                'id' => (string) $user->user_id,
                'name' => $user->username,
                'email' => $user->email,
                'role' => $user->role,
                'tier' => $userTier,
                'credits' => (int) $user->current_credits,
                'lastActive' => $user->updated_at ? $user->updated_at->toIso8601String() : now()->toIso8601String(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $mappedUsers
        ]);
    }

    /**
     * Update user balance or tier.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($request->has('credits_adjustment')) {
            $adjustment = (int) $request->input('credits_adjustment');
            $this->applyCreditAdjustment($user->user_id, $adjustment, 'Admin manually adjusted balance.');
            return response()->json(['status' => 'success', 'message' => 'Balance adjusted successfully.']);
        }

        if ($request->has('tier')) {
            $targetTierName = strtoupper($request->input('tier'));
            $tier = DB::table('tiers')->where('name', $targetTierName)->first();

            if ($tier) {
                // Find current balance to see how much we need to adjust to EXACTLY match the target tier min_credits
                $currentBalance = $this->getCurrentCredits($user->user_id);
                $adjustment = $tier->min_credits - $currentBalance;

                // Only adjust forward or we can override. 
                // A better approach is to set it exactly so we match
                if ($adjustment != 0) {
                    $this->applyCreditAdjustment($user->user_id, $adjustment, "Admin adjusted tier to {$targetTierName}.");
                }
                return response()->json(['status' => 'success', 'message' => "Tier updated to {$targetTierName}."]);
            }

            return response()->json(['status' => 'error', 'message' => 'Invalid tier.'], 400);
        }

        return response()->json(['status' => 'error', 'message' => 'No relevant data provided in request.'], 400);
    }

    /**
     * Delete the specified user.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        
        // Prevent admins from deleting themselves easily, or protect master admin
        if ($user->role === 'admin' && config('app.env') !== 'testing') {
            return response()->json(['status' => 'error', 'message' => 'Action restricted: cannot delete admin users.'], 403);
        }

        $user->delete();

        return response()->json(['status' => 'success', 'message' => 'User deleted successfully.']);
    }

    /**
     * Helper to apply a credit adjustment transaction.
     */
    private function applyCreditAdjustment($userId, $amount, $description)
    {
        if ($amount == 0) return;

        $currentBalance = $this->getCurrentCredits($userId);
        $newBalance = max(0, $currentBalance + $amount);

        DB::table('credit_transactions')->insert([
            'user_id' => $userId,
            'type' => $amount > 0 ? 'EARN' : 'REDEEM',
            'amount' => abs($amount),
            'balance_after' => $newBalance,
            'reference_type' => 'manual_adjustment',
            'reference_id' => null,
            'description' => $description,
            'created_at' => now()
        ]);
    }

    private function getCurrentCredits($userId)
    {
        return DB::table('credit_transactions')
            ->where('user_id', $userId)
            ->orderBy('transaction_id', 'desc')
            ->value('balance_after') ?? 0;
    }
}
