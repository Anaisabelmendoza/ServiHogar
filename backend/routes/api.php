<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServiceRequestController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rutas protegidas (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Perfil
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    
    // Solicitudes de Servicio y Citas
    Route::post('/service-requests', [ServiceRequestController::class, 'store']);
    Route::get('/worker/requests', [ServiceRequestController::class, 'getActiveRequests']);
    Route::post('/worker/requests/{id}/status', [ServiceRequestController::class, 'updateStatus']);
    Route::get('/worker/history', [ServiceRequestController::class, 'getHistory']);
    Route::post('/worker/toggle-active', [ServiceRequestController::class, 'toggleActive']);
    Route::post('/worker/requests/{id}/review', [ServiceRequestController::class, 'submitReview']);
    
    // Incidentes
    Route::post('/incidents', [ServiceRequestController::class, 'reportIncident']);
});
