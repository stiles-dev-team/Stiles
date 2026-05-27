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

    // Normalize search query - remove special characters and convert to lowercase
    $normalizedQuery = strtolower(preg_replace('/[^a-zA-Z0-9\s]/', '', $searchQuery));
    $searchTerm = "%{$normalizedQuery}%";
    $startsWithTerm = $normalizedQuery . '%';
    
    // For SKU searches, also try exact match and case-insensitive match
    $skuSearchTerm = "%{$searchQuery}%";
    $skuExactTerm = $searchQuery;
    
    // Create fuzzy search variations for better matching
    $fuzzySearchTerms = [];
    
    // Add the original normalized query
    $fuzzySearchTerms[] = $normalizedQuery;
    
    // If the query contains spaces, also try without spaces (e.g., "Kit Kat" -> "kitkat")
    if (strpos($normalizedQuery, ' ') !== false) {
        $fuzzySearchTerms[] = str_replace(' ', '', $normalizedQuery);
    }
    
    // If the query doesn't contain spaces, try adding spaces between characters (e.g., "kitkat" -> "kit kat")
    if (strpos($normalizedQuery, ' ') === false && strlen($normalizedQuery) > 3) {
        // Try different space combinations for longer words
        $word = $normalizedQuery;
        for ($i = 1; $i < strlen($word) - 1; $i++) {
            $fuzzySearchTerms[] = substr($word, 0, $i) . ' ' . substr($word, $i);
        }
    }
    
    // Create search patterns for all fuzzy terms
    $searchPatterns = [];
    foreach ($fuzzySearchTerms as $term) {
        $searchPatterns[] = "%{$term}%";
        $searchPatterns[] = $term . '%'; // starts with
    }

    // Check if we're just getting filters
    $getFilters = isset($_GET['filters']) && $_GET['filters'] === 'true';

    if ($getFilters) {
        // Build dynamic search conditions for fuzzy matching
        $searchConditions = [];
        $filterParams = [];
        
        // Add fuzzy search patterns for all searchable columns
        foreach ($searchPatterns as $pattern) {
            $searchConditions[] = 'LOWER(sp.title) LIKE ?';
            $searchConditions[] = 'LOWER(sp.slug) LIKE ?';
            $searchConditions[] = 'LOWER(sp.description) LIKE ?';
            $searchConditions[] = 'LOWER(sp.product_category) LIKE ?';
            $searchConditions[] = 'LOWER(sp.product_tag) LIKE ?';
            $searchConditions[] = 'LOWER(sp.`attribute:pa_brands`) LIKE ?';
            $searchConditions[] = 'LOWER(sp.`attribute:pa_colour`) LIKE ?';
            $searchConditions[] = 'LOWER(sp.`attribute:pa_finish`) LIKE ?';
            $searchConditions[] = 'LOWER(sp.`attribute:pa_size`) LIKE ?';
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
            $filterParams[] = $pattern;
        }
        
        // Add SKU search conditions
        $searchConditions[] = 'LOWER(sp.sku) LIKE ?';
        $searchConditions[] = 'sp.sku LIKE ?';
        $searchConditions[] = 'LOWER(sp.sku) = LOWER(?)';
        $filterParams[] = '%' . $searchTerm . '%';
        $filterParams[] = $skuSearchTerm;
        $filterParams[] = $skuExactTerm;
        
        // Get unique filter values for the search results
        $stmt = $pdo->prepare('
            SELECT DISTINCT 
                sp.`attribute:pa_colour` as colour,
                sp.`attribute:pa_finish` as finish,
                sp.`attribute:pa_brands` as brands,
                sp.`attribute:pa_size` as size
            FROM stiles_products sp
            WHERE sp.status = "publish" 
            AND (' . implode(' OR ', $searchConditions) . ')
        ');
        
        $stmt->execute($filterParams);
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

    // Build dynamic search conditions for fuzzy matching
    $mainSearchConditions = [];
    $mainParams = [];
    
    // Add fuzzy search patterns for all searchable columns
    foreach ($searchPatterns as $pattern) {
        $mainSearchConditions[] = 'LOWER(sp.title) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.slug) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.description) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.product_category) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.product_tag) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.`attribute:pa_brands`) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.`attribute:pa_colour`) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.`attribute:pa_finish`) LIKE ?';
        $mainSearchConditions[] = 'LOWER(sp.`attribute:pa_size`) LIKE ?';
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
        $mainParams[] = $pattern;
    }
    
    // Add SKU search conditions
    $mainSearchConditions[] = 'LOWER(sp.sku) LIKE ?';
    $mainSearchConditions[] = 'sp.sku LIKE ?';
    $mainSearchConditions[] = 'LOWER(sp.sku) = LOWER(?)';
    $mainParams[] = '%' . $searchTerm . '%';
    $mainParams[] = $skuSearchTerm;
    $mainParams[] = $skuExactTerm;
    
    // Build the base query for products
    $baseQuery = '
        SELECT COUNT(*) as total 
        FROM stiles_products sp
        LEFT JOIN iq_table iq ON sp.sku = iq.code
        WHERE sp.status = "publish" 
        AND (' . implode(' OR ', $mainSearchConditions) . ')';
    $params = $mainParams;
    
    // Add filter conditions
    if (isset($_GET['finish']) && !empty($_GET['finish'])) {
        $finishes = explode(',', $_GET['finish']);
        $finishConditions = [];
        foreach ($finishes as $finish) {
            $cleanFinish = trim($finish);
            $finishConditions[] = 'sp.`attribute:pa_finish` LIKE ?';
            $params[] = '%' . $cleanFinish. '%';
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
            $colourConditions[] = 'sp.`attribute:pa_colour` LIKE ?';
            $params[] = '%' . $cleanColour. '%';
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
            $sizeConditions[] = 'sp.`attribute:pa_size` LIKE ?';
            $params[] = '%' . $cleanSize . '%';
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
            $brandConditions[] = 'sp.`attribute:pa_brands` LIKE ?';
            $params[] = '%' . $cleanBrand . '%';
        }
        if (!empty($brandConditions)) {
            $baseQuery .= ' AND (' . implode(' OR ', $brandConditions) . ')';
        }
    }

    // Get total count with filters
    $countStmt = $pdo->prepare($baseQuery);
    $countStmt->execute($params);
    $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];

    // Add sorting with brand + fuzzy search priority
    $sortBy = isset($_GET['sort']) ? $_GET['sort'] : 'asc';
    $priorityBrands = ['Etienne Tiles', 'Oak', 'Funky Tiles', 'Nest'];
    $brandPriorityConditions = [];
    $brandPriorityParams = [];

    foreach ($priorityBrands as $brand) {
        $brandPriorityConditions[] = 'LOWER(sp.`attribute:pa_brands`) LIKE ?';
        $brandPriorityParams[] = '%' . strtolower($brand) . '%';
    }

    $brandPriorityCase = 'CASE WHEN (' . implode(' OR ', $brandPriorityConditions) . ') THEN 0 ELSE 1 END';
    
    // Build sorting conditions for fuzzy search
    $sortConditions = [];
    $sortParams = [];
    
    // Add exact match first (highest priority)
    $sortConditions[] = 'LOWER(sp.title) = LOWER(?)';
    $sortParams[] = $searchQuery;
    
    // Add starts with conditions for all fuzzy terms
    foreach ($fuzzySearchTerms as $term) {
        $sortConditions[] = 'LOWER(sp.title) LIKE ?';
        $sortParams[] = $term . '%';
    }
    
    // Add contains conditions for all fuzzy terms
    foreach ($fuzzySearchTerms as $term) {
        $sortConditions[] = 'LOWER(sp.title) LIKE ?';
        $sortParams[] = '%' . $term . '%';
    }
    
    // Build the CASE statement for sorting
    $caseStatements = [];
    foreach ($sortConditions as $index => $condition) {
        $caseStatements[] = "WHEN {$condition} THEN {$index}";
    }
    $caseStatement = implode(' ', $caseStatements);
    
    $orderBy = "ORDER BY 
        {$brandPriorityCase},
        CASE 
            {$caseStatement}
            ELSE " . count($sortConditions) . "
        END,
        sp.post_date DESC";
    
    switch ($sortBy) {
        case 'desc':
            $orderBy = "ORDER BY 
                {$brandPriorityCase},
                CASE 
                    {$caseStatement}
                    ELSE " . count($sortConditions) . "
                END,
                sp.post_date ASC";
            break;
        case 'nuev':
            $orderBy = "ORDER BY 
                {$brandPriorityCase},
                CASE 
                    {$caseStatement}
                    ELSE " . count($sortConditions) . "
                END,
                COALESCE(CAST(iq.sellPInc1 AS DECIMAL(10,2)), 999999999) ASC";
            break;
        case 'vend':
            $orderBy = "ORDER BY 
                {$brandPriorityCase},
                CASE 
                    {$caseStatement}
                    ELSE " . count($sortConditions) . "
                END,
                COALESCE(CAST(iq.sellPInc1 AS DECIMAL(10,2)), 0) DESC";
            break;
    }

    // Build the final query with pagination
    $query = str_replace('COUNT(*) as total', '
        sp.ID,
        sp.title,
        sp.slug,
        sp.featured_image,
        sp.regular_price,
        sp.sale_price,
        sp.product_category,
        sp.`attribute:pa_colour` as colour,
        sp.`attribute:pa_finish` as finish,
        sp.`attribute:pa_brands` as brands,
        sp.`attribute:pa_size` as size,
        sp.status,
        sp.post_date,
        iq.sellPInc1
    ', $baseQuery) . ' ' . $orderBy;

    // Add the sorting parameters (brand priority first, then fuzzy relevance)
    $params = array_merge($params, $brandPriorityParams, $sortParams);

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