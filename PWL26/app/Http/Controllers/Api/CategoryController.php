<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        return response()->json(['message' => 'Success listing categories', 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $category = Category::create($validated);
        return response()->json(['message' => 'Category created successfully', 'data' => $category], 201);
    }

    public function show($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        return response()->json(['message' => 'Success fetching category', 'data' => $category]);
    }

    public function update(Request $request, $id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:100',
            'description' => 'nullable|string',
        ]);

        $category->update($validated);
        return response()->json(['message' => 'Category updated successfully', 'data' => $category]);
    }

    public function destroy($id)
    {
        $category = Category::find($id);
        if (!$category) return response()->json(['message' => 'Category not found'], 404);

        $category->delete();
        return response()->json(['message' => 'Category deleted successfully']);
    }
}
