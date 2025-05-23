<?php
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

// Get the request body
$data = json_decode(file_get_contents('php://input'), true);

// Validate required fields
if (!isset($data['firstName']) || !isset($data['lastName']) || !isset($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

// Get the authorization token
$headers = getallheaders();
$token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;

if (!$token) {
    http_response_code(401);
    echo json_encode(['error' => 'No token provided']);
    exit();
}

try {
    // Verify token and get user ID
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE token = ? AND is_active = 1");
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit();
    }

    // Start building the update query
    $updates = [];
    $params = [];

    // Add basic profile fields
    $updates[] = "first_name = ?";
    $params[] = $data['firstName'];

    $updates[] = "last_name = ?";
    $params[] = $data['lastName'];

    $updates[] = "email = ?";
    $params[] = $data['email'];

    // Add phone if provided
    if (isset($data['phone'])) {
        $updates[] = "phone = ?";
        $params[] = $data['phone'];
    }

    // Handle password change if provided
    if (!empty($data['currentPassword']) && !empty($data['newPassword'])) {
        // Verify current password
        if (!password_verify($data['currentPassword'], $user['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Current password is incorrect']);
            exit();
        }

        // Validate new password
        if ($data['newPassword'] !== $data['confirmPassword']) {
            http_response_code(400);
            echo json_encode(['error' => 'New passwords do not match']);
            exit();
        }

        if (strlen($data['newPassword']) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters long']);
            exit();
        }

        $updates[] = "password = ?";
        $params[] = password_hash($data['newPassword'], PASSWORD_DEFAULT);
    }

    // Add user ID to params
    $params[] = $user['id'];

    // Update the user
    $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    // Get updated user data
    $stmt = $pdo->prepare("SELECT id, first_name as firstName, last_name as lastName, email, phone FROM users WHERE id = ?");
    $stmt->execute([$user['id']]);
    $updatedUser = $stmt->fetch();

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'user' => $updatedUser
    ]);

} catch (PDOException $e) {
    error_log('Profile update failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to update profile']);
}
?> 