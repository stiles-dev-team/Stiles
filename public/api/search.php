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

try {
    // Get search query
    $searchQuery = isset($_GET['q']) ? trim($_GET['q']) : '';
    if (empty($searchQuery)) {
        throw new Exception('Search query is required');
    }

    // Check if we're just getting filters
    $getFilters = isset($_GET['filters']) && $_GET['filters'] === 'true';

    if ($getFilters) {
        // Get unique filter values for the search results
        $stmt = $pdo->prepare('
            SELECT DISTINCT 
                `attribute:pa_colour` as colour,
                `attribute:pa_finish` as finish,
                `attribute:pa_brands` as brands,
                `attribute:pa_size` as size
            FROM stiles_products 
            WHERE status = "publish" 
            AND (
                title LIKE ? 
                OR description LIKE ? 
                OR sku LIKE ?
            )
        ');
        
        $searchTerm = "%{$searchQuery}%";
        $stmt->execute([$searchTerm, $searchTerm, $searchTerm]);
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
            'data' => $filters
        ]);
        exit();
    }

    // Build the base query for products
    $baseQuery = 'SELECT COUNT(*) as total FROM stiles_products WHERE status = "publish" AND (title LIKE ? OR description LIKE ? OR sku LIKE ?)';
    $params = ["%{$searchQuery}%", "%{$searchQuery}%", "%{$searchQuery}%"];
    
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

    // Add brand filter condition
    if (isset($_GET['brands']) && !empty($_GET['brands'])) {
        $brands = explode(',', $_GET['brands']);
        $brandConditions = [];
        foreach ($brands as $brand) {
            $cleanBrand = trim($brand);
            $brandConditions[] = 'FIND_IN_SET(?, `attribute:pa_brands`) > 0';
            $params[] = $cleanBrand;
        }
        if (!empty($brandConditions)) {
            $baseQuery .= ' AND (' . implode(' OR ', $brandConditions) . ')';
        }
    }

    // Get total count with filters
    $countStmt = $pdo->prepare($baseQuery);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Add sorting
    $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'asc';
    $orderBy = 'ORDER BY post_date DESC';
    switch ($sortBy) {
        case 'desc':
            $orderBy = 'ORDER BY post_date ASC';
            break;
        case 'nuev':
            $orderBy = 'ORDER BY regular_price ASC';
            break;
        case 'vend':
            $orderBy = 'ORDER BY regular_price DESC';
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
    ', $baseQuery) . ' ' . $orderBy;

    // Add pagination
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 15;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Validate limit
    if ($limit <= 0 || $limit > 100) {
        $limit = 15; // Default to 15 if invalid
    }

    $query .= ' LIMIT ? OFFSET ?';
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

} catch (Exception $e) {
    error_log('Error in search.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}

// End output buffering and send the response
if (!$useCompression) {
    ob_end_flush();
} 