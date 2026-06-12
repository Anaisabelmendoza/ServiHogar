<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ServiceRequestController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Rutas protegidas (Sanctum)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    // Perfil
    Route::post('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/fcm-token', [AuthController::class, 'updateFcmToken']);
    
    // Trabajadores (Profesionales)
    Route::get('/workers', [ServiceRequestController::class, 'getWorkersByProfession']);
    
    // Solicitudes de Servicio y Citas
    Route::post('/service-requests', [ServiceRequestController::class, 'store']);
    Route::get('/worker/requests', [ServiceRequestController::class, 'getActiveRequests']);
    Route::post('/worker/requests/{id}/status', [ServiceRequestController::class, 'updateStatus']);
    Route::get('/worker/history', [ServiceRequestController::class, 'getHistory']);
    Route::get('/client/history', [ServiceRequestController::class, 'getClientHistory']);
    Route::post('/service-requests/{id}/invoice', [ServiceRequestController::class, 'updateInvoice']);
    Route::post('/service-requests/{id}/review', [ServiceRequestController::class, 'submitReview']);
    Route::post('/service-requests/{id}/update-date', [ServiceRequestController::class, 'updateDate']);
    Route::post('/worker/toggle-active', [ServiceRequestController::class, 'toggleActive']);
    Route::post('/worker/location', [AuthController::class, 'updateLocation']);
    Route::get('/service-requests/{id}/tracking', [ServiceRequestController::class, 'getTrackingInfo']);
    
    // Incidentes
    Route::post('/incidents', [ServiceRequestController::class, 'reportIncident']);
});
