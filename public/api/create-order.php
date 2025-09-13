<?php
// Configure error logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');
error_reporting(E_ALL);

require_once 'config.php';
require_once 'sendOrderEmail.php';

// Log the start of the request
error_log('=== New Order Request ===');
error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Request URI: ' . $_SERVER['REQUEST_URI']);
error_log('Remote Address: ' . $_SERVER['REMOTE_ADDR']);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    error_log('Handling OPTIONS request');
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get the request body
    $data = json_decode(file_get_contents('php://input'), true);
    
    // Log received data
    error_log('Received order data: ' . print_r($data, true));

    // Validate required fields
    $requiredFields = [
        'firstName', 'lastName', 'email', 'phone', 'streetAddress',
        'city', 'state', 'zipCode', 'items', 'total', 'userId'
    ];

    foreach ($requiredFields as $field) {
        if (!isset($data[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit();
        }
    }

    // Start transaction
    $pdo->beginTransaction();

    // Insert order
    $orderSql = "
        INSERT INTO orders (
            user_id, total, status, payment_method,
            shipping_address_street, shipping_address_city,
            shipping_address_state, shipping_address_postal_code,
            shipping_first_name, shipping_last_name,
            shipping_company, shipping_phone, shipping_email,
            shipping_store_location, order_notes,
            created_at
        ) VALUES (?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ";
    
    error_log('Order SQL: ' . $orderSql);
    error_log('Order params: ' . print_r([
        $data['userId'],
        $data['total'],
        $data['paymentMethod'] ?? 'Standard',
        $data['streetAddress'],
        $data['city'],
        $data['state'],
        $data['zipCode'],
        $data['firstName'],
        $data['lastName'],
        $data['companyName'] ?? '',
        $data['phone'],
        $data['email'],
        $data['storeLocation'] ?? '',
        $data['orderNotes'] ?? ''
    ], true));

    $stmt = $pdo->prepare($orderSql);
    $stmt->execute([
        $data['userId'],
        $data['total'],
        $data['paymentMethod'] ?? 'Standard',
        $data['streetAddress'],
        $data['city'],
        $data['state'],
        $data['zipCode'],
        $data['firstName'],
        $data['lastName'],
        $data['companyName'] ?? '',
        $data['phone'],
        $data['email'],
        $data['storeLocation'] ?? '',
        $data['orderNotes'] ?? ''
    ]);

    $orderId = $pdo->lastInsertId();
    error_log('Created order ID: ' . $orderId);

    // Insert order items
    $itemSql = "
        INSERT INTO order_items (
            order_id, product_id, name, image,
            price, quantity, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    ";
    
    error_log('Items SQL: ' . $itemSql);

    $stmt = $pdo->prepare($itemSql);

    foreach ($data['items'] as $item) {
        // Log the full item data for debugging
        error_log('Processing item: ' . print_r($item, true));
        
        // Get product ID from any possible field
        $productId = $item['id'] ?? $item['product_id'] ?? $item['_id'] ?? null;
        
        // If no product ID found, try to extract it from SKU
        if (!$productId && isset($item['sku'])) {
            $skuParts = explode('-', $item['sku']);
            if (!empty($skuParts)) {
                $productId = intval($skuParts[0]);
                error_log('Extracted product ID from SKU: ' . $productId);
            }
        }
        
        if (!$productId) {
            error_log('Missing product ID in item: ' . print_r($item, true));
            continue;
        }

        // Get title from either title or name field
        $title = $item['title'] ?? $item['name'] ?? '';
        if (!$title) {
            error_log('Missing title/name in item: ' . print_r($item, true));
            continue;
        }

        // Get price from either regular_price or price field
        $price = $item['regular_price'] ?? $item['price'] ?? 0;
        if ($price <= 0) {
            error_log('Invalid price in item: ' . print_r($item, true));
            continue;
        }

        // Get quantity with default of 1
        $quantity = $item['quantity'] ?? 1;

        // Get image URL if available
        $imageUrl = '';
        if (isset($item['images']) && is_array($item['images']) && !empty($item['images'])) {
            $imageUrl = $item['images'][0]['url'] ?? '';
        }

        $itemParams = [
            $orderId,
            $productId,
            $title,
            $imageUrl,
            $price,
            $quantity
        ];
        
        error_log('Item params: ' . print_r($itemParams, true));
        
        try {
            $stmt->execute($itemParams);
            error_log('Successfully inserted item');
        } catch (PDOException $e) {
            error_log('Error inserting item: ' . $e->getMessage());
            error_log('Item data: ' . print_r($item, true));
            throw $e;
        }
    }

    // Commit transaction
    $pdo->commit();
    error_log('Transaction committed successfully');

    // Prepare order data for email
    $orderData = [
        'id' => $orderId,
        'created_at' => date('Y-m-d H:i:s'),
        'total' => $data['total'],
        'shippingAddress' => [
            'street' => $data['streetAddress'],
            'city' => $data['city'],
            'state' => $data['state'],
            'postalCode' => $data['zipCode'],
            'firstName' => $data['firstName'],
            'lastName' => $data['lastName'],
            'companyName' => $data['companyName'] ?? '',
            'email' => $data['email'],
            'phone' => $data['phone'],
            'orderNotes' => $data['orderNotes'] ?? ''
        ],
        'items' => array_map(function($item) {
            return [
                'name' => $item['title'] ?? $item['name'] ?? '',
                'quantity' => $item['quantity'] ?? 1,
                'price' => $item['regular_price'] ?? $item['price'] ?? 0
            ];
        }, $data['items'])
    ];

    // Send order confirmation email to customer
    error_log('Attempting to send order confirmation email to customer: ' . $data['email']);
    $customerEmailResult = sendOrderEmail($orderData, $data['email']);
    error_log('Customer email send result: ' . ($customerEmailResult ? 'Success' : 'Failed'));

    // Send order notification email to websales
    error_log('Attempting to send order notification email to websales');
    $websalesEmailResult = sendOrderEmail($orderData, 'websales@stiles.co.za');
    error_log('Websales email send result: ' . ($websalesEmailResult ? 'Success' : 'Failed'));

    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Order created successfully',
        'orderId' => $orderId
    ]);

} catch (PDOException $e) {
    // Rollback transaction on error
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    error_log('Order creation failed: ' . $e->getMessage());
    error_log('SQL State: ' . $e->getCode());
    error_log('Error Info: ' . print_r($e->errorInfo, true));
    http_response_code(500);
    echo json_encode(['error' => 'Failed to create order: ' . $e->getMessage()]);
}
?> 