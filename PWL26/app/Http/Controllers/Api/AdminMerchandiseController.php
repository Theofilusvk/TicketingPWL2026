<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminMerchandiseController extends Controller
{
    public function index()
    {
        $merchandise = DB::table('merchandise')->orderBy('created_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $merchandise
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:100',
            'price_credits' => 'required|numeric|min:0',
            'image_url' => 'required|string|max:255',
            'rarity' => 'required|in:COMMON,RARE,EPIC,LEGENDARY',
            'available_stock' => 'required|integer|min:0',
            'required_tier' => 'required|string|max:50',
        ]);

        $id = DB::table('merchandise')->insertGetId([
            'title' => $request->title,
            'description' => $request->title, // Simple default
            'price_credits' => $request->price_credits,
            'price_usd' => $request->price_credits / 1000,
            'image_url' => $request->image_url,
            'rarity' => $request->rarity,
            'available_stock' => $request->available_stock,
            'required_tier' => $request->required_tier,
            'is_limited' => true,
            'category' => 'PHYSICAL',
            'status' => 'AVAILABLE',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'status' => 'success',
            'data' => ['merch_id' => $id]
        ]);
    }

    public function destroy($id)
    {
        DB::table('merchandise')->where('merch_id', $id)->delete();
        return response()->json(['status' => 'success']);
    }
}
