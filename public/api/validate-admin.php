<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
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

// Get the authorization header
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Extract token from Bearer token
if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit();
}

$token = $matches[1];

// Include database configuration
require_once 'config.php';

try {
    // Verify token and get user info
    $stmt = $pdo->prepare("SELECT id, email, is_admin FROM users WHERE token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid or expired token']);
        exit();
    }
    
    // Return admin status
    echo json_encode([
        'success' => true,
        'is_admin' => (bool)$user['is_admin'],
        'user_id' => $user['id']
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error']);
    exit();
}
?> 