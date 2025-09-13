<?php
// Ensure no output before headers
ob_start();

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');

require_once 'config.php';

// Test database connection
try {
    $pdo->query('SELECT 1');
} catch(PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

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

// Get data from request body
$data = [];
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all finishes
            try {
                $stmt = $pdo->prepare('SELECT * FROM unique_finishs ORDER BY finish ASC');
                $stmt->execute();
                $finishes = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'finishes' => $finishes
                ]);
            } catch(PDOException $e) {
                error_log('Database error in GET: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database error occurred'
                ]);
            }
            break;

        case 'POST':
            // Create new finish
            if (!isset($data['finish']) || empty(trim($data['finish']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Finish name is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('INSERT INTO unique_finishs (finish) VALUES (?)');
                $stmt->execute([trim($data['finish'])]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Finish created successfully'
                ]);
            } catch(PDOException $e) {
                error_log('Database error in POST: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database error occurred'
                ]);
            }
            break;

        case 'PUT':
            // Update existing finish
            if (!isset($data['id']) || !isset($data['finish']) || empty(trim($data['finish']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID and finish name are required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('UPDATE unique_finishs SET finish = ? WHERE id = ?');
                $stmt->execute([trim($data['finish']), $data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Finish updated successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Finish not found']);
                }
            } catch(PDOException $e) {
                error_log('Database error in PUT: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database error occurred'
                ]);
            }
            break;

        case 'DELETE':
            // Delete finish
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Finish ID is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('DELETE FROM unique_finishs WHERE id = ?');
                $stmt->execute([$data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Finish deleted successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Finish not found']);
                }
            } catch(PDOException $e) {
                error_log('Database error in DELETE: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'success' => false,
                    'error' => 'Database error occurred'
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }

} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed'
    ]);
} catch(Exception $e) {
    error_log('General error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error'
    ]);
}
?>
