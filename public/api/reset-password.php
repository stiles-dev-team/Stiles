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
$required_fields = ['token', 'password', 'confirmPassword'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Validate password match
if ($data['password'] !== $data['confirmPassword']) {
    http_response_code(400);
    echo json_encode(['error' => 'Passwords do not match']);
    exit();
}

// Validate password strength (minimum 8 characters, at least one number and one letter)
if (strlen($data['password']) < 8 || !preg_match('/[0-9]/', $data['password']) || !preg_match('/[a-zA-Z]/', $data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Password must be at least 8 characters long and contain at least one number and one letter']);
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

    // Hash the new password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Update password and clear reset token
    $stmt = $pdo->prepare('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires_at = NULL WHERE id = ?');
    $stmt->execute([$hashed_password, $user['id']]);

    // Clear any output buffers
    ob_end_clean();

    // Return success response
    http_response_code(200);
    echo json_encode(['message' => 'Password reset successfully']);

} catch (PDOException $e) {
    error_log('Password reset error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred while resetting the password']);
}

// Ensure all output is sent
ob_end_flush();
?> 