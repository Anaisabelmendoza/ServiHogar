<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ServiceRequest;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ServiceRequestController extends Controller
{
    // Crear solicitud (Cliente)
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'description' => 'required|string',
            'appointment_type' => 'required|string',
            'appointment_date' => 'nullable|string',
            'address' => 'nullable|string',
            'phone' => 'nullable|string',
            'trabajador_id' => 'nullable|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        $serviceRequest = ServiceRequest::create([
            'cliente_id' => $user->id,
            'trabajador_id' => $request->trabajador_id,
            'description' => $request->description,
            'appointment_type' => $request->appointment_type,
            'appointment_date' => $request->appointment_date,
            'address' => $request->address,
            'phone' => $request->phone ?: $user->telefono,
            'status' => 'pendiente'
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Solicitud de servicio creada',
            'data' => $serviceRequest
        ], 201);
    }

    // Listar solicitudes activas de profesionales
    public function getActiveRequests()
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'worker') {
            return response()->json(['status' => 'error', 'message' => 'Solo profesionales autorizados'], 403);
        }

        // Si el profesional está inactivo, no debe recibir solicitudes
        if (!$user->is_active) {
            return response()->json([
                'status' => 'success',
                'is_active' => false,
                'data' => []
            ]);
        }

        // Obtener solicitudes asignadas o genéricas que estén pendientes
        $requests = ServiceRequest::where(function($query) use ($user) {
                $query->where('trabajador_id', $user->id)
                      ->orWhereNull('trabajador_id');
            })
            ->where('status', 'pendiente')
            ->with('cliente')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'is_active' => true,
            'data' => $requests
        ]);
    }

    // Cambiar estado de solicitud (Ej: Aceptar/Empezar/Terminar/Cancelar)
    public function updateStatus(Request $request, $id)
    {
        $user = Auth::user();
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json(['status' => 'error', 'message' => 'Solicitud no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:pendiente,en_progreso,finalizado,cancelado'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        // Si no tenía trabajador asignado, asignarle el actual al aceptarse
        if (!$serviceRequest->trabajador_id && $user->role === 'worker') {
            $serviceRequest->trabajador_id = $user->id;
        }

        $serviceRequest->status = $request->status;
        $serviceRequest->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Estado actualizado a ' . $request->status,
            'data' => $serviceRequest
        ]);
    }

    // Historial del profesional
    public function getHistory()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $requests = ServiceRequest::where('trabajador_id', $user->id)
            ->where('status', 'finalizado')
            ->with('cliente')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }

    // Cambiar estado activo de trabajador
    public function toggleActive(Request $request)
    {
        $user = Auth::user();
        if (!$user || $user->role !== 'worker') {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $user->is_active = $request->input('is_active', true);
        $user->save();

        return response()->json([
            'status' => 'success',
            'is_active' => $user->is_active,
            'user' => $user
        ]);
    }

    // Guardar reseña y valoración
    public function submitReview(Request $request, $id)
    {
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json(['status' => 'error', 'message' => 'Solicitud no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        $serviceRequest->rating = $request->rating;
        $serviceRequest->comment = $request->comment;
        $serviceRequest->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Reseña guardada con éxito',
            'data' => $serviceRequest
        ]);
    }

    // Reportar incidente / problema
    public function reportIncident(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $validator = Validator::make($request->all(), [
            'service_request_id' => 'nullable|exists:service_requests,id',
            'motivo' => 'required|string',
            'detalle' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        $incident = Incident::create([
            'service_request_id' => $request->service_request_id,
            'reporter_id' => $user->id,
            'motivo' => $request->motivo,
            'detalle' => $request->detalle
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Incidente reportado correctamente',
            'data' => $incident
        ], 201);
    }
}
