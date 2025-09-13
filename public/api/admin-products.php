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
                $brands = isset($_GET['brands']) ? $_GET['brands'] : ''; // Multiple brands for CSV download
                $status = isset($_GET['status']) ? $_GET['status'] : '';
                $colour = isset($_GET['colour']) ? $_GET['colour'] : '';
                $finish = isset($_GET['finish']) ? $_GET['finish'] : '';
                
                // Debug logging for filter parameters
                error_log('Filter parameters - page: ' . $page . ', limit: ' . $limit . ', search: ' . $search . ', category: ' . $category . ', brand: ' . $brand . ', brands: ' . $brands . ', status: ' . $status . ', colour: ' . $colour . ', finish: ' . $finish);
                
                // Calculate offset
                $offset = ($page - 1) * $limit;
                
                // Build WHERE clause
                $whereConditions = [];
                $params = [];
                
                if (!empty($search)) {
                    $whereConditions[] = '(sp.title LIKE ? OR sp.description LIKE ?)';
                    $params[] = '%' . $search . '%';
                    $params[] = '%' . $search . '%';
                }
                
                if (!empty($category) && $category !== 'all') {
                    $whereConditions[] = 'sp.product_category = ?';
                    $params[] = $category;
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
                
                $whereClause = !empty($whereConditions) ? 'WHERE ' . implode(' AND ', $whereConditions) : '';
                
                // Debug logging for WHERE clause
                error_log('WHERE clause: ' . $whereClause);
                error_log('Parameters: ' . print_r($params, true));
                
                // Get total count
                $countQuery = 'SELECT COUNT(*) as total FROM stiles_products sp LEFT JOIN iq_table iq ON sp.sku = iq.code ' . $whereClause;
                $countStmt = $pdo->prepare($countQuery);
                $countStmt->execute($params);
                $totalCount = $countStmt->fetch()['total'];
                
                // Get paginated products with price from iq_table
                $query = 'SELECT sp.*, iq.sellPInc1 as iq_price, iq.baseCost as iq_base_cost, iq.promoPrice as iq_promo_price, iq.onhand as iq_stock, iq.onPromotion as iq_on_promotion 
                         FROM stiles_products sp 
                         LEFT JOIN iq_table iq ON sp.sku = iq.code ' . $whereClause . ' ORDER BY sp.post_date DESC LIMIT ? OFFSET ?';
                $params[] = $limit;
                $params[] = $offset;
                
                // Debug logging for final query
                error_log('Final query: ' . $query);
                error_log('Final parameters: ' . print_r($params, true));
                error_log('Joining stiles_products with iq_table on sku=code to get price information');
                
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
            // Handle both create and update operations
            if (!isset($data['title'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Title is required']);
                exit();
            }
            
            // Check if this is an update operation (has ID and ID exists in database)
            $isUpdate = false;
            if (isset($data['id']) && !empty($data['id'])) {
                // Check if the product with this ID actually exists in the database
                $checkStmt = $pdo->prepare('SELECT COUNT(*) as count FROM stiles_products sp WHERE sp.ID = ?');
                $checkStmt->execute([$data['id']]);
                $result = $checkStmt->fetch();
                $isUpdate = $result['count'] > 0;
            }
            error_log('POST operation - isUpdate: ' . ($isUpdate ? 'true' : 'false') . ' (ID: ' . ($data['id'] ?? 'none') . ')');

            // Generate file URLs with proper format
            $currentYear = date('Y');
            $currentMonth = date('m');
            $baseUrl = "https://stiles.co.za/images/{$currentYear}/{$currentMonth}/";

            // Process PDF URL
            $pdfUrl = '';
            if (!empty($data['pdf_url'])) {
                // Check if the URL already contains the base path to avoid duplication
                $baseUrlPattern = 'https://stiles.co.za/images/' . $currentYear . '/' . $currentMonth . '/';
                
                if (strpos($data['pdf_url'], $baseUrlPattern) === 0) {
                    // URL already has the correct base path, use as is
                    $pdfUrl = $data['pdf_url'];
                } elseif (strpos($data['pdf_url'], 'http') === 0) {
                    // It's a full URL but with a different base, use as is
                    $pdfUrl = $data['pdf_url'];
                } else {
                    // It's just a filename, add the base URL
                    $pdfUrl = $baseUrl . $data['pdf_url'];
                }
            }

            // Process Featured Image URL
            $featuredImageUrl = '';
            if (!empty($data['featured_image'])) {
                // Check if the URL already contains the base path to avoid duplication
                $baseUrlPattern = 'https://stiles.co.za/images/' . $currentYear . '/' . $currentMonth . '/';
                
                if (strpos($data['featured_image'], $baseUrlPattern) === 0) {
                    // URL already has the correct base path, use as is
                    $featuredImageUrl = $data['featured_image'];
                } elseif (strpos($data['featured_image'], 'http') === 0) {
                    // It's a full URL but with a different base, use as is
                    $featuredImageUrl = $data['featured_image'];
                } else {
                    // It's just a filename, add the base URL
                    $featuredImageUrl = $baseUrl . $data['featured_image'];
                }
            }

            // Process Gallery Images URLs
            $galleryImagesUrl = '';
            if (!empty($data['gallery_images'])) {
                // Check if the URLs already contain the base path to avoid duplication
                $baseUrlPattern = 'https://stiles.co.za/images/' . $currentYear . '/' . $currentMonth . '/';
                
                if (str_contains($data['gallery_images'], $baseUrlPattern)) {
                    // URLs already have the correct base path, use as is
                    $galleryImagesUrl = $data['gallery_images'];
                } elseif (str_contains($data['gallery_images'], 'https://')) {
                    // It contains full URLs but with a different base, use as is
                    $galleryImagesUrl = $data['gallery_images'];
                } else {
                    // If they're just filenames, add the base URL
                    $galleryFiles = explode(', ', $data['gallery_images']);
                    $galleryUrls = array_map(function($file) use ($baseUrl) {
                        return $baseUrl . trim($file);
                    }, $galleryFiles);
                    $galleryImagesUrl = implode(', ', $galleryUrls);
                }
            }

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
                } else {
                    // Create new product
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
                }
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
