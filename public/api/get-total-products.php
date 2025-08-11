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
    // Get total count of published products
    $stmt = $pdo->prepare('SELECT COUNT(*) as total_products FROM stiles_products WHERE status = "publish"');
    $stmt->execute();
    $result = $stmt->fetch();

    // Get additional statistics if requested
    $includeStats = isset($_GET['include_stats']) && $_GET['include_stats'] === 'true';
    
    $response = [
        'status' => 'success',
        'message' => 'Total products retrieved successfully',
        'data' => [
            'total_products' => (int)$result['total_products']
        ]
    ];

    // Include additional statistics if requested
    if ($includeStats) {
        // Get total products (including all statuses)
        $stmt = $pdo->prepare('SELECT COUNT(*) as total_all_products FROM stiles_products');
        $stmt->execute();
        $totalAll = $stmt->fetch();

        // Get published products
        $stmt = $pdo->prepare('SELECT COUNT(*) as published_products FROM stiles_products WHERE status = "publish"');
        $stmt->execute();
        $publishedProducts = $stmt->fetch();

        // Get draft products
        $stmt = $pdo->prepare('SELECT COUNT(*) as draft_products FROM stiles_products WHERE status = "draft"');
        $stmt->execute();
        $draftProducts = $stmt->fetch();

        // Get products by category (top 5 categories)
        $stmt = $pdo->prepare('
            SELECT product_category, COUNT(*) as count 
            FROM stiles_products 
            WHERE status = "publish" 
            GROUP BY product_category 
            ORDER BY count DESC 
            LIMIT 5
        ');
        $stmt->execute();
        $categoryStats = $stmt->fetchAll();

        $response['data']['statistics'] = [
            'total_all_products' => (int)$totalAll['total_all_products'],
            'published_products' => (int)$publishedProducts['published_products'],
            'draft_products' => (int)$draftProducts['draft_products'],
            'category_breakdown' => $categoryStats
        ];
    }

    // Clear any output buffers
    ob_end_clean();

    // Return success response
    http_response_code(200);
    echo json_encode($response);

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
        'message' => 'An error occurred while retrieving product count',
        'error' => 'Internal server error'
    ]);
}
?>
