<?php
// Configure error logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');
error_reporting(E_ALL);

require_once 'config.php';
require_once 'sendFunkyQuoteEmailConfig.php';

// Log the start of the request
error_log('=== New Funky Order Request ===');
error_log('Request Method: ' . $_SERVER['REQUEST_METHOD']);
error_log('Request URI: ' . $_SERVER['REQUEST_URI']);
error_log('Remote Address: ' . $_SERVER['REMOTE_ADDR']);

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log('Invalid request method: ' . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data) || empty($data['email']) || !filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'A valid email is required']);
        exit();
    }

    $orderData = $data['orderData'] ?? $data;
    $orderId = $data['orderId'] ?? null;

    // Send order confirmation email to customer
    error_log('Attempting to send order confirmation email to customer: ' . $data['email']);
    $customerEmailResult = sendFunkyQuoteEmail($orderData, $data['email']);
    error_log('Customer email send result: ' . ($customerEmailResult ? 'Success' : 'Failed'));

    // Send order notification email to websales
    error_log('Attempting to send order notification email to websales');
    $websalesEmailResult = sendFunkyQuoteEmail($orderData, 'websales@stiles.co.za');
    error_log('Websales email send result: ' . ($websalesEmailResult ? 'Success' : 'Failed'));

    if ($customerEmailResult !== true || $websalesEmailResult !== true) {
        error_log('Quote email was not sent');
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send order email']);
        exit();
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Quote emails sent',
        'orderId' => $orderId
    ]);
} catch (Exception $e) {
    error_log('Funky order email failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to send order email']);
}
