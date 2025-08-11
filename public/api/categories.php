<?php
// Ensure no output before headers
ob_start();

require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get unique categories from products
    $stmt = $pdo->prepare('
        SELECT DISTINCT product_category as name, COUNT(*) as count
        FROM stiles_products 
        WHERE product_category IS NOT NULL AND product_category != ""
        GROUP BY product_category 
        ORDER BY count DESC
    ');
    $stmt->execute();
    $categories = $stmt->fetchAll();

    // Add an "Uncategorized" option
    $uncategorizedCount = $pdo->query('
        SELECT COUNT(*) as count 
        FROM stiles_products 
        WHERE product_category IS NULL OR product_category = ""
    ')->fetch()['count'];

    if ($uncategorizedCount > 0) {
        array_unshift($categories, [
            'name' => 'Uncategorized',
            'count' => $uncategorizedCount
        ]);
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Categories retrieved successfully',
        'categories' => $categories
    ]);

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
        'message' => 'An error occurred while retrieving categories',
        'error' => 'Internal server error'
    ]);
}
?>
