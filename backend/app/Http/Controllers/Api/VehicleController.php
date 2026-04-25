<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use App\Http\Requests\Vehicle\StoreVehicleRequest;
use App\Http\Requests\Vehicle\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $vehicles = Vehicle::when($request->status, fn($q) => $q->where('status', $request->status))
            ->when($request->search, fn($q) => $q->where('brand', 'like', "%{$request->search}%")
                ->orWhere('model', 'like', "%{$request->search}%")
                ->orWhere('plate_number', 'like', "%{$request->search}%"))
            ->latest()->paginate($request->per_page ?? 15);

        return VehicleResource::collection($vehicles);
    }

    public function store(StoreVehicleRequest $request)
    {
        $vehicle = Vehicle::create($request->validated());

        return response()->json([
            'message' => 'Véhicule ajouté avec succès.',
            'vehicle' => new VehicleResource($vehicle),
        ], 201);
    }

    public function show(Vehicle $vehicle)
    {
        return new VehicleResource($vehicle->load('appointments'));
    }

    public function update(UpdateVehicleRequest $request, Vehicle $vehicle)
    {
        $vehicle->update($request->validated());

        return response()->json([
            'message' => 'Véhicule mis à jour.',
            'vehicle' => new VehicleResource($vehicle),
        ]);
    }

    public function destroy(Vehicle $vehicle)
    {
        $vehicle->delete();
        return response()->json(['message' => 'Véhicule supprimé.']);
    }
}
