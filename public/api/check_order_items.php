<?php
require_once 'config.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Check if order_items table exists
    $stmt = $pdo->prepare("SHOW TABLES LIKE 'order_items'");
    $stmt->execute();
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode([
            'error' => 'order_items table does not exist',
            'tables' => $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN)
        ]);
        exit();
    }
    
    // Check table structure
    $stmt = $pdo->prepare("DESCRIBE order_items");
    $stmt->execute();
    $structure = $stmt->fetchAll();
    
    // Count total items
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM order_items");
    $stmt->execute();
    $totalItems = $stmt->fetch()['total'];
    
    // Get sample items
    $stmt = $pdo->prepare("SELECT * FROM order_items LIMIT 5");
    $stmt->execute();
    $sampleItems = $stmt->fetchAll();
    
    // Get orders with items count
    $stmt = $pdo->prepare("
        SELECT o.id, o.shipping_first_name, o.shipping_last_name, COUNT(oi.id) as item_count
        FROM orders o
        LEFT JOIN order_items oi ON o.id = oi.order_id
        GROUP BY o.id
        ORDER BY o.created_at DESC
        LIMIT 10
    ");
    $stmt->execute();
    $ordersWithItemCount = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'table_exists' => $tableExists,
        'structure' => $structure,
        'total_items' => $totalItems,
        'sample_items' => $sampleItems,
        'orders_with_item_count' => $ordersWithItemCount
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
