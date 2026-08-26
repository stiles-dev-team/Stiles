<?php
// Ensure no output before headers
ob_start();

// Set CORS headers FIRST, before any other processing
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Access-Control-Max-Age: 86400'); // Cache preflight for 24 hours

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit();
}

// Set content type header
header('Content-Type: application/json');

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

// Log all requests for debugging
error_log('Request received: ' . $_SERVER['REQUEST_METHOD'] . ' ' . $_SERVER['REQUEST_URI']);

// Get data from request body - handle both JSON and FormData
$data = [];

// Debug logging
error_log('Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'not set'));
error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);

// Check if this is a multipart form data request (file upload)
if (isset($_SERVER['CONTENT_TYPE']) && strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
    // Handle FormData (file uploads)
    $data = $_POST;
    error_log('Processing FormData. POST data: ' . print_r($_POST, true));
    error_log('FILES data: ' . print_r($_FILES, true));
    

    
    error_log('Parsed data: ' . print_r($data, true));
    
    // Process gallery images array to comma-separated string
    if (isset($data['gallery_images']) && is_array($data['gallery_images'])) {
        ksort($data['gallery_images']); // Sort by index to maintain order
        $data['gallery_images'] = implode(', ', $data['gallery_images']);
        error_log('Processed gallery images array to string: ' . $data['gallery_images']);
    }
    
    // Handle gallery images from $_FILES (for array format gallery_images[index])
    if (isset($_FILES['gallery_images'])) {
        $uploadDir = "../images/" . date('Y') . "/" . date('m') . "/";
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $galleryFileNames = [];
        $fileCount = count($_FILES['gallery_images']['name']);
        
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['gallery_images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileName = basename($_FILES['gallery_images']['name'][$i]);
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['gallery_images']['tmp_name'][$i], $targetPath)) {
                    $galleryFileNames[] = $fileName;
                    error_log('Successfully uploaded gallery image: ' . $fileName);
                } else {
                    error_log('Failed to upload gallery image: ' . $fileName);
                }
            }
        }
        
        if (!empty($galleryFileNames)) {
            $data['gallery_images'] = implode(', ', $galleryFileNames);
            error_log('Set gallery_images from $_FILES: ' . $data['gallery_images']);
        }
    }
    
    // Handle file uploads
    if (isset($_FILES['featured_image']) && $_FILES['featured_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = "../images/" . date('Y') . "/" . date('m') . "/";
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $fileName = basename($_FILES['featured_image']['name']);
        $targetPath = $uploadDir . $fileName;
        
        if (move_uploaded_file($_FILES['featured_image']['tmp_name'], $targetPath)) {
            $data['featured_image'] = $fileName;
            error_log('Successfully uploaded featured image: ' . $fileName);
        } else {
            error_log('Failed to upload featured image: ' . $fileName);
        }
    } else {
        // If no new file uploaded, check if we have an existing featured_image value
        if (isset($data['featured_image']) && !empty($data['featured_image'])) {
            error_log('Using existing featured image: ' . $data['featured_image']);
        } else {
            error_log('No featured image provided');
        }
    }
    
    // Handle gallery images
    if (isset($_FILES['gallery_images'])) {
        $uploadDir = "../images/" . date('Y') . "/" . date('m') . "/";
        
        // Create directory if it doesn't exist
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        $galleryFileNames = [];
        $fileCount = count($_FILES['gallery_images']['name']);
        
        for ($i = 0; $i < $fileCount; $i++) {
            if ($_FILES['gallery_images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileName = basename($_FILES['gallery_images']['name'][$i]);
                $targetPath = $uploadDir . $fileName;
                
                if (move_uploaded_file($_FILES['gallery_images']['tmp_name'][$i], $targetPath)) {
                    $galleryFileNames[] = $fileName;
                } else {
                    error_log('Failed to upload gallery image: ' . $fileName);
                }
            }
        }
        
        if (!empty($galleryFileNames)) {
            $data['gallery_images'] = implode(', ', $galleryFileNames);
        }
    }
} else {
    // Handle JSON data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    error_log('Processing JSON. Input: ' . $input);
    error_log('Decoded data: ' . print_r($data, true));
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Check if requesting max ID
            if (isset($_GET['get_max_id']) && $_GET['get_max_id'] == '1') {
                try {
                    $stmt = $pdo->prepare('SELECT MAX(ID) as max_id FROM stiles_products sp');
                    $stmt->execute();
                    $result = $stmt->fetch();
                    $maxId = $result['max_id'] ? (string)$result['max_id'] : '0';
                    
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
            
            // Get single product by slug (admin - any status)
            if (isset($_GET['slug'])) {
                try {
                    $stmt = $pdo->prepare('SELECT sp.*, iq.sellPInc1 as iq_price, iq.baseCost as iq_base_cost, iq.promoPrice as iq_promo_price, iq.onhand as iq_stock, iq.onPromotion as iq_on_promotion 
                                         FROM stiles_products sp 
                                         LEFT JOIN iq_table iq ON sp.sku = iq.code 
                                         WHERE sp.slug = ?');
                    $stmt->execute([$_GET['slug']]);
                    $product = $stmt->fetch();
                    
                    if (!$product) {
                        http_response_code(404);
                        echo json_encode([
                            'status' => 'error',
                            'message' => 'Product not found'
                        ]);
                    } else {
                        // Get media information for featured image
                        $featuredImageData = null;
                        if (!empty($product['featured_image'])) {
                            $mediaStmt = $pdo->prepare('SELECT alt_text, description FROM media_files WHERE file_path = ?');
                            $mediaStmt->execute([$product['featured_image']]);
                            $featuredImageData = $mediaStmt->fetch(PDO::FETCH_ASSOC);
                        }
                        
                        // Get media information for gallery images
                        $galleryImagesData = [];
                        if (!empty($product['gallery_images'])) {
                            $galleryImages = explode(',', $product['gallery_images']);
                            foreach ($galleryImages as $imageUrl) {
                                $imageUrl = trim($imageUrl);
                                if (!empty($imageUrl)) {
                                    $mediaStmt = $pdo->prepare('SELECT alt_text, description FROM media_files WHERE file_path = ?');
                                    $mediaStmt->execute([$imageUrl]);
                                    $mediaData = $mediaStmt->fetch(PDO::FETCH_ASSOC);
                                    $galleryImagesData[] = [
                                        'url' => $imageUrl,
                                        'alt_text' => $mediaData ? $mediaData['alt_text'] : '',
                                        'description' => $mediaData ? $mediaData['description'] : ''
                                    ];
                                }
                            }
                        }
                        
                        // Add media data to product
                        $product['featured_image_data'] = $featuredImageData;
                        $product['gallery_images_data'] = $galleryImagesData;
                        
                        // Convert ID to string to prevent precision loss in JSON
                        if (isset($product['ID'])) {
                            $product['ID'] = (string)$product['ID'];
                        }
                        
                        echo json_encode([
                            'status' => 'success',
                            'product' => $product
                        ]);
                    }
                } catch(PDOException $e) {
                    error_log('Database error in GET by slug: ' . $e->getMessage());
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
                $brands = isset($_GET['brands']) ? $_GET['brands'] : ''; // Multiple brands for CSV download
                $status = isset($_GET['status']) ? $_GET['status'] : '';
                $colour = isset($_GET['colour']) ? $_GET['colour'] : '';
                $finish = isset($_GET['finish']) ? $_GET['finish'] : '';
                $promo = isset($_GET['promo']) ? $_GET['promo'] : '';
                $productType = isset($_GET['product_type']) ? $_GET['product_type'] : '';
                $sortField = isset($_GET['sort_field']) ? $_GET['sort_field'] : '';
                $sortDirection = isset($_GET['sort_direction']) ? $_GET['sort_direction'] : 'asc';
                
                // Debug logging for filter parameters
                error_log('Filter parameters - page: ' . $page . ', limit: ' . $limit . ', search: ' . $search . ', category: ' . $category . ', brand: ' . $brand . ', brands: ' . $brands . ', status: ' . $status . ', colour: ' . $colour . ', finish: ' . $finish . ', promo: ' . $promo . ', product_type: ' . $productType . ', sort_field: ' . $sortField . ', sort_direction: ' . $sortDirection);
                
                // Calculate offset
                $offset = ($page - 1) * $limit;
                
                // Build WHERE clause
                $whereConditions = [];
                $params = [];
                
                if (!empty($search)) {
                    // Search in title, description, and SKU
                    // For SKU searches, also try exact match and case-insensitive match
                    $whereConditions[] = '(sp.title LIKE ? OR sp.description LIKE ? OR sp.sku = ? OR LOWER(sp.sku) = LOWER(?) OR sp.sku LIKE ? OR LOWER(sp.sku) LIKE ?)';
                    $params[] = '%' . $search . '%';
                    $params[] = '%' . $search . '%';
                    $params[] = $search; // Exact SKU match
                    $params[] = $search; // Case-insensitive exact SKU match
                    $params[] = '%' . $search . '%'; // SKU contains
                    $params[] = '%' . strtolower($search) . '%'; // Case-insensitive SKU contains
                }
                
                if (!empty($category) && $category !== 'all') {
                    $whereConditions[] = 'sp.product_category LIKE ?';
                    $params[] = '%' . $category . '%';
                    error_log('Category filter applied: ' . $category . ' (searching for products containing this category in product_category field)');
                }
                
                if (!empty($brand) && $brand !== 'all') {
                    $whereConditions[] = 'sp.`attribute:pa_brands` = ?';
                    $params[] = $brand;
                }
                
                // Handle multiple brands filter for CSV download
                if (!empty($brands)) {
                    $brandArray = explode(',', $brands);
                    $brandArray = array_map('trim', $brandArray);
                    $brandArray = array_filter($brandArray); // Remove empty values
                    
                    if (!empty($brandArray)) {
                        $placeholders = str_repeat('?,', count($brandArray) - 1) . '?';
                        $whereConditions[] = "sp.`attribute:pa_brands` IN ($placeholders)";
                        $params = array_merge($params, $brandArray);
                        error_log('Multiple brands filter applied: ' . implode(', ', $brandArray));
                    }
                }
                
                if (!empty($status) && $status !== 'all') {
                    $whereConditions[] = 'sp.status = ?';
                    $params[] = $status;
                }
                
                if (!empty($colour) && $colour !== 'all') {
                    $whereConditions[] = 'sp.`attribute:pa_colour` LIKE ?';
                    $params[] = '%' . $colour . '%';
                    error_log('Colour filter applied: ' . $colour . ' (searching for products containing this colour)');
                }
                
                if (!empty($finish) && $finish !== 'all') {
                    $whereConditions[] = 'sp.`attribute:pa_finish` LIKE ?';
                    $params[] = '%' . $finish . '%';
                    error_log('Finish filter applied: ' . $finish . ' (searching for products containing this finish)');
                }
                
                if (!empty($promo) && $promo !== 'all') {
                    $whereConditions[] = 'sp.promo LIKE ?';
                    $params[] = '%' . $promo . '%';
                    error_log('Promo filter applied: ' . $promo . ' (searching for products containing this promo)');
                }
                
                // Handle product type filter (multiple values allowed, comma-separated)
                if (!empty($productType)) {
                    $productTypeArray = explode(',', $productType);
                    $productTypeArray = array_map('trim', $productTypeArray);
                    $productTypeArray = array_filter($productTypeArray); // Remove empty values
                    
                    if (!empty($productTypeArray)) {
                        $productTypeConditions = [];
                        foreach ($productTypeArray as $type) {
                            $productTypeConditions[] = 'sp.product_category LIKE ?';
                            $params[] = '%' . $type . '%';
                        }
                        if (!empty($productTypeConditions)) {
                            $whereConditions[] = '(' . implode(' OR ', $productTypeConditions) . ')';
                            error_log('Product type filter applied: ' . implode(', ', $productTypeArray) . ' (searching for products containing these types in product_category)');
                        }
                    }
                }
                
                $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                // Build ORDER BY clause
                $orderByClause = 'ORDER BY sp.ID ASC'; // Default: indexed primary key sort
                $sortByIqPrice = false;
                if (!empty($sortField)) {
                    $validSortFields = ['id', 'title', 'brand', 'sku', 'price', 'iq_price', 'status'];
                    $validSortDirections = ['asc', 'desc'];
                    
                    if (in_array($sortField, $validSortFields) && in_array($sortDirection, $validSortDirections)) {
                        $direction = strtoupper($sortDirection);
                        switch ($sortField) {
                            case 'id':
                                $orderByClause = 'ORDER BY sp.ID ' . $direction;
                                break;
                            case 'title':
                                $orderByClause = 'ORDER BY sp.title ' . $direction;
                                break;
                            case 'brand':
                                $orderByClause = 'ORDER BY sp.`attribute:pa_brands` ' . $direction;
                                break;
                            case 'sku':
                                $orderByClause = 'ORDER BY sp.sku ' . $direction;
                                break;
                            case 'price':
                                $orderByClause = 'ORDER BY sp.regular_price ' . $direction;
                                break;
                            case 'iq_price':
                                $sortByIqPrice = true;
                                // NULL values (N/A) should appear first when ASC, last when DESC
                                if ($direction === 'ASC') {
                                    $orderByClause = 'ORDER BY ISNULL(iq.sellPInc1) ASC, iq.sellPInc1 ASC';
                                } else {
                                    $orderByClause = 'ORDER BY ISNULL(iq.sellPInc1) DESC, iq.sellPInc1 DESC';
                                }
                                break;
                            case 'status':
                                $orderByClause = 'ORDER BY sp.status ' . $direction;
                                break;
                        }
                    }
                }
                
                $whereParams = $params;
                $safeLimit = max(1, min((int)$limit, 10000));
                $safeOffset = max(0, (int)$offset);
                
                // Count without iq_table join — filters only touch stiles_products
                $countQuery = 'SELECT COUNT(*) as total FROM stiles_products sp ' . $whereClause;
                $countStmt = $pdo->prepare($countQuery);
                $countStmt->execute($whereParams);
                $totalCount = $countStmt->fetch()['total'];
                
                $iqSelect = 'iq.sellPInc1 as iq_price, iq.baseCost as iq_base_cost, iq.promoPrice as iq_promo_price, iq.onhand as iq_stock, iq.onPromotion as iq_on_promotion';
                
                if ($sortByIqPrice) {
                    // IQ price sort requires joining before ORDER BY / LIMIT
                    $query = 'SELECT sp.*, ' . $iqSelect . '
                             FROM stiles_products sp
                             LEFT JOIN iq_table iq ON sp.sku = iq.code '
                             . $whereClause . ' ' . $orderByClause
                             . ' LIMIT ' . $safeLimit . ' OFFSET ' . $safeOffset;
                    $stmt = $pdo->prepare($query);
                    $stmt->execute($whereParams);
                    $products = $stmt->fetchAll();
                } else {
                    // Paginate products first, then join IQ data only for the page (avoids full-table join)
                    $productQuery = 'SELECT sp.* FROM stiles_products sp '
                                    . $whereClause . ' ' . $orderByClause
                                    . ' LIMIT ' . $safeLimit . ' OFFSET ' . $safeOffset;
                    $stmt = $pdo->prepare($productQuery);
                    $stmt->execute($whereParams);
                    $products = $stmt->fetchAll();
                    
                    if (!empty($products)) {
                        $skus = [];
                        foreach ($products as $product) {
                            if (!empty($product['sku'])) {
                                $skus[$product['sku']] = true;
                            }
                        }
                        
                        if (!empty($skus)) {
                            $skuList = array_keys($skus);
                            $placeholders = implode(',', array_fill(0, count($skuList), '?'));
                            $iqStmt = $pdo->prepare(
                                'SELECT code, sellPInc1, baseCost, promoPrice, onhand, onPromotion
                                 FROM iq_table WHERE code IN (' . $placeholders . ')'
                            );
                            $iqStmt->execute($skuList);
                            $iqBySku = [];
                            while ($iqRow = $iqStmt->fetch(PDO::FETCH_ASSOC)) {
                                $iqBySku[$iqRow['code']] = $iqRow;
                            }
                            
                            foreach ($products as &$product) {
                                $sku = $product['sku'] ?? '';
                                if ($sku !== '' && isset($iqBySku[$sku])) {
                                    $iq = $iqBySku[$sku];
                                    $product['iq_price'] = $iq['sellPInc1'];
                                    $product['iq_base_cost'] = $iq['baseCost'];
                                    $product['iq_promo_price'] = $iq['promoPrice'];
                                    $product['iq_stock'] = $iq['onhand'];
                                    $product['iq_on_promotion'] = $iq['onPromotion'];
                                } else {
                                    $product['iq_price'] = null;
                                    $product['iq_base_cost'] = null;
                                    $product['iq_promo_price'] = null;
                                    $product['iq_stock'] = null;
                                    $product['iq_on_promotion'] = null;
                                }
                            }
                            unset($product);
                        } else {
                            foreach ($products as &$product) {
                                $product['iq_price'] = null;
                                $product['iq_base_cost'] = null;
                                $product['iq_promo_price'] = null;
                                $product['iq_stock'] = null;
                                $product['iq_on_promotion'] = null;
                            }
                            unset($product);
                        }
                    }
                }
                
                // Convert ID to string to prevent precision loss in JSON
                foreach ($products as &$product) {
                    if (isset($product['ID'])) {
                        $product['ID'] = (string)$product['ID'];
                    }
                }
                unset($product); // Break the reference
                
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
            // Handle both create and update operations
            if (!isset($data['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                exit();
            }
            
            // Check if this is an update operation (has ID and ID exists in database)
            $isUpdate = false;
            if (isset($data['id']) && !empty($data['id']) && $data['id'] != '0') {
                // First try exact match
                $checkStmt = $pdo->prepare('SELECT COUNT(*) as count FROM stiles_products sp WHERE sp.ID = ?');
                $checkStmt->execute([$data['id']]);
                $result = $checkStmt->fetch();
                $isUpdate = $result['count'] > 0;
                
                // If exact match fails, try to find a similar ID (for precision issues)
                if (!$isUpdate) {
                    // Convert to integer and search for IDs in a range around it
                    $idInt = (int)$data['id'];
                    $rangeStart = $idInt - 1000; // Look 1000 IDs before
                    $rangeEnd = $idInt + 1000;   // Look 1000 IDs after
                    
                    $rangeStmt = $pdo->prepare('SELECT ID FROM stiles_products WHERE ID BETWEEN ? AND ? ORDER BY ABS(ID - ?) LIMIT 1');
                    $rangeStmt->execute([$rangeStart, $rangeEnd, $idInt]);
                    $rangeResult = $rangeStmt->fetch();
                    
                    if ($rangeResult) {
                        // Found a similar ID, use that instead
                        $data['id'] = $rangeResult['ID'];
                        $isUpdate = true;
                        error_log('Found similar ID: ' . $rangeResult['ID'] . ' for requested ID: ' . $data['id']);
                    }
                }
                
                error_log('Product ID check: ID=' . $data['id'] . ', exists=' . ($isUpdate ? 'yes' : 'no'));
            }
            error_log('POST operation - isUpdate: ' . ($isUpdate ? 'true' : 'false') . ' (ID: ' . ($data['id'] ?? 'none') . ')');
            
            // If frontend sent an ID but it doesn't exist in database, treat as new product
            if (isset($data['id']) && !empty($data['id']) && $data['id'] != '0' && !$isUpdate) {
                error_log('Frontend sent ID ' . $data['id'] . ' but product does not exist in database. Treating as new product creation.');
                unset($data['id']); // Remove the non-existent ID
            }

            // For new products, check if SKU already exists to prevent duplicates
            if (!$isUpdate && !empty($data['sku'])) {
                error_log('Checking SKU for new product: ' . $data['sku']);
                $skuCheckStmt = $pdo->prepare('SELECT COUNT(*) as count FROM stiles_products WHERE sku = ?');
                $skuCheckStmt->execute([$data['sku']]);
                $skuResult = $skuCheckStmt->fetch();
                if ($skuResult['count'] > 0) {
                    error_log('SKU conflict detected for new product: ' . $data['sku']);
                    http_response_code(409);
                    echo json_encode([
                        'status' => 'error',
                        'message' => 'A product with this SKU already exists',
                        'error' => 'SKU_CONFLICT'
                    ], JSON_UNESCAPED_SLASHES);
                    exit();
                }
            } else if ($isUpdate && !empty($data['sku'])) {
                error_log('Skipping SKU check for update operation. Product ID: ' . $data['id']);
            }

            // Generate file URLs with proper format and unique timestamps to prevent conflicts
            $currentYear = date('Y');
            $currentMonth = date('m');
            $timestamp = time();
            $microtime = substr(microtime(), 2, 6); // Get microseconds for uniqueness
            $baseUrl = "https://stiles.co.za/images/{$currentYear}/{$currentMonth}/";

            // Process PDF URL
            $pdfUrl = '';
            if (!empty($data['pdf_url'])) {
                // If it's already a full URL (from MediaSelector), use as is
                if (strpos($data['pdf_url'], 'http') === 0) {
                    $pdfUrl = $data['pdf_url'];
                } else {
                    // It's just a filename, add the base URL
                    $pdfUrl = $baseUrl . $data['pdf_url'];
                }
            }

            // Process Featured Image URL
            $featuredImageUrl = '';
            if (!empty($data['featured_image'])) {
                // If it's already a full URL (from MediaSelector), use as is
                if (strpos($data['featured_image'], 'http') === 0) {
                    $featuredImageUrl = $data['featured_image'];
                } else {
                    // It's just a filename, add the base URL
                    $featuredImageUrl = $baseUrl . $data['featured_image'];
                }
            }

            // Process Gallery Images URLs
            $galleryImagesUrl = '';
            if (!empty($data['gallery_images'])) {
                // Split into individual URLs
                $galleryFiles = explode(', ', $data['gallery_images']);
                $galleryUrls = array_map(function($file) use ($baseUrl) {
                    $file = trim($file);
                    // Check if it's already a full URL (http:// or https://)
                    if (strpos($file, 'http://') === 0 || strpos($file, 'https://') === 0) {
                        // Already a full URL, use as is
                        return $file;
                    } else {
                        // It's just a filename, add the base URL
                        return $baseUrl . $file;
                    }
                }, $galleryFiles);
                $galleryImagesUrl = implode(', ', $galleryUrls);
            }

            // Start transaction to prevent race conditions
            $pdo->beginTransaction();
            
            try {
                if ($isUpdate) {
                    // Update existing product
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
                            `attribute:pa_space` = ?,
                            `meta:product_details` = ?,
                            pdf_url = ?,
                            featured_image = ?, 
                            gallery_images = ?,
                            youtube_video_url = ?,
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
                        $data['attribute:pa_space'] ?? '',
                        $data['meta:product_details'] ?? '',
                        $pdfUrl,
                        $featuredImageUrl,
                        $galleryImagesUrl,
                        $data['youtube_video_url'] ?? '',
                        $data['promo'] ?? '',
                        $data['id']
                    ]);

                    $pdo->commit();
                    $response = [
                        'status' => 'success',
                        'message' => 'Product updated successfully'
                    ];
                    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
                } else {
                    // Generate a unique ID using timestamp and random number to prevent conflicts
                    // Using a more stable approach to avoid precision issues
                    $timestamp = time(); // Use seconds since epoch for stability
                    $microseconds = (int)(microtime(true) * 1000000) % 1000000; // Get microseconds part
                    $random = mt_rand(100, 999);
                    $newId = $timestamp . $microseconds . $random;
                    
                    // Ensure the ID is unique by checking if it exists
                    $idCheckStmt = $pdo->prepare('SELECT COUNT(*) as count FROM stiles_products WHERE ID = ?');
                    $idCheckStmt->execute([$newId]);
                    $idResult = $idCheckStmt->fetch();
                    
                    // If ID exists, generate a new one
                    while ($idResult['count'] > 0) {
                        $newId = $timestamp . mt_rand(1000, 9999);
                        $idCheckStmt->execute([$newId]);
                        $idResult = $idCheckStmt->fetch();
                    }
                    
                    // Create new product with generated ID
                    $stmt = $pdo->prepare('
                        INSERT INTO stiles_products (
                            ID, title, slug, description, status, post_date, sku, stock, 
                            regular_price, sale_price, metadesc, product_category, product_tag,
                            `attribute:pa_brands`, `attribute:pa_colour`, `attribute:pa_finish`, 
                            `attribute:pa_size`, `attribute:pa_space`, `meta:product_details`, pdf_url, featured_image, 
                            gallery_images, youtube_video_url, promo
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ');
                    
                    $stmt->execute([
                        $newId,
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
                        $data['attribute:pa_space'] ?? '',
                        $data['meta:product_details'] ?? '',
                        $pdfUrl,
                        $featuredImageUrl,
                        $galleryImagesUrl,
                        $data['youtube_video_url'] ?? '',
                        $data['promo'] ?? ''
                    ]);

                    $pdo->commit();

                    $response = [
                        'status' => 'success',
                        'message' => 'Product created successfully',
                        'product_id' => (string)$newId
                    ];
                    echo json_encode($response, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
                }
            } catch(PDOException $e) {
                // Rollback transaction on error
                $pdo->rollBack();
                error_log('Database error in POST: ' . $e->getMessage());
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
            error_log('DELETE request received. Data: ' . print_r($data, true));
            error_log('DELETE request method: ' . $_SERVER['REQUEST_METHOD']);
            error_log('DELETE request URI: ' . $_SERVER['REQUEST_URI']);
            
            if (!isset($data['id'])) {
                error_log('DELETE request missing ID. Available data: ' . print_r($data, true));
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
