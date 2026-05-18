<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$role = $input['role'] ?? '';
$email = $input['email'] ?? '';
$name = $input['name'] ?? '';

if ($email && $name) {
    // In a real app, you would save this to the database
    echo json_encode([
        'status' => 'success',
        'message' => 'User registered successfully',
        'role' => $role
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Missing required fields'
    ]);
}
