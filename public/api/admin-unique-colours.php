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
            // Get all colours
            try {
                $stmt = $pdo->prepare('SELECT * FROM unique_colours ORDER BY colour ASC');
                $stmt->execute();
                $colours = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'colours' => $colours
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
            // Create new colour
            if (!isset($data['colour']) || empty(trim($data['colour']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Colour name is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('INSERT INTO unique_colours (colour) VALUES (?)');
                $stmt->execute([trim($data['colour'])]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Colour created successfully'
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
            // Update existing colour
            if (!isset($data['id']) || !isset($data['colour']) || empty(trim($data['colour']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID and colour name are required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('UPDATE unique_colours SET colour = ? WHERE id = ?');
                $stmt->execute([trim($data['colour']), $data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Colour updated successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Colour not found']);
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
            // Delete colour
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Colour ID is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('DELETE FROM unique_colours WHERE id = ?');
                $stmt->execute([$data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Colour deleted successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Colour not found']);
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
