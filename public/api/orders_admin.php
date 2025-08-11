<?php
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            error_log('Fetching orders for admin');

            // Get all orders for the specific user
            $stmt = $pdo->prepare("
                SELECT *
                FROM orders
                ORDER BY created_at DESC
            ");
            $stmt->execute();
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
                
                // Debug: Log items found for this order
                error_log('Order ID: ' . $order['id'] . ' - Items found: ' . count($items));
                if (count($items) > 0) {
                    error_log('First item data: ' . print_r($items[0], true));
                }
                
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
            break;

        case 'PUT':
            // Update order status
            if (!isset($data['order_id']) || !isset($data['status'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Order ID and status are required']);
                exit();
            }

            $orderId = $data['order_id'];
            $newStatus = $data['status'];

            // Validate status
            $validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
            if (!in_array($newStatus, $validStatuses)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid status']);
                exit();
            }

            // Update the order status
            $updateStmt = $pdo->prepare("
                UPDATE orders 
                SET status = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $result = $updateStmt->execute([$newStatus, $orderId]);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Order status updated successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update order status']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?> 