<?php
require_once 'config.php';
require_once 'sendOrderEmail.php';

// Test SMTP configuration
function testSMTPConnection() {
    echo "<h2>SMTP Configuration Test</h2>";
    echo "<p><strong>SMTP Host:</strong> " . SMTP_HOST . "</p>";
    echo "<p><strong>SMTP Port:</strong> " . SMTP_PORT . "</p>";
    echo "<p><strong>SMTP Security:</strong> " . SMTP_SECURE . "</p>";
    echo "<p><strong>From Email:</strong> " . SMTP_FROM_EMAIL . "</p>";
    echo "<p><strong>From Name:</strong> " . SMTP_FROM_NAME . "</p>";
    
    // Test connection
    $smtpHost = SMTP_HOST;
    $smtpPort = SMTP_PORT;
    $secure = SMTP_SECURE;
    
    echo "<h3>Testing Connection...</h3>";
    
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
        echo "<p style='color: red;'><strong>Connection Failed:</strong> $errstr ($errno)</p>";
        return false;
    }
    
    echo "<p style='color: green;'><strong>Connection Successful!</strong></p>";
    
    // Read server greeting
    $response = fgets($socket, 515);
    echo "<p><strong>Server Greeting:</strong> " . trim($response) . "</p>";
    
    // Test STARTTLS if configured
    if ($secure === 'tls') {
        echo "<h4>Testing STARTTLS...</h4>";
        
        // Send EHLO
        fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $response = fgets($socket, 515);
        echo "<p><strong>EHLO Response:</strong> " . trim($response) . "</p>";
        
        // Handle multi-line responses
        while (substr($response, 3, 1) === '-') {
            $response = fgets($socket, 515);
            echo "<p><strong>EHLO Continuation:</strong> " . trim($response) . "</p>";
        }
        
        // Try STARTTLS
        fputs($socket, "STARTTLS\r\n");
        $response = fgets($socket, 515);
        echo "<p><strong>STARTTLS Response:</strong> " . trim($response) . "</p>";
        
        if (substr($response, 0, 3) === '220') {
            echo "<p style='color: green;'><strong>STARTTLS Supported!</strong></p>";
        } else {
            echo "<p style='color: orange;'><strong>STARTTLS Not Supported:</strong> " . trim($response) . "</p>";
        }
    }
    
    fclose($socket);
    return true;
}

// Test email sending
function testEmailSending() {
    echo "<h3>Testing Email Sending...</h3>";
    
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
    
    $testEmail = isset($_GET['test_email']) ? $_GET['test_email'] : 'cpadillam5@gmail.com'; // Use provided email or default
    
    $result = sendOrderEmail($testOrderData, $testEmail);
    
    if ($result) {
        echo "<p style='color: green;'><strong>Email Test Successful!</strong></p>";
    } else {
        echo "<p style='color: red;'><strong>Email Test Failed!</strong> Check error logs for details.</p>";
    }
    
    return $result;
}

// Run tests
if (isset($_GET['test'])) {
    echo "<html><body>";
    echo "<h1>SMTP Email Test</h1>";
    
    $connectionTest = testSMTPConnection();
    
    if ($connectionTest && isset($_GET['send_email'])) {
        testEmailSending();
    }
    
    echo "<hr>";
    echo "<p><a href='?test=1&send_email=1'>Test Connection and Send Email</a></p>";
    echo "<p><a href='?test=1'>Test Connection Only</a></p>";
    echo "<p><a href='?test=1&send_email=1&test_email=cpadillam5@gmail.com'>Send Test Email to cpadillam5@gmail.com</a></p>";
    
    echo "</body></html>";
    exit;
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>SMTP Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .warning { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .info { background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; margin: 20px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <h1>SMTP Configuration Setup</h1>
    
    <div class="warning">
        <h3>⚠️ Important: Update SMTP Settings</h3>
        <p>Before testing, please update the SMTP configuration in <code>config.php</code>:</p>
        <ul>
            <li><strong>SMTP_HOST:</strong> Your SMTP server (e.g., smtp.gmail.com, smtp.outlook.com)</li>
            <li><strong>SMTP_USERNAME:</strong> Your email address</li>
            <li><strong>SMTP_PASSWORD:</strong> Your email password or app password</li>
            <li><strong>SMTP_PORT:</strong> Usually 587 for TLS, 465 for SSL, or 25 for no encryption</li>
        </ul>
    </div>
    
    <div class="info">
        <h3>📧 Popular SMTP Settings</h3>
        <p><strong>Gmail:</strong> smtp.gmail.com:587 (TLS) - Use App Password</p>
        <p><strong>Outlook/Hotmail:</strong> smtp-mail.outlook.com:587 (TLS)</p>
        <p><strong>Yahoo:</strong> smtp.mail.yahoo.com:587 (TLS)</p>
        <p><strong>Custom Server:</strong> Check with your hosting provider</p>
    </div>
    
    <h2>Test Your Configuration</h2>
    <p><a href="?test=1">Test SMTP Connection</a></p>
    <p><a href="?test=1&send_email=1">Test Connection and Send Email</a></p>
    
    <h3>Quick Test Form</h3>
    <form method="GET" action="">
        <input type="hidden" name="test" value="1">
        <input type="hidden" name="send_email" value="1">
        <label for="test_email">Test Email Address:</label>
        <input type="email" name="test_email" id="test_email" value="cpadillam5@gmail.com" style="width: 250px; padding: 5px; margin: 5px;">
        <button type="submit" style="padding: 5px 15px;">Send Test Email</button>
    </form>
    
    <h2>Current Configuration</h2>
    <p><strong>SMTP Host:</strong> <?php echo defined('SMTP_HOST') ? SMTP_HOST : 'Not set'; ?></p>
    <p><strong>SMTP Port:</strong> <?php echo defined('SMTP_PORT') ? SMTP_PORT : 'Not set'; ?></p>
    <p><strong>SMTP Security:</strong> <?php echo defined('SMTP_SECURE') ? SMTP_SECURE : 'Not set'; ?></p>
    <p><strong>From Email:</strong> <?php echo defined('SMTP_FROM_EMAIL') ? SMTP_FROM_EMAIL : 'Not set'; ?></p>
</body>
</html> 