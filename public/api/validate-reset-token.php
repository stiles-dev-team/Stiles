<?php
// Ensure no output before headers
ob_start();

require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check for JSON decode errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (!isset($data['token']) || empty($data['token'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Token is required']);
    exit();
}

try {
    // Check if token exists and is not expired
    $stmt = $pdo->prepare('SELECT id, email FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW() AND is_active = TRUE');
    $stmt->execute([$data['token']]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid or expired reset token']);
        exit();
    }

    // Clear any output buffers
    ob_end_clean();

    // Return success response
    http_response_code(200);
    echo json_encode(['message' => 'Token is valid']);

} catch (PDOException $e) {
    error_log('Token validation error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred while validating the token']);
}

// Ensure all output is sent
ob_end_flush();
?> 