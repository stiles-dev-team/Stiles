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
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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
