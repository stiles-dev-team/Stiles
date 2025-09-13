<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

// Database configuration
require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database connection failed']);
    exit;
}

// Check if file was uploaded
if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No CSV file uploaded or upload error']);
    exit;
}

$csvFile = $_FILES['csv_file']['tmp_name'];
$fileName = $_FILES['csv_file']['name'];

// Validate file extension
if (!preg_match('/\.csv$/i', $fileName)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid file type. Only CSV files are allowed']);
    exit;
}

// Custom function to parse CSV with tilde separator
function parseTildeCSV($line) {
    $result = [];
    $current = '';
    $inQuotes = false;
    $i = 0;
    
    while ($i < strlen($line)) {
        $char = $line[$i];
        
        if ($char === '"') {
            if ($inQuotes && $i + 1 < strlen($line) && $line[$i + 1] === '"') {
                // Escaped quote
                $current .= '"';
                $i += 2;
            } else {
                // Toggle quote state
                $inQuotes = !$inQuotes;
                $i++;
            }
        } elseif ($char === '~' && !$inQuotes) {
            // Tilde - field separator
            $result[] = trim($current);
            $current = '';
            $i++;
        } else {
            $current .= $char;
            $i++;
        }
    }
    
    // Add the last field
    $result[] = trim($current);
    
    return $result;
}

// Read CSV file
if (($handle = fopen($csvFile, "r")) === FALSE) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to read CSV file']);
    exit;
}

// Read headers with tilde separator
$headerLine = fgets($handle);
if (!$headerLine) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid CSV format - no headers found']);
    fclose($handle);
    exit;
}

// Debug: Log the raw header line
error_log('Raw header line: ' . json_encode($headerLine));

$headers = parseTildeCSV(trim($headerLine));

// Remove BOM (Byte Order Mark) from first header if present
if (!empty($headers[0])) {
    $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]); // Remove UTF-8 BOM
    $headers[0] = trim($headers[0]);
}

// Debug: Log the received headers
error_log('Received headers: ' . json_encode($headers));

// Expected headers mapping
$expectedHeaders = [
    'ID', 'Title', 'Slug', 'Description', 'Status', 'Post Date', 'SKU', 'Stock',
    'Regular Price', 'Sale Price', 'Meta Description', 'Product Category', 'Product Tag',
    'Brand', 'Colour', 'Finish', 'Size', 'Product Details', 'PDF URL', 'Featured Image',
    'Gallery Images', 'Promo'
];

// Validate headers (case-insensitive and trim whitespace)
$headerMap = [];
foreach ($expectedHeaders as $expectedHeader) {
    $found = false;
    foreach ($headers as $index => $header) {
        $cleanHeader = trim($header);
        if (strcasecmp($cleanHeader, $expectedHeader) === 0) {
            $headerMap[$expectedHeader] = $index;
            $found = true;
            break;
        }
    }
    if (!$found) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Missing required header: $expectedHeader. Received headers: " . implode(', ', $headers)]);
        fclose($handle);
        exit;
    }
}

$updated = 0;
$inserted = 0;
$errors = [];

// Begin transaction
$pdo->beginTransaction();

try {
    // Prepare statements for stiles_products table
    $updateStmt = $pdo->prepare("
        UPDATE stiles_products SET 
            title = ?, slug = ?, description = ?, status = ?, post_date = ?, sku = ?, stock = ?,
            regular_price = ?, sale_price = ?, metadesc = ?, product_category = ?, product_tag = ?,
            `attribute:pa_brands` = ?, `attribute:pa_colour` = ?, `attribute:pa_finish` = ?,
            `attribute:pa_size` = ?, `meta:product_details` = ?, pdf_url = ?, featured_image = ?,
            gallery_images = ?, promo = ?
        WHERE ID = ?
    ");
    
    $insertStmt = $pdo->prepare("
        INSERT INTO stiles_products (
            ID, title, slug, description, status, post_date, sku, stock, regular_price, sale_price,
            metadesc, product_category, product_tag, `attribute:pa_brands`, `attribute:pa_colour`,
            `attribute:pa_finish`, `attribute:pa_size`, `meta:product_details`, pdf_url,
            featured_image, gallery_images, promo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $checkSkuStmt = $pdo->prepare("
        SELECT ID FROM stiles_products WHERE sku = ?
    ");

    // Process each row with tilde separator
    $rowNumber = 1; // Start from 1 since we already read headers
    while (($line = fgets($handle)) !== FALSE) {
        $row = parseTildeCSV(trim($line));
        $rowNumber++;
        
        try {
            // Extract data from row
            $id = trim($row[$headerMap['ID']] ?? '');
            $title = trim($row[$headerMap['Title']] ?? '');
            $slug = trim($row[$headerMap['Slug']] ?? '');
            $description = trim($row[$headerMap['Description']] ?? '');
            $status = trim($row[$headerMap['Status']] ?? 'publish');
            $postDate = trim($row[$headerMap['Post Date']] ?? '');
            $sku = trim($row[$headerMap['SKU']] ?? '');
            $stock = trim($row[$headerMap['Stock']] ?? '0');
            $regularPrice = trim($row[$headerMap['Regular Price']] ?? '0');
            $salePrice = trim($row[$headerMap['Sale Price']] ?? '0');
            $metaDesc = trim($row[$headerMap['Meta Description']] ?? '');
            $productCategory = trim($row[$headerMap['Product Category']] ?? '');
            $productTag = trim($row[$headerMap['Product Tag']] ?? '');
            $brand = trim($row[$headerMap['Brand']] ?? '');
            $colour = trim($row[$headerMap['Colour']] ?? '');
            $finish = trim($row[$headerMap['Finish']] ?? '');
            $size = trim($row[$headerMap['Size']] ?? '');
            $productDetails = trim($row[$headerMap['Product Details']] ?? '');
            $pdfUrl = trim($row[$headerMap['PDF URL']] ?? '');
            $featuredImage = trim($row[$headerMap['Featured Image']] ?? '');
            $galleryImages = trim($row[$headerMap['Gallery Images']] ?? '');
            $promo = trim($row[$headerMap['Promo']] ?? '');

            // Validate required fields
            if (empty($title) || empty($sku)) {
                $errors[] = "Row $rowNumber: Title and SKU are required";
                continue;
            }

            // Check if product exists by SKU
            $checkSkuStmt->execute([$sku]);
            $existingProduct = $checkSkuStmt->fetch(PDO::FETCH_ASSOC);

            if ($existingProduct) {
                // Update existing product
                $productId = $existingProduct['ID'];
                
                $updateStmt->execute([
                    $title,
                    $slug ?: sanitize_title($title),
                    $description,
                    $status,
                    $postDate ?: date('Y-m-d H:i:s'),
                    $sku,
                    $stock,
                    $regularPrice,
                    $salePrice,
                    $metaDesc,
                    $productCategory,
                    $productTag,
                    $brand,
                    $colour,
                    $finish,
                    $size,
                    $productDetails,
                    $pdfUrl,
                    $featuredImage,
                    $galleryImages,
                    $promo,
                    $productId
                ]);

                $updated++;
            } else {
                // Insert new product
                $insertStmt->execute([
                    $id ?: null,
                    $title,
                    $slug ?: sanitize_title($title),
                    $description,
                    $status,
                    $postDate ?: date('Y-m-d H:i:s'),
                    $sku,
                    $stock,
                    $regularPrice,
                    $salePrice,
                    $metaDesc,
                    $productCategory,
                    $productTag,
                    $brand,
                    $colour,
                    $finish,
                    $size,
                    $productDetails,
                    $pdfUrl,
                    $featuredImage,
                    $galleryImages,
                    $promo
                ]);

                $inserted++;
            }

        } catch (Exception $e) {
            $errors[] = "Row $rowNumber: " . $e->getMessage();
        }
    }

    // Commit transaction
    $pdo->commit();

    fclose($handle);

    // Return success response
    echo json_encode([
        'status' => 'success',
        'message' => 'CSV processed successfully',
        'updated' => $updated,
        'inserted' => $inserted,
        'errors' => $errors
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    fclose($handle);
    
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}

// Helper function to sanitize title for slug
function sanitize_title($title) {
    $title = strtolower($title);
    $title = preg_replace('/[^a-z0-9\s-]/', '', $title);
    $title = preg_replace('/[\s-]+/', '-', $title);
    $title = trim($title, '-');
    return $title;
}
?>
