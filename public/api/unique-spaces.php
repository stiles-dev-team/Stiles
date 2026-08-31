<?php
// Ensure no output before headers
ob_start();

require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS unique_spaces (
        id INT AUTO_INCREMENT PRIMARY KEY,
        space VARCHAR(255) NOT NULL
    )");

    $stmt = $pdo->prepare('
        SELECT id, space as name
        FROM unique_spaces 
        ORDER BY space ASC
    ');
    $stmt->execute();
    $spaces = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'message' => 'Unique spaces retrieved successfully',
        'spaces' => $spaces
    ]);

} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error occurred',
        'error' => 'Database connection failed'
    ]);
} catch(Exception $e) {
    error_log('General error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while retrieving unique spaces',
        'error' => 'Internal server error'
    ]);
}
?>
