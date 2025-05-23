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
if (!isset($data['email']) || !isset($data['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required']);
    exit();
}

try {
    // Get user by email
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ? AND is_active = TRUE');
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    // Verify password and user exists
    if (!$user || !password_verify($data['password'], $user['password'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
        exit();
    }

    // Update last login timestamp
    try {
        $stmt = $pdo->prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?');
        $stmt->execute([$user['id']]);
    } catch (PDOException $e) {
        error_log('Error updating last login: ' . $e->getMessage());
        // Continue execution as this is not critical
    }

    // Generate session token
    $token = bin2hex(random_bytes(32));
    error_log('Generated token: ' . $token);

    // Store token in database
    try {
        // First, clear any existing tokens for this user
        $stmt = $pdo->prepare('UPDATE users SET token = NULL WHERE id = ?');
        $stmt->execute([$user['id']]);
        error_log('Cleared existing token for user ID: ' . $user['id']);

        // Now store the new token
        $stmt = $pdo->prepare('UPDATE users SET token = ? WHERE id = ?');
        $result = $stmt->execute([$token, $user['id']]);
        error_log('Token update result: ' . ($result ? 'success' : 'failed'));

        // Verify the token was stored correctly
        $verify = $pdo->prepare('SELECT token FROM users WHERE id = ?');
        $verify->execute([$user['id']]);
        $storedToken = $verify->fetchColumn();
        error_log('Stored token verification: ' . ($storedToken === $token ? 'matches' : 'mismatch'));
        error_log('Stored token: ' . $storedToken);
        error_log('Generated token: ' . $token);

        if ($storedToken !== $token) {
            throw new Exception('Token verification failed - stored token does not match generated token');
        }

        // Clear any output buffers
        ob_end_clean();

        // Return success response with user data
        http_response_code(200);
        echo json_encode([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'firstName' => $user['first_name'],
                'lastName' => $user['last_name'],
                'email' => $user['email']
            ]
        ]);
    } catch (Exception $e) {
        error_log('Error in token storage process: ' . $e->getMessage());
        error_log('SQL State: ' . ($e instanceof PDOException ? $e->getCode() : 'N/A'));
        error_log('Error Info: ' . ($e instanceof PDOException ? print_r($e->errorInfo, true) : 'N/A'));
        http_response_code(500);
        echo json_encode([
            'error' => 'Login failed',
            'details' => 'Failed to store authentication token'
        ]);
        exit();
    }

} catch (PDOException $e) {
    error_log('Login error: ' . $e->getMessage());
    error_log('SQL State: ' . $e->getCode());
    error_log('Error Info: ' . print_r($e->errorInfo, true));
    http_response_code(500);
    echo json_encode([
        'error' => 'Login failed',
        'details' => 'Database error occurred'
    ]);
}

// Ensure all output is sent
ob_end_flush();
?> 