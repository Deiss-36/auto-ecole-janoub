<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ExamController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $exams = \App\Models\Exam::with('candidate.user')
            ->when($request->candidate_id, fn($q) => $q->where('candidate_id', $request->candidate_id))
            ->when($request->type,         fn($q) => $q->where('type', $request->type))
            ->when($request->result,       fn($q) => $q->where('result', $request->result))
            ->latest('date')
            ->paginate($request->per_page ?? 15);

        return response()->json($exams);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'candidate_id'   => 'required|exists:candidates,id',
            'type'           => 'required|in:code,driving',
            'date'           => 'required|date',
            'result'         => 'required|in:pending,passed,failed',
            'attempt_number' => 'integer|min:1',
            'notes'          => 'nullable|string',
        ]);

        $exam = \App\Models\Exam::create($validated);

        return response()->json([
            'message' => 'Examen enregistré.',
            'exam'    => $exam->load('candidate.user'),
        ], 201);
    }

    public function update(Request $request, \App\Models\Exam $exam)
    {
        $validated = $request->validate([
            'candidate_id'   => 'sometimes|exists:candidates,id',
            'type'           => 'sometimes|in:code,driving',
            'date'           => 'sometimes|date',
            'result'         => 'sometimes|in:pending,passed,failed',
            'attempt_number' => 'sometimes|integer|min:1',
            'notes'          => 'nullable|string',
        ]);

        $exam->update($validated);

        return response()->json([
            'message' => 'Examen mis à jour.',
            'exam'    => $exam->load('candidate.user'),
        ]);
    }

    public function destroy(\App\Models\Exam $exam)
    {
        $exam->delete();
        return response()->json(['message' => 'Examen supprimé.']);
    }

}
