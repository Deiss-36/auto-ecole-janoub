<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Expense\StoreExpenseRequest;
use App\Http\Requests\Expense\UpdateExpenseRequest;
use App\Http\Resources\ExpenseResource;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $expenses = Expense::with('user:id,name')
            ->when($request->category, fn($q) => $q->where('category', $request->category))
            ->when($request->from,     fn($q) => $q->whereDate('date', '>=', $request->from))
            ->when($request->to,       fn($q) => $q->whereDate('date', '<=', $request->to))
            ->latest('date')
            ->paginate($request->per_page ?? 20);

        return ExpenseResource::collection($expenses);
    }

    public function store(StoreExpenseRequest $request)
    {
        $expense = Expense::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'تم تسجيل المصروف.',
            'expense' => new ExpenseResource($expense),
        ], 201);
    }

    public function show(Expense $expense)
    {
        return new ExpenseResource($expense->load('user:id,name'));
    }

    public function update(UpdateExpenseRequest $request, Expense $expense)
    {
        $expense->update($request->validated());

        return response()->json([
            'message' => 'Dépense mise à jour.',
            'expense' => new ExpenseResource($expense),
        ]);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(['message' => 'تم حذف المصروف.']);
    }

    public function summary(Request $request)
    {
        return response()->json([
            'total'       => Expense::when($request->from, fn($q) => $q->whereDate('date', '>=', $request->from))
                                    ->when($request->to,   fn($q) => $q->whereDate('date', '<=', $request->to))
                                    ->sum('amount'),
            'by_category' => Expense::select('category', DB::raw('SUM(amount) as total'))
                                    ->groupBy('category')->get(),
        ]);
    }
}
