<?php
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
    // Get user_id from query parameter
    $userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if (!$userId) {
        http_response_code(400);
        echo json_encode(['error' => 'User ID is required']);
        exit();
    }

    error_log('Fetching orders for user ID: ' . $userId);

    // Get all orders for the specific user
    $stmt = $pdo->prepare("
        SELECT o.* 
        FROM orders o
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    ");
    $stmt->execute([$userId]);
    $orders = $stmt->fetchAll();

    error_log('Number of orders found: ' . count($orders));
    if (count($orders) > 0) {
        error_log('First order data: ' . print_r($orders[0], true));
    }

    // Process the orders to format the items
    $formattedOrders = [];
    foreach ($orders as $order) {
        // Get items for this order
        $itemStmt = $pdo->prepare("
            SELECT id, name, image, price, quantity
            FROM order_items
            WHERE order_id = ?
        ");
        $itemStmt->execute([$order['id']]);
        $items = $itemStmt->fetchAll();
        
        // Format the shipping address
        $order['shippingAddress'] = [
            'street' => $order['shipping_address_street'],
            'city' => $order['shipping_address_city'],
            'state' => $order['shipping_address_state'],
            'postalCode' => $order['shipping_address_postal_code']
        ];

        // Remove the raw address fields
        unset($order['shipping_address_street']);
        unset($order['shipping_address_city']);
        unset($order['shipping_address_state']);
        unset($order['shipping_address_postal_code']);

        // Add items to the order
        $order['items'] = $items;
        $formattedOrders[] = $order;
    }

    echo json_encode([
        'success' => true,
        'orders' => $formattedOrders
    ]);

} catch (PDOException $e) {
    error_log('Failed to fetch orders: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch orders']);
}
?> 