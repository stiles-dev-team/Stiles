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
            // Get all categories
            try {
                $stmt = $pdo->prepare('SELECT * FROM unique_categories ORDER BY category ASC');
                $stmt->execute();
                $categories = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'categories' => $categories
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
            // Create new category
            if (!isset($data['category']) || empty(trim($data['category']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Category name is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('INSERT INTO unique_categories (category) VALUES (?)');
                $stmt->execute([trim($data['category'])]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Category created successfully'
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
            // Update existing category
            if (!isset($data['id']) || !isset($data['category']) || empty(trim($data['category']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID and category name are required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('UPDATE unique_categories SET category = ? WHERE id = ?');
                $stmt->execute([trim($data['category']), $data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Category updated successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Category not found']);
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
            // Delete category
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Category ID is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('DELETE FROM unique_categories WHERE id = ?');
                $stmt->execute([$data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Category deleted successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Category not found']);
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
