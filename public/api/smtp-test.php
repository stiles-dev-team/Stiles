<?php
require_once 'config.php';
require_once 'sendOrderEmail.php';

// Set content type to HTML
header('Content-Type: text/html; charset=utf-8');

echo '<!DOCTYPE html>
<html>
<head>
    <title>SMTP Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .error { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .info { color: #0c5460; background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .warning { color: #856404; background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; }
        .config-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .config-table td { padding: 8px; border: 1px solid #ddd; }
        .config-table td:first-child { font-weight: bold; background-color: #f8f9fa; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 SMTP Configuration Test Results</h1>';

// Display current configuration
echo '<div class="test-section">
    <h2>📋 Current Configuration</h2>
    <table class="config-table">
        <tr><td>SMTP Host</td><td>' . SMTP_HOST . '</td></tr>
        <tr><td>SMTP Port</td><td>' . SMTP_PORT . '</td></tr>
        <tr><td>SMTP Security</td><td>' . SMTP_SECURE . '</td></tr>
        <tr><td>SMTP Username</td><td>' . SMTP_USERNAME . '</td></tr>
        <tr><td>From Email</td><td>' . SMTP_FROM_EMAIL . '</td></tr>
        <tr><td>From Name</td><td>' . SMTP_FROM_NAME . '</td></tr>
    </table>
</div>';

// Test 1: Basic Connection
echo '<div class="test-section">
    <h2>🔌 Test 1: Basic Connection</h2>';

$smtpHost = SMTP_HOST;
$smtpPort = SMTP_PORT;
$secure = SMTP_SECURE;

$context = stream_context_create();
$socket = @stream_socket_client(
    'tcp://' . $smtpHost . ':' . $smtpPort,
    $errno,
    $errstr,
    10,
    STREAM_CLIENT_CONNECT,
    $context
);

if (!$socket) {
    echo '<div class="error">❌ Connection Failed: ' . $errstr . ' (' . $errno . ')</div>';
    $connectionOk = false;
} else {
    echo '<div class="success">✅ Connection Successful!</div>';
    $connectionOk = true;
    
    // Read server greeting
    $response = fgets($socket, 515);
    echo '<div class="info">📨 Server Greeting: ' . trim($response) . '</div>';
    
    // Test STARTTLS if configured
    if ($secure === 'tls') {
        echo '<h3>🔒 Testing STARTTLS...</h3>';
        
        // Send EHLO
        fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $response = fgets($socket, 515);
        echo '<div class="info">📤 EHLO Response: ' . trim($response) . '</div>';
        
        // Handle multi-line responses
        while (substr($response, 3, 1) === '-') {
            $response = fgets($socket, 515);
            echo '<div class="info">📤 EHLO Continuation: ' . trim($response) . '</div>';
        }
        
        // Try STARTTLS
        fputs($socket, "STARTTLS\r\n");
        $response = fgets($socket, 515);
        echo '<div class="info">🔒 STARTTLS Response: ' . trim($response) . '</div>';
        
        if (substr($response, 0, 3) === '220') {
            echo '<div class="success">✅ STARTTLS Supported!</div>';
        } else {
            echo '<div class="warning">⚠️ STARTTLS Not Supported: ' . trim($response) . '</div>';
        }
    }
    
    fclose($socket);
}

echo '</div>';

// Test 2: Email Sending (if connection was successful)
if ($connectionOk) {
    echo '<div class="test-section">
        <h2>📧 Test 2: Email Sending</h2>';
    
    $testOrderData = array(
        'id' => 'TEST-' . time(),
        'created_at' => date('Y-m-d H:i:s'),
        'total' => 999.99,
        'shippingAddress' => array(
            'street' => '123 Test Street',
            'city' => 'Test City',
            'state' => 'Test State',
            'postalCode' => '12345'
        ),
        'items' => array(
            array(
                'name' => 'Test Product',
                'quantity' => 1,
                'price' => 999.99
            )
        )
    );
    
    $testEmail = 'cpadillam5@gmail.com';
    
    echo '<div class="info">📤 Attempting to send test email to: ' . $testEmail . '</div>';
    
    $result = sendOrderEmail($testOrderData, $testEmail);
    
    if ($result) {
        echo '<div class="success">✅ Email Test Successful!</div>';
        echo '<div class="info">📋 Test Order ID: ' . $testOrderData['id'] . '</div>';
    } else {
        echo '<div class="error">❌ Email Test Failed!</div>';
        echo '<div class="warning">💡 Check your server error logs for detailed information.</div>';
    }
    
    echo '</div>';
} else {
    echo '<div class="test-section">
        <h2>📧 Test 2: Email Sending</h2>
        <div class="warning">⚠️ Skipped - Basic connection failed</div>
    </div>';
}

// Summary
echo '<div class="test-section">
    <h2>📊 Test Summary</h2>';

if ($connectionOk) {
    echo '<div class="success">✅ SMTP Connection: PASSED</div>';
    if (isset($result) && $result) {
        echo '<div class="success">✅ Email Sending: PASSED</div>';
        echo '<div class="info">🎉 Your SMTP configuration is working correctly!</div>';
    } else {
        echo '<div class="error">❌ Email Sending: FAILED</div>';
        echo '<div class="warning">🔧 Check your SMTP credentials and server logs.</div>';
    }
} else {
    echo '<div class="error">❌ SMTP Connection: FAILED</div>';
    echo '<div class="warning">🔧 Check your SMTP host, port, and network connectivity.</div>';
}

echo '</div>';

// Troubleshooting tips
echo '<div class="test-section">
    <h2>🔧 Troubleshooting Tips</h2>
    <ul>
        <li><strong>Connection Failed:</strong> Check SMTP host, port, and firewall settings</li>
        <li><strong>Authentication Failed:</strong> Verify username/password and enable "Less secure apps" if needed</li>
        <li><strong>STARTTLS Issues:</strong> Ensure port 587 is used for TLS encryption</li>
        <li><strong>Office 365:</strong> Make sure the account has SMTP permissions enabled</li>
    </ul>
</div>';

echo '</div></body></html>';
?> 