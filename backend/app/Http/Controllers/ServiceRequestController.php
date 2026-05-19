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
    // Listar trabajadores por profesión
    public function getWorkersByProfession(Request $request)
    {
        $profesion = $request->query('profesion');
        $query = User::where('role', 'worker')->where('is_active', true);
        
        if ($profesion) {
            $query->where('profesion', 'LIKE', '%' . $profesion . '%');
        }

        return response()->json([
            'status' => 'success',
            'data' => $query->get()
        ]);
    }

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
            ->whereIn('status', ['pendiente', 'en_progreso'])
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
            'status' => 'required|string|in:pendiente,en_progreso,finalizado,cancelado',
            'worker_rating' => 'nullable|integer|min:1|max:5',
            'worker_report' => 'nullable|string',
            'invoice_price' => 'nullable|numeric',
            'invoice_materials' => 'nullable|string',
            'invoice_hours' => 'nullable|numeric'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        // Si no tenía trabajador asignado, asignarle el actual al aceptarse
        if (!$serviceRequest->trabajador_id && $user->role === 'worker') {
            $serviceRequest->trabajador_id = $user->id;
        }

        $serviceRequest->status = $request->status;

        // Guardar campos de informe/factura/valoración al finalizar
        if ($request->has('worker_rating')) $serviceRequest->worker_rating = $request->worker_rating;
        if ($request->has('worker_report')) $serviceRequest->worker_report = $request->worker_report;
        if ($request->has('invoice_price')) $serviceRequest->invoice_price = $request->invoice_price;
        if ($request->has('invoice_materials')) $serviceRequest->invoice_materials = $request->invoice_materials;
        if ($request->has('invoice_hours')) $serviceRequest->invoice_hours = $request->invoice_hours;

        $serviceRequest->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Estado actualizado a ' . $request->status,
            'data' => $serviceRequest
        ]);
    }

    // Actualizar/Editar factura e informe por el profesional
    public function updateInvoice(Request $request, $id)
    {
        $user = Auth::user();
        $serviceRequest = ServiceRequest::find($id);

        if (!$serviceRequest) {
            return response()->json(['status' => 'error', 'message' => 'Solicitud no encontrada'], 404);
        }

        if ($user->role !== 'worker' || $serviceRequest->trabajador_id !== $user->id) {
            return response()->json(['status' => 'error', 'message' => 'No autorizado'], 403);
        }

        $validator = Validator::make($request->all(), [
            'worker_report' => 'nullable|string',
            'invoice_price' => 'nullable|numeric',
            'invoice_materials' => 'nullable|string',
            'invoice_hours' => 'nullable|numeric',
            'worker_rating' => 'nullable|integer|min:1|max:5'
        ]);

        if ($validator->fails()) {
            return response()->json(['status' => 'error', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('worker_report')) $serviceRequest->worker_report = $request->worker_report;
        if ($request->has('invoice_price')) $serviceRequest->invoice_price = $request->invoice_price;
        if ($request->has('invoice_materials')) $serviceRequest->invoice_materials = $request->invoice_materials;
        if ($request->has('invoice_hours')) $serviceRequest->invoice_hours = $request->invoice_hours;
        if ($request->has('worker_rating')) $serviceRequest->worker_rating = $request->worker_rating;

        $serviceRequest->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Factura e informe actualizados correctamente',
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
            'rating' => 'required|integer|min:0|max:5',
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

    public function getTrackingInfo($id)
    {
        $serviceRequest = ServiceRequest::with('trabajador')->find($id);

        if (!$serviceRequest) {
            return response()->json(['status' => 'error', 'message' => 'Request not found'], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'id' => $serviceRequest->id,
                'status' => $serviceRequest->status,
                'address' => $serviceRequest->address,
                'trabajador' => $serviceRequest->trabajador ? [
                    'id' => $serviceRequest->trabajador->id,
                    'name' => $serviceRequest->trabajador->name,
                    'apellidos' => $serviceRequest->trabajador->apellidos,
                    'telefono' => $serviceRequest->trabajador->telefono,
                    'avatarUrl' => $serviceRequest->trabajador->avatarUrl,
                    'latitude' => $serviceRequest->trabajador->latitude,
                    'longitude' => $serviceRequest->trabajador->longitude,
                ] : null
            ]
        ]);
    }

    // Historial del cliente
    public function getClientHistory()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'Unauthorized'], 401);
        }

        $requests = ServiceRequest::where('cliente_id', $user->id)
            ->where('status', 'finalizado')
            ->with('trabajador')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $requests
        ]);
    }
}
