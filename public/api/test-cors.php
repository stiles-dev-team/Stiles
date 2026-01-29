<?php
// Simple test endpoint to verify CORS and server access
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log request details
$logData = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'uri' => $_SERVER['REQUEST_URI'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'not set',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'not set',
    'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'not set',
    'referer' => $_SERVER['HTTP_REFERER'] ?? 'not set',
    'post_data' => $_POST,
    'files' => $_FILES,
    'timestamp' => date('Y-m-d H:i:s')
];

// Log to file
error_log('CORS Test Request: ' . json_encode($logData));

echo json_encode([
    'status' => 'success',
    'message' => 'CORS test successful',
    'request_info' => $logData
]);
