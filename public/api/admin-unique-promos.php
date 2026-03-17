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
            // Get all promos
            try {
                $stmt = $pdo->prepare('SELECT * FROM unique_promos ORDER BY promo ASC');
                $stmt->execute();
                $promos = $stmt->fetchAll();
                
                echo json_encode([
                    'success' => true,
                    'promos' => $promos
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
            // Create new promo
            if (!isset($data['promo']) || empty(trim($data['promo']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Promo name is required']);
                exit();
            }

            // Optional fields for promo page
            $pageTitle = isset($data['page_title']) ? trim($data['page_title']) : null;
            $slug = isset($data['slug']) ? trim($data['slug']) : null;
            $bannerUrl = isset($data['banner_url']) ? trim($data['banner_url']) : null;
            $hasPage = isset($data['has_page']) && ($data['has_page'] === 1 || $data['has_page'] === '1' || $data['has_page'] === true) ? 1 : 0;

            try {
                $stmt = $pdo->prepare('
                    INSERT INTO unique_promos (promo, page_title, slug, banner_url, has_page)
                    VALUES (:promo, :page_title, :slug, :banner_url, :has_page)
                ');
                $stmt->execute([
                    ':promo' => trim($data['promo']),
                    ':page_title' => $pageTitle,
                    ':slug' => $slug,
                    ':banner_url' => $bannerUrl,
                    ':has_page' => $hasPage
                ]);
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Promo created successfully'
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
            // Update existing promo
            if (!isset($data['id']) || !isset($data['promo']) || empty(trim($data['promo']))) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'ID and promo name are required']);
                exit();
            }

            // Optional fields for promo page
            $pageTitle = isset($data['page_title']) ? trim($data['page_title']) : null;
            $slug = isset($data['slug']) ? trim($data['slug']) : null;
            $bannerUrl = isset($data['banner_url']) ? trim($data['banner_url']) : null;
            $hasPage = isset($data['has_page']) && ($data['has_page'] === 1 || $data['has_page'] === '1' || $data['has_page'] === true) ? 1 : 0;

            try {
                $stmt = $pdo->prepare('
                    UPDATE unique_promos 
                    SET promo = :promo,
                        page_title = :page_title,
                        slug = :slug,
                        banner_url = :banner_url,
                        has_page = :has_page
                    WHERE id = :id
                ');
                $stmt->execute([
                    ':promo' => trim($data['promo']),
                    ':page_title' => $pageTitle,
                    ':slug' => $slug,
                    ':banner_url' => $bannerUrl,
                    ':has_page' => $hasPage,
                    ':id' => $data['id']
                ]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Promo updated successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Promo not found']);
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
            // Delete promo
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Promo ID is required']);
                exit();
            }
            
            try {
                $stmt = $pdo->prepare('DELETE FROM unique_promos WHERE id = ?');
                $stmt->execute([$data['id']]);
                
                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Promo deleted successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Promo not found']);
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
