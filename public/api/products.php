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

// Get unique filter values by category
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['category']) && isset($_GET['filters']) && $_GET['filters'] === 'true') {
    try {
        $category = $_GET['category'];
        $categoryPattern = '%' . $category . '%';
        
        // First get all products for this category
        $stmt = $pdo->prepare('
            SELECT 
                `attribute:pa_colour` as colour,
                `attribute:pa_finish` as finish,
                `attribute:pa_brands` as brands,
                `attribute:pa_size` as size
            FROM stiles_products 
            WHERE status = "publish" 
            AND product_category LIKE ?
        ');
        
        $stmt->execute([$categoryPattern]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the results to get unique values
        $processValues = function($products, $field) {
            $values = [];
            foreach ($products as $product) {
                if (!empty($product[$field])) {
                    $fieldValues = explode(',', $product[$field]);
                    foreach ($fieldValues as $value) {
                        $value = trim($value);
                        if (!empty($value)) {
                            $values[] = $value;
                        }
                    }
                }
            }
            $values = array_unique($values);
            sort($values);
            return array_values($values);
        };
        
        $filters = [
            'colours' => $processValues($products, 'colour'),
            'finishes' => $processValues($products, 'finish'),
            'brands' => $processValues($products, 'brands'),
            'sizes' => $processValues($products, 'size')
        ];
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Filter values retrieved successfully',
            'data' => $filters
        ]);
        exit();
        
    } catch(PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching filter values',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
        exit();
    }
}

// Get unique filter values by brand
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['brand']) && isset($_GET['filters']) && $_GET['filters'] === 'true') {
    try {
        $brand = $_GET['brand'];
        
        // First get all products for this brand
        $stmt = $pdo->prepare('
            SELECT 
                `attribute:pa_colour` as colour,
                `attribute:pa_finish` as finish,
                `attribute:pa_brands` as brands,
                `attribute:pa_size` as size
            FROM stiles_products 
            WHERE status = "publish" 
            AND `attribute:pa_brands` = ?
        ');
        
        $stmt->execute([$brand]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the results to get unique values
        $processValues = function($products, $field) {
            $values = [];
            foreach ($products as $product) {
                if (!empty($product[$field])) {
                    $fieldValues = explode(',', $product[$field]);
                    foreach ($fieldValues as $value) {
                        $value = trim($value);
                        if (!empty($value)) {
                            $values[] = $value;
                        }
                    }
                }
            }
            $values = array_unique($values);
            sort($values);
            return array_values($values);
        };
        
        $filters = [
            'colours' => $processValues($products, 'colour'),
            'finishes' => $processValues($products, 'finish'),
            'brands' => $processValues($products, 'brands'),
            'sizes' => $processValues($products, 'size')
        ];
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Filter values retrieved successfully',
            'data' => $filters
        ]);
        exit();
        
    } catch(PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Error fetching filter values',
            'error' => $e->getMessage(),
            'error_code' => $e->getCode()
        ]);
        exit();
    }
}

// Get products by brand
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['brand']) && (!isset($_GET['filters']) || $_GET['filters'] !== 'true')) {
    try {
        $brand = $_GET['brand'];
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 15;
        $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
        
        // Validate limit
        if ($limit <= 0 || $limit > 100) {
            $limit = 15; // Default to 15 if invalid
        }
        
        // Debug log
        error_log("Fetching products for brand: {$brand} with limit: {$limit} and offset: {$offset}");
        
        // Build the base query with exact brand matching
        $baseQuery = 'SELECT COUNT(*) as total FROM stiles_products WHERE status = "publish" AND `attribute:pa_brands` = ?';
        $params = [$brand];
        
        // Add filter conditions
        if (isset($_GET['finish']) && !empty($_GET['finish'])) {
            $finishes = explode(',', $_GET['finish']);
            $finishConditions = [];
            foreach ($finishes as $finish) {
                $cleanFinish = trim($finish);
                $finishConditions[] = 'FIND_IN_SET(?, `attribute:pa_finish`) > 0';
                $params[] = $cleanFinish;
            }
            if (!empty($finishConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $finishConditions) . ')';
            }
        }
        
        if (isset($_GET['colours']) && !empty($_GET['colours'])) {
            $colours = explode(',', $_GET['colours']);
            $colourConditions = [];
            foreach ($colours as $colour) {
                $cleanColour = trim($colour);
                $colourConditions[] = 'FIND_IN_SET(?, `attribute:pa_colour`) > 0';
                $params[] = $cleanColour;
            }
            if (!empty($colourConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $colourConditions) . ')';
            }
        }
        
        if (isset($_GET['sizes']) && !empty($_GET['sizes'])) {
            $sizes = explode(',', $_GET['sizes']);
            $sizeConditions = [];
            foreach ($sizes as $size) {
                $cleanSize = trim($size);
                $sizeConditions[] = 'FIND_IN_SET(?, `attribute:pa_size`) > 0';
                $params[] = $cleanSize;
            }
            if (!empty($sizeConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $sizeConditions) . ')';
            }
        }
        
        if (isset($_GET['min_price']) && is_numeric($_GET['min_price'])) {
            $baseQuery .= ' AND regular_price >= ?';
            $params[] = (float)$_GET['min_price'];
        }
        
        if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
            $baseQuery .= ' AND regular_price <= ?';
            $params[] = (float)$_GET['max_price'];
        }
        
        // Log the final query and parameters
        error_log("Final query: " . $baseQuery);
        error_log("Final params: " . implode(', ', $params));
        
        // Get total count with filters
        $countStmt = $pdo->prepare($baseQuery);
        $countStmt->execute($params);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Log the total count
        error_log("Total count: " . $totalCount);
        
        // Add sorting
        $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'asc';
        $orderBy = 'ORDER BY post_date DESC';
        switch ($sortBy) {
            case 'desc':
                $orderBy = 'ORDER BY CAST(total_sales AS UNSIGNED) DESC';
                break;
            case 'nuev':
                $orderBy = 'ORDER BY CAST(regular_price AS DECIMAL(10,2)) ASC';
                break;
            case 'vend':
                $orderBy = 'ORDER BY CAST(regular_price AS DECIMAL(10,2)) DESC';
                break;
            case 'ascBrand':
                $orderBy = 'ORDER BY COALESCE(`attribute:pa_brands`, "zzzzzz") ASC';
                break;
            case 'descBrand':
                $orderBy = 'ORDER BY COALESCE(`attribute:pa_brands`, "") DESC';
                break;
        }
        
        // Build the final query with pagination
        $query = str_replace('COUNT(*) as total', '
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
            `attribute:pa_size` as size,
            status,
            post_date
        ', $baseQuery) . ' ' . $orderBy . ' LIMIT ? OFFSET ?';
        
        // Add pagination parameters
        $params[] = $limit;
        $params[] = $offset;
        
        // Execute the query
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the data to minimize size
        $processedProducts = array_map(function($product) {
            return [
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
                'size' => $product['size'],
                'status' => $product['status'],
                'post_date' => $product['post_date']
            ];
        }, $products);
        
        $response = [
            'status' => 'success',
            'data' => $processedProducts,
            'total_count' => (int)$totalCount,
            'current_page' => floor($offset / $limit) + 1,
            'total_pages' => ceil($totalCount / $limit),
            'per_page' => $limit
        ];
        
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

// Get all products (published by default)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['id']) && !isset($_GET['slug']) && !isset($_GET['category']) && !isset($_GET['brand'])) {
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
        
        // Build the base query
        $baseQuery = 'SELECT COUNT(*) as total FROM stiles_products WHERE status = "publish" AND product_category LIKE ?';
        $params = ['%' . $category . '%'];
        
        // Add filter conditions
        if (isset($_GET['brands']) && !empty($_GET['brands'])) {
            $brands = explode(',', $_GET['brands']);
            $brandConditions = [];
            foreach ($brands as $brand) {
                // Clean the brand name and handle spaces
                $cleanBrand = trim($brand);
                // Log the raw brand value and cleaned brand value
                error_log("Raw brand value: " . $brand);
                error_log("Cleaned brand value: " . $cleanBrand);
                
                // Use LIKE with wildcards for more flexible matching
                $brandConditions[] = '`attribute:pa_brands` LIKE ?';
                $params[] = '%' . $cleanBrand . '%';
            }
            if (!empty($brandConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $brandConditions) . ')';
            }
            error_log("Brand filter conditions: " . implode(' OR ', $brandConditions));
            error_log("Brand filter params: " . implode(', ', $params));
            error_log("Raw brands from URL: " . $_GET['brands']);
        }
        
        if (isset($_GET['finish']) && !empty($_GET['finish'])) {
            $finishes = explode(',', $_GET['finish']);
            $finishConditions = [];
            foreach ($finishes as $finish) {
                $cleanFinish = trim($finish);
                $finishConditions[] = 'FIND_IN_SET(?, `attribute:pa_finish`) > 0';
                $params[] = $cleanFinish;
            }
            if (!empty($finishConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $finishConditions) . ')';
            }
        }
        
        if (isset($_GET['colours']) && !empty($_GET['colours'])) {
            $colours = explode(',', $_GET['colours']);
            $colourConditions = [];
            foreach ($colours as $colour) {
                $cleanColour = trim($colour);
                $colourConditions[] = 'FIND_IN_SET(?, `attribute:pa_colour`) > 0';
                $params[] = $cleanColour;
            }
            if (!empty($colourConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $colourConditions) . ')';
            }
        }
        
        if (isset($_GET['sizes']) && !empty($_GET['sizes'])) {
            $sizes = explode(',', $_GET['sizes']);
            $sizeConditions = [];
            foreach ($sizes as $size) {
                $cleanSize = trim($size);
                $sizeConditions[] = 'FIND_IN_SET(?, `attribute:pa_size`) > 0';
                $params[] = $cleanSize;
            }
            if (!empty($sizeConditions)) {
                $baseQuery .= ' AND (' . implode(' OR ', $sizeConditions) . ')';
            }
        }
        
        if (isset($_GET['min_price']) && is_numeric($_GET['min_price'])) {
            $baseQuery .= ' AND regular_price >= ?';
            $params[] = (float)$_GET['min_price'];
        }
        
        if (isset($_GET['max_price']) && is_numeric($_GET['max_price'])) {
            $baseQuery .= ' AND regular_price <= ?';
            $params[] = (float)$_GET['max_price'];
        }
        
        // Log the final query and parameters
        error_log("Final query: " . $baseQuery);
        error_log("Final params: " . implode(', ', $params));
        
        // Get total count with filters
        $countStmt = $pdo->prepare($baseQuery);
        $countStmt->execute($params);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Log the total count
        error_log("Total count: " . $totalCount);
        
        // Add sorting
        $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'asc';
        $orderBy = 'ORDER BY post_date DESC';
        switch ($sortBy) {
            case 'desc':
                $orderBy = 'ORDER BY CAST(total_sales AS UNSIGNED) DESC';
                break;
            case 'nuev':
                $orderBy = 'ORDER BY CAST(regular_price AS DECIMAL(10,2)) ASC';
                break;
            case 'vend':
                $orderBy = 'ORDER BY CAST(regular_price AS DECIMAL(10,2)) DESC';
                break;
            case 'ascBrand':
                $orderBy = 'ORDER BY COALESCE(`attribute:pa_brands`, "zzzzzz") ASC';
                break;
            case 'descBrand':
                $orderBy = 'ORDER BY COALESCE(`attribute:pa_brands`, "") DESC';
                break;
        }
        
        // Build the final query with pagination
        $query = str_replace('COUNT(*) as total', '
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
            `attribute:pa_size` as size,
            status,
            post_date
        ', $baseQuery) . ' ' . $orderBy . ' LIMIT ? OFFSET ?';
        
        // Add pagination parameters
        $params[] = $limit;
        $params[] = $offset;
        
        // Execute the query
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the data to minimize size
        $processedProducts = array_map(function($product) {
            return [
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
                'size' => $product['size'],
                'status' => $product['status'],
                'post_date' => $product['post_date']
            ];
        }, $products);
        
        $response = [
            'status' => 'success',
            'data' => $processedProducts,
            'total_count' => (int)$totalCount,
            'current_page' => floor($offset / $limit) + 1,
            'total_pages' => ceil($totalCount / $limit),
            'per_page' => $limit
        ];
        
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