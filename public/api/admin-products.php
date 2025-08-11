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

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if requesting max ID
            if (isset($_GET['get_max_id']) && $_GET['get_max_id'] == '1') {
                try {
                    $stmt = $pdo->prepare('SELECT MAX(ID) as max_id FROM stiles_products');
                    $stmt->execute();
                    $result = $stmt->fetch();
                    $maxId = $result['max_id'] ? (int)$result['max_id'] : 0;
                    
                    echo json_encode([
                        'status' => 'success',
                        'max_id' => $maxId
                    ]);
                } catch(PDOException $e) {
                    error_log('Database error in GET max_id: ' . $e->getMessage());
                    http_response_code(500);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'Database error occurred',
                        'error' => $e->getMessage()
                    ]);
                }
                break;
            }
            
            // Get products with pagination
            try {
                $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
                $search = isset($_GET['search']) ? $_GET['search'] : '';
                $category = isset($_GET['category']) ? $_GET['category'] : '';
                $brand = isset($_GET['brand']) ? $_GET['brand'] : '';
                
                // Calculate offset
                $offset = ($page - 1) * $limit;
                
                // Build WHERE clause
                $whereConditions = [];
                $params = [];
                
                if (!empty($search)) {
                    $whereConditions[] = '(title LIKE ? OR description LIKE ?)';
                    $params[] = '%' . $search . '%';
                    $params[] = '%' . $search . '%';
                }
                
                if (!empty($category) && $category !== 'all') {
                    $whereConditions[] = 'product_category = ?';
                    $params[] = $category;
                }
                
                if (!empty($brand) && $brand !== 'all') {
                    $whereConditions[] = '`attribute:pa_brands` = ?';
                    $params[] = $brand;
                }
                
                $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                // Get total count
                $countQuery = 'SELECT COUNT(*) as total FROM stiles_products ' . $whereClause;
                $countStmt = $pdo->prepare($countQuery);
                $countStmt->execute($params);
                $totalCount = $countStmt->fetch()['total'];
                
                // Get paginated products
                $query = 'SELECT * FROM stiles_products ' . $whereClause . ' ORDER BY post_date DESC LIMIT ? OFFSET ?';
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $products = $stmt->fetchAll();
                
                // Calculate pagination info
                $totalPages = ceil($totalCount / $limit);
                $hasNextPage = $page < $totalPages;
                $hasPrevPage = $page > 1;

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Products retrieved successfully',
                    'products' => $products,
                    'pagination' => [
                        'current_page' => $page,
                        'total_pages' => $totalPages,
                        'total_products' => $totalCount,
                        'products_per_page' => $limit,
                        'has_next_page' => $hasNextPage,
                        'has_prev_page' => $hasPrevPage
                    ]
                ]);
            } catch(PDOException $e) {
                error_log('Database error in GET: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database error occurred',
                    'error' => $e->getMessage()
                ]);
            }
            break;

        case 'POST':
            // Create new product
            if (!isset($data['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                exit();
            }

            // Generate file URLs with proper format
            $currentYear = date('Y');
            $currentMonth = date('m');
            $baseUrl = "https://stiles.co.za/images/{$currentYear}/{$currentMonth}/";

            // Process PDF URL
            $pdfUrl = '';
            if (!empty($data['pdf_url'])) {
                $pdfUrl = $baseUrl . $data['pdf_url'];
            }

            // Process Featured Image URL
            $featuredImageUrl = '';
            if (!empty($data['featured_image'])) {
                $featuredImageUrl = $baseUrl . $data['featured_image'];
            }

            // Process Gallery Images URLs
            $galleryImagesUrl = '';
            if (!empty($data['gallery_images'])) {
                $galleryFiles = explode(', ', $data['gallery_images']);
                $galleryUrls = array_map(function($file) use ($baseUrl) {
                    return $baseUrl . trim($file);
                }, $galleryFiles);
                $galleryImagesUrl = implode(', ', $galleryUrls);
            }

            try {
                $stmt = $pdo->prepare('
                    INSERT INTO stiles_products (
                        ID, title, slug, description, status, post_date, sku, stock, 
                        regular_price, sale_price, metadesc, product_category, product_tag,
                        `attribute:pa_brands`, `attribute:pa_colour`, `attribute:pa_finish`, 
                        `attribute:pa_size`, `meta:product_details`, pdf_url, featured_image, 
                        gallery_images, promo
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ');
                
                $stmt->execute([
                    $data['id'] ?? null,
                    $data['title'],
                    $data['slug'] ?? '',
                    $data['description'] ?? '',
                    $data['status'] ?? 'publish',
                    $data['post_date'] ?? date('Y-m-d H:i:s'),
                    $data['sku'] ?? '',
                    $data['stock'] ?? 0,
                    $data['regular_price'] ?? 0,
                    $data['sale_price'] ?? 0,
                    $data['metadesc'] ?? '',
                    $data['product_category'] ?? '',
                    $data['product_tag'] ?? '',
                    $data['attribute:pa_brands'] ?? '',
                    $data['attribute:pa_colour'] ?? '',
                    $data['attribute:pa_finish'] ?? '',
                    $data['attribute:pa_size'] ?? '',
                    $data['meta:product_details'] ?? '',
                    $pdfUrl,
                    $featuredImageUrl,
                    $galleryImagesUrl,
                    $data['promo'] ?? ''
                ]);

                $productId = $pdo->lastInsertId();

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Product created successfully',
                    'product_id' => $productId
                ]);
            } catch(PDOException $e) {
                error_log('Database error in POST: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database error occurred',
                    'error' => $e->getMessage()
                ]);
            }
            break;

        case 'PUT':
            // Update existing product
            if (!isset($data['id']) || !isset($data['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'ID and title are required']);
                exit();
            }

            // Generate file URLs with proper format
            $currentYear = date('Y');
            $currentMonth = date('m');
            $baseUrl = "https://stiles.co.za/images/{$currentYear}/{$currentMonth}/";

            // Process PDF URL - only update if new file is provided
            $pdfUrl = $data['pdf_url'] ?? '';
            if (!empty($data['pdf_url']) && !filter_var($data['pdf_url'], FILTER_VALIDATE_URL)) {
                $pdfUrl = $baseUrl . $data['pdf_url'];
            }

            // Process Featured Image URL - only update if new file is provided
            $featuredImageUrl = $data['featured_image'] ?? '';
            if (!empty($data['featured_image']) && !filter_var($data['featured_image'], FILTER_VALIDATE_URL)) {
                $featuredImageUrl = $baseUrl . $data['featured_image'];
            }

            // Process Gallery Images URLs - only update if new files are provided
            $galleryImagesUrl = $data['gallery_images'] ?? '';
            if (!empty($data['gallery_images']) && !str_contains($data['gallery_images'], 'https://')) {
                $galleryFiles = explode(', ', $data['gallery_images']);
                $galleryUrls = array_map(function($file) use ($baseUrl) {
                    return $baseUrl . trim($file);
                }, $galleryFiles);
                $galleryImagesUrl = implode(', ', $galleryUrls);
            }

            try {
                $stmt = $pdo->prepare('
                    UPDATE stiles_products SET 
                        title = ?, 
                        slug = ?,
                        description = ?, 
                        status = ?,
                        post_date = ?,
                        sku = ?,
                        stock = ?, 
                        regular_price = ?,
                        sale_price = ?,
                        metadesc = ?,
                        product_category = ?,
                        product_tag = ?,
                        `attribute:pa_brands` = ?,
                        `attribute:pa_colour` = ?,
                        `attribute:pa_finish` = ?,
                        `attribute:pa_size` = ?,
                        `meta:product_details` = ?,
                        pdf_url = ?,
                        featured_image = ?, 
                        gallery_images = ?,
                        promo = ?
                    WHERE ID = ?
                ');
                
                $stmt->execute([
                    $data['title'],
                    $data['slug'] ?? '',
                    $data['description'] ?? '',
                    $data['status'] ?? 'publish',
                    $data['post_date'] ?? date('Y-m-d H:i:s'),
                    $data['sku'] ?? '',
                    $data['stock'] ?? 0,
                    $data['regular_price'] ?? 0,
                    $data['sale_price'] ?? 0,
                    $data['metadesc'] ?? '',
                    $data['product_category'] ?? '',
                    $data['product_tag'] ?? '',
                    $data['attribute:pa_brands'] ?? '',
                    $data['attribute:pa_colour'] ?? '',
                    $data['attribute:pa_finish'] ?? '',
                    $data['attribute:pa_size'] ?? '',
                    $data['meta:product_details'] ?? '',
                    $pdfUrl,
                    $featuredImageUrl,
                    $galleryImagesUrl,
                    $data['promo'] ?? '',
                    $data['id']
                ]);

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Product updated successfully'
                ]);
            } catch(PDOException $e) {
                error_log('Database error in PUT: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database error occurred',
                    'error' => $e->getMessage()
                ]);
            }
            break;

        case 'DELETE':
            // Delete product
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Product ID is required']);
                exit();
            }

            try {
                $stmt = $pdo->prepare('DELETE FROM stiles_products WHERE ID = ?');
                $stmt->execute([$data['id']]);

                if ($stmt->rowCount() > 0) {
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'Product deleted successfully'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Product not found']);
                }
            } catch(PDOException $e) {
                error_log('Database error in DELETE: ' . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'status' => 'error',
                    'message' => 'Database error occurred',
                    'error' => $e->getMessage()
                ]);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

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
        'message' => 'An error occurred while processing the request',
        'error' => 'Internal server error'
    ]);
}
?>
