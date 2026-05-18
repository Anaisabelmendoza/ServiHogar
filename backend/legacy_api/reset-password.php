<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$email = $input['email'] ?? '';
$code = $input['code'] ?? '';
$password = $input['password'] ?? '';

// Simple simulation: code "123456" is always valid
if ($code === '123456') {
    echo json_encode([
        'status' => 'success',
        'message' => 'Password reset successfully'
    ]);
} else {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Invalid verification code'
    ]);
}
