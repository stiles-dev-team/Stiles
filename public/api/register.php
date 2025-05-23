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
$required_fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['error' => "Missing required field: $field"]);
        exit();
    }
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit();
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
    // Check if email already exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already registered']);
        exit();
    }

    // Hash password
    $hashed_password = password_hash($data['password'], PASSWORD_DEFAULT);

    // Insert new user
    $stmt = $pdo->prepare('INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)');
    $stmt->execute([
        $data['firstName'],
        $data['lastName'],
        $data['email'],
        $hashed_password
    ]);

    // Get the new user's ID
    $user_id = $pdo->lastInsertId();

    // Clear any output buffers
    ob_end_clean();

    // Return success response
    http_response_code(201);
    echo json_encode([
        'message' => 'Registration successful',
        'user' => [
            'id' => $user_id,
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'email' => $data['email']
        ]
    ]);

} catch (PDOException $e) {
    error_log('Registration error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Registration failed']);
}

// Ensure all output is sent
ob_end_flush();
?> 