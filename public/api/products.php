<?php
// Start output buffering at the very beginning
ob_start();

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log errors to a file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');

// Set headers that can be modified
header('Content-Type: application/json');
header('Cache-Control: public, max-age=300'); // Cache for 5 minutes

// Handle compression
$useCompression = false;
if (extension_loaded('zlib')) {
    $useCompression = true;
    ini_set('zlib.output_compression', 'On');
    ini_set('zlib.output_compression_level', '9');
}

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

// Get all products (published by default)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id']) && !isset($_GET['slug']) && !isset($_GET['category'])) {
    try {
        // First, let's try a simple query to get just one product
        $stmt = $pdo->query('SELECT * FROM stiles_products WHERE status = "publish" LIMIT 1');
        $testProduct = $stmt->fetch();
        
        if (!$testProduct) {
            echo json_encode([
                'status' => 'success',
                'message' => 'No published products found',
                'data' => []
            ]);
            exit();
        }

        // If we got here, the table exists and we can query it
        $stmt = $pdo->query('SELECT * FROM stiles_products WHERE status = "publish" ORDER BY post_date DESC');
        $products = $stmt->fetchAll();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Published products retrieved successfully',
            'data' => $products
        ]);
        exit();
    } catch(PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching products',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
        exit();
    }
}

// Get single product by ID (only published)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['id'])) {
    try {
        $stmt = $pdo->prepare('SELECT * FROM stiles_products WHERE ID = ? AND status = "publish"');
        $stmt->execute([$_GET['id']]);
        $product = $stmt->fetch();
        
        if (!$product) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Published product not found'
            ]);
            exit();
        }
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Product retrieved successfully',
            'data' => $product
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching product',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    }
}

// Get single product by slug (only published)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['slug'])) {
    try {
        $stmt = $pdo->prepare('SELECT * FROM stiles_products WHERE slug = ? AND status = "publish"');
        $stmt->execute([$_GET['slug']]);
        $product = $stmt->fetch();
        
        if (!$product) {
            http_response_code(404);
            echo json_encode([
                'status' => 'error',
                'message' => 'Published product not found'
            ]);
            exit();
        }
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Product retrieved successfully',
            'data' => $product
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching product',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    }
}

// Get all products (including unpublished) - admin endpoint
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['admin']) && $_GET['admin'] === 'true') {
    try {
        $stmt = $pdo->query('SELECT * FROM stiles_products ORDER BY post_date DESC');
        $products = $stmt->fetchAll();
        
        echo json_encode([
            'status' => 'success',
            'message' => 'All products retrieved successfully',
            'data' => $products
        ]);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching products',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
    }
}

// Get random products by category with limit
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['category'])) {
    try {
        $category = $_GET['category'];
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 15;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        // Validate limit
        if ($limit <= 0 || $limit > 100) {
            $limit = 15; // Default to 15 if invalid
        }
        
        // Debug log
        error_log("Fetching products for category: {$category} with limit: {$limit} and offset: {$offset}");
        
        // First, get total count of products in this category
        $countStmt = $pdo->prepare('
            SELECT COUNT(*) as total 
            FROM stiles_products 
            WHERE status = "publish" 
            AND product_category LIKE ?
        ');
        
        $categoryPattern = '%' . $category . '%';
        $countStmt->execute([$categoryPattern]);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        error_log("Total products matching category pattern {$categoryPattern}: {$totalCount}");
        
        // Now get our paginated selection with only essential fields
        $stmt = $pdo->prepare('
            SELECT 
                ID,
                title,
                slug,
                featured_image,
                regular_price,
                sale_price,
                product_category,
                `attribute:pa_colour` as colour,
                `attribute:pa_finish` as finish,
                `attribute:pa_brands` as brands,
                status,
                post_date
            FROM stiles_products 
            WHERE status = "publish" 
            AND product_category LIKE ? 
            ORDER BY post_date DESC
            LIMIT ? OFFSET ?
        ');
        
        $stmt->execute([$categoryPattern, $limit, $offset]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug log
        error_log("Retrieved " . count($products) . " products (should be {$limit})");
        
        // Process the data to minimize size
        $processedProducts = array_map(function($product) {
            // Create a new array with only the fields we need
            $cleanProduct = [
                'id' => (int)$product['ID'],
                'title' => $product['title'],
                'slug' => $product['slug'],
                'image' => $product['featured_image'],
                'price' => [
                    'regular' => (float)$product['regular_price'],
                    'sale' => $product['sale_price'] ? (float)$product['sale_price'] : null
                ],
                'category' => $product['product_category'],
                'colour' => $product['colour'],
                'finish' => $product['finish'],
                'brands' => $product['brands'],
                'status' => $product['status'],
                'post_date' => $product['post_date']
            ];
            
            // Remove any null or empty values
            return array_filter($cleanProduct, function($value) {
                if (is_array($value)) {
                    return !empty(array_filter($value, function($v) {
                        return $v !== null && $v !== '';
                    }));
                }
                return $value !== null && $value !== '';
            });
        }, $products);
        
        $response = [
            'status' => 'success',
            'data' => $processedProducts,
            'total_count' => (int)$totalCount,
            'current_page' => floor($offset / $limit) + 1,
            'total_pages' => ceil($totalCount / $limit),
            'per_page' => $limit
        ];
        
        // Debug log
        $responseSize = strlen(json_encode($response));
        error_log("Response size before compression: {$responseSize} bytes");
        
        // Clear any previous output
        if (!$useCompression) {
            ob_clean();
        }
        
        // Encode with options to minimize size
        echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PARTIAL_OUTPUT_ON_ERROR);
        exit();
        
    } catch(PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching products',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
        exit();
    }
}

// Create new product
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare('INSERT INTO stiles_products (
            title, slug, description, excerpt, status, post_date, sku, stock,
            regular_price, sale_price, total_sales, metadesc, product_category,
            product_tag, `attribute:pa_brands`, `attribute:pa_colour`,
            `attribute:pa_finish`, `attribute:pa_size`, `meta:product_details`,
            pdf_url, featured_image, gallery_images
        ) VALUES (
            ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )');
        
        $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['description'],
            $data['excerpt'],
            $data['status'] ?? 'publish',
            $data['sku'],
            $data['stock'],
            $data['regular_price'],
            $data['sale_price'],
            $data['total_sales'],
            $data['metadesc'],
            $data['product_category'],
            $data['product_tag'],
            $data['attribute:pa_brands'],
            $data['attribute:pa_colour'],
            $data['attribute:pa_finish'],
            $data['attribute:pa_size'],
            $data['meta:product_details'],
            $data['pdf_url'],
            $data['featured_image'],
            $data['gallery_images']
        ]);
        
        $data['ID'] = $pdo->lastInsertId();
        echo json_encode($data);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error creating product: ' . $e->getMessage()]);
    }
}

// Update product
if ($_SERVER['REQUEST_METHOD'] === 'PUT' && isset($_GET['id'])) {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare('UPDATE stiles_products SET 
            title = ?, slug = ?, description = ?, excerpt = ?, status = ?,
            sku = ?, stock = ?, regular_price = ?, sale_price = ?, total_sales = ?,
            metadesc = ?, product_category = ?, product_tag = ?,
            `attribute:pa_brands` = ?, `attribute:pa_colour` = ?,
            `attribute:pa_finish` = ?, `attribute:pa_size` = ?,
            `meta:product_details` = ?, pdf_url = ?, featured_image = ?,
            gallery_images = ?
            WHERE ID = ?');
        
        $stmt->execute([
            $data['title'],
            $data['slug'],
            $data['description'],
            $data['excerpt'],
            $data['status'] ?? 'publish',
            $data['sku'],
            $data['stock'],
            $data['regular_price'],
            $data['sale_price'],
            $data['total_sales'],
            $data['metadesc'],
            $data['product_category'],
            $data['product_tag'],
            $data['attribute:pa_brands'],
            $data['attribute:pa_colour'],
            $data['attribute:pa_finish'],
            $data['attribute:pa_size'],
            $data['meta:product_details'],
            $data['pdf_url'],
            $data['featured_image'],
            $data['gallery_images'],
            $_GET['id']
        ]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit();
        }
        
        $data['ID'] = $_GET['id'];
        echo json_encode($data);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error updating product: ' . $e->getMessage()]);
    }
}

// Delete product
if ($_SERVER['REQUEST_METHOD'] === 'DELETE' && isset($_GET['id'])) {
    try {
        $stmt = $pdo->prepare('DELETE FROM stiles_products WHERE ID = ?');
        $stmt->execute([$_GET['id']]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit();
        }
        
        echo json_encode(['message' => 'Product deleted successfully']);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Error deleting product: ' . $e->getMessage()]);
    }
}

// End output buffering and send the response
if (!$useCompression) {
    ob_end_flush();
}
?> 