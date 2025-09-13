<?php
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all users
            $stmt = $pdo->prepare("
                SELECT 
                    id,
                    first_name,
                    last_name,
                    email,
                    phone,
                    is_admin,
                    is_active,
                    created_at,
                    last_login
                FROM users
                ORDER BY created_at DESC
            ");
            $stmt->execute();
            $users = $stmt->fetchAll();

            // Format the users data
            $formattedUsers = [];
            foreach ($users as $user) {
                $formattedUsers[] = [
                    'id' => $user['id'],
                    'first_name' => $user['first_name'],
                    'last_name' => $user['last_name'],
                    'email' => $user['email'],
                    'phone' => $user['phone'],
                    'role' => $user['is_admin'] ? 'admin' : 'customer',
                    'status' => $user['is_active'] ? 'active' : 'inactive',
                    'created_at' => $user['created_at'],
                    'last_login' => $user['last_login']
                ];
            }

            echo json_encode([
                'success' => true,
                'users' => $formattedUsers
            ]);
            break;

        case 'POST':
            // Create new user
            if (!isset($data['first_name']) || !isset($data['last_name']) || 
                !isset($data['email']) || !isset($data['password'])) {
                http_response_code(400);
                echo json_encode(['error' => 'First name, last name, email, and password are required']);
                exit();
            }

            // Check if email already exists
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
            $checkStmt->execute([$data['email']]);
            if ($checkStmt->fetch()) {
                http_response_code(400);
                echo json_encode(['error' => 'Email already exists']);
                exit();
            }

            // Hash the password
            $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

            // Insert new user
            $insertStmt = $pdo->prepare("
                INSERT INTO users (
                    first_name, 
                    last_name, 
                    email, 
                    phone, 
                    password, 
                    is_admin, 
                    is_active, 
                    created_at, 
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ");

            $result = $insertStmt->execute([
                $data['first_name'],
                $data['last_name'],
                $data['email'],
                $data['phone'] ?? null,
                $hashedPassword,
                ($data['role'] ?? 'customer') === 'admin' ? 1 : 0,
                ($data['status'] ?? 'active') === 'active' ? 1 : 0
            ]);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User created successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create user']);
            }
            break;

        case 'PUT':
            // Update user role or status
            if (!isset($data['user_id']) || (!isset($data['role']) && !isset($data['status']))) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID and role or status are required']);
                exit();
            }

            $userId = $data['user_id'];
            $updates = [];
            $params = [];

            if (isset($data['role'])) {
                $updates[] = 'is_admin = ?';
                $params[] = $data['role'] === 'admin' ? 1 : 0;
            }

            if (isset($data['status'])) {
                $updates[] = 'is_active = ?';
                $params[] = $data['status'] === 'active' ? 1 : 0;
            }

            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['error' => 'No valid updates provided']);
                exit();
            }

            $params[] = $userId;
            $updateStmt = $pdo->prepare("
                UPDATE users 
                SET " . implode(', ', $updates) . ", updated_at = NOW()
                WHERE id = ?
            ");
            $result = $updateStmt->execute($params);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User updated successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update user']);
            }
            break;

        case 'DELETE':
            // Delete user
            if (!isset($data['user_id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'User ID is required']);
                exit();
            }

            $userId = $data['user_id'];

            // Check if user exists
            $checkStmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
            $checkStmt->execute([$userId]);
            if (!$checkStmt->fetch()) {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }

            // Delete the user
            $deleteStmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $result = $deleteStmt->execute([$userId]);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'User deleted successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete user']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>
