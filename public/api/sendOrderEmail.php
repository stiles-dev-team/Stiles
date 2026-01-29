<?php
require_once 'config.php';

/**
 * Send email via SMTP using PHP sockets with STARTTLS support
 * Optimized for Office 365 SMTP
 */
function sendSMTPEmail($to, $subject, $htmlBody, $headers = array()) {
    $smtpHost = SMTP_HOST;
    $smtpPort = SMTP_PORT;
    $username = SMTP_USERNAME;
    $password = SMTP_PASSWORD;
    $secure = SMTP_SECURE;
    
    // Create socket connection (always start with TCP for STARTTLS)
    // For TLS connections, use hostname to avoid certificate verification issues
    // For non-TLS, try IP first to avoid IPv6 binding issues
    if ($secure === 'tls') {
        // Use hostname for TLS to ensure certificate verification works
        $connectHost = $smtpHost;
    } else {
        // Force IPv4 resolution to avoid IPv6 binding issues for non-TLS
        $ipv4 = gethostbyname($smtpHost);
        if ($ipv4 === $smtpHost) {
            // DNS resolution failed, try original hostname
            $connectHost = $smtpHost;
        } else {
            // Use resolved IPv4 address
            $connectHost = $ipv4;
        }
    }
    
    // Create context with socket options
    $context = stream_context_create([
        'socket' => [
            'tcp_nodelay' => true,
        ]
    ]);
    
    // Try connection with resolved IP
    $socket = @stream_socket_client(
        'tcp://' . $connectHost . ':' . $smtpPort,
        $errno,
        $errstr,
        30,
        STREAM_CLIENT_CONNECT,
        $context
    );
    
    // If connection fails with error 99, try without context (let system choose binding)
    if (!$socket && $errno === 99) {
        error_log("SMTP Connection failed with bind error, trying without explicit context...");
        $socket = @stream_socket_client(
            'tcp://' . $connectHost . ':' . $smtpPort,
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT
        );
    }
    
    // Last resort: try with hostname instead of IP
    if (!$socket && $errno === 99) {
        error_log("SMTP Connection failed with IP, trying with hostname...");
        $socket = @stream_socket_client(
            'tcp://' . $smtpHost . ':' . $smtpPort,
            $errno,
            $errstr,
            30,
            STREAM_CLIENT_CONNECT
        );
    }
    
    if (!$socket) {
        error_log("SMTP Connection failed: $errstr ($errno)");
        error_log("SMTP Host: $smtpHost, Connect Host: $connectHost, Port: $smtpPort");
        return false;
    }
    
    // Read server greeting
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '220') {
        error_log("SMTP Error: $response");
        fclose($socket);
        return false;
    }
    
    // Send EHLO
    fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
    $response = fgets($socket, 515);
    
    // Handle multi-line responses for EHLO
    while (substr($response, 3, 1) === '-') {
        $response = fgets($socket, 515);
    }
    
    // Start TLS if required (STARTTLS)
    if ($secure === 'tls') {
        fputs($socket, "STARTTLS\r\n");
        $response = fgets($socket, 515);
        if (substr($response, 0, 3) !== '220') {
            error_log("SMTP STARTTLS failed: $response");
            fclose($socket);
            return false;
        }
        
        // Enable crypto with specific TLS options for Office 365
        // Certificate verification will work since we connected using hostname
        $cryptoOptions = STREAM_CRYPTO_METHOD_TLS_CLIENT;
        if (!stream_socket_enable_crypto($socket, true, $cryptoOptions)) {
            error_log("SMTP TLS negotiation failed");
            fclose($socket);
            return false;
        }
        
        // Send EHLO again after TLS (required for Office 365)
        fputs($socket, "EHLO " . $_SERVER['SERVER_NAME'] . "\r\n");
        $response = fgets($socket, 515);
        
        // Handle multi-line responses for EHLO after TLS
        while (substr($response, 3, 1) === '-') {
            $response = fgets($socket, 515);
        }
    }
    
    // Authenticate
    fputs($socket, "AUTH LOGIN\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '334') {
        error_log("SMTP AUTH failed: $response");
        fclose($socket);
        return false;
    }
    
    fputs($socket, base64_encode($username) . "\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '334') {
        error_log("SMTP Username failed: $response");
        fclose($socket);
        return false;
    }
    
    fputs($socket, base64_encode($password) . "\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '235') {
        error_log("SMTP Password failed: $response");
        fclose($socket);
        return false;
    }
    
    // Send MAIL FROM
    fputs($socket, "MAIL FROM: <" . SMTP_FROM_EMAIL . ">\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '250') {
        error_log("SMTP MAIL FROM failed: $response");
        fclose($socket);
        return false;
    }
    
    // Send RCPT TO
    fputs($socket, "RCPT TO: <$to>\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '250') {
        error_log("SMTP RCPT TO failed: $response");
        fclose($socket);
        return false;
    }
    
    // Send DATA
    fputs($socket, "DATA\r\n");
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '354') {
        error_log("SMTP DATA failed: $response");
        fclose($socket);
        return false;
    }
    
    // Prepare email content
    $emailContent = "From: " . SMTP_FROM_NAME . " <" . SMTP_FROM_EMAIL . ">\r\n";
    $emailContent .= "To: $to\r\n";
    $emailContent .= "Subject: $subject\r\n";
    $emailContent .= "Reply-To: " . SMTP_REPLY_TO . "\r\n";
    $emailContent .= "Bcc: " . SMTP_BCC . "\r\n";
    $emailContent .= "MIME-Version: 1.0\r\n";
    $emailContent .= "Content-Type: text/html; charset=" . EMAIL_CHARSET . "\r\n";
    $emailContent .= "Content-Transfer-Encoding: " . EMAIL_ENCODING . "\r\n";
    $emailContent .= "X-Mailer: PHP/" . phpversion() . "\r\n";
    $emailContent .= "\r\n";
    $emailContent .= $htmlBody . "\r\n";
    $emailContent .= ".\r\n";
    
    // Send email content
    fputs($socket, $emailContent);
    $response = fgets($socket, 515);
    if (substr($response, 0, 3) !== '250') {
        error_log("SMTP Send failed: $response");
        fclose($socket);
        return false;
    }
    
    // Quit
    fputs($socket, "QUIT\r\n");
    fclose($socket);
    
    return true;
}

function sendOrderEmail($orderData, $recipientEmail) {
    // Debug log
    error_log('Attempting to send email to: ' . $recipientEmail);
    error_log('Order data: ' . print_r($orderData, true));

    // Create HTML email body
    $htmlBody = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .order-details { background-color: #f9f9f9; padding: 20px; margin: 20px 0; }
            .item { border-bottom: 1px solid #eee; padding: 4px 0; }
            .total { text-align: right; font-weight: bold; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Order Confirmation</h1>
                <p>Thank you for your order!</p>
            </div>
            
            <div class="order-details">
                <h2>Order #' . htmlspecialchars($orderData['id'], ENT_QUOTES, 'UTF-8') . '</h2>
                <p>Your order has been requested, a style consultant will be in touch with you shortly. For queries, send us a mail at <a href="mailto:websales@stiles.co.za">websales@stiles.co.za</a></p>
                <p><strong>Order Date:</strong> ' . htmlspecialchars(date('F j, Y', strtotime($orderData['created_at'])), ENT_QUOTES, 'UTF-8') . '</p>
                <p><strong>First Name:</strong> ' . htmlspecialchars($orderData['shippingAddress']['firstName'], ENT_QUOTES, 'UTF-8') . '</p>
                <p><strong>Last Name:</strong> ' . htmlspecialchars($orderData['shippingAddress']['lastName'], ENT_QUOTES, 'UTF-8') . '</p>
                <p><strong>Company Name:</strong> ' . htmlspecialchars($orderData['shippingAddress']['companyName'], ENT_QUOTES, 'UTF-8') . '</p>
                <p><strong>Email:</strong> ' . htmlspecialchars($orderData['shippingAddress']['email'], ENT_QUOTES, 'UTF-8') . '</p>
                <p><strong>Phone:</strong> ' . htmlspecialchars($orderData['shippingAddress']['phone'], ENT_QUOTES, 'UTF-8') . '</p>
                <p><strong>Order Notes:</strong> ' . htmlspecialchars($orderData['shippingAddress']['orderNotes'], ENT_QUOTES, 'UTF-8') . '</p>
                <h3>Shipping Address</h3>
                <p>
                    ' . htmlspecialchars($orderData['shippingAddress']['street'], ENT_QUOTES, 'UTF-8') . '<br>
                    ' . htmlspecialchars($orderData['shippingAddress']['city'], ENT_QUOTES, 'UTF-8') . ', ' . htmlspecialchars($orderData['shippingAddress']['state'], ENT_QUOTES, 'UTF-8') . '<br>
                    ' . htmlspecialchars($orderData['shippingAddress']['postalCode'], ENT_QUOTES, 'UTF-8') . '
                </p>

                <h3 style="margin-bottom: 0px;">Order Items</h3>';

    foreach ($orderData['items'] as $item) {
        $htmlBody .= '
                <div class="item">
                    <p><strong>' . htmlspecialchars($item['name'], ENT_QUOTES, 'UTF-8') . '</strong></p>
                    ' . (!empty($item['sku']) ? '<p>SKU: ' . htmlspecialchars($item['sku'], ENT_QUOTES, 'UTF-8') . '</p>' : '') . '
                    <p>Quantity: ' . htmlspecialchars($item['quantity'], ENT_QUOTES, 'UTF-8') . '</p>
                    <p>Price: R' . htmlspecialchars(number_format($item['price'], 2), ENT_QUOTES, 'UTF-8') . '</p>
                </div>';
    }

    $htmlBody .= '
                <div class="total">
                    <p>Total: R' . number_format($orderData['total'], 2) . '</p>
                </div>
            </div>

            <div class="footer">
                <p>Thank you for shopping with Stiles!</p>
                <p>If you have any questions, please contact our support team.</p>
            </div>
        </div>
    </body>
    </html>';

    // Email subject (escape special characters for email headers)
    $subject = 'Order Confirmation - Order #' . htmlspecialchars($orderData['id'], ENT_QUOTES, 'UTF-8');

    // Debug log
    error_log('Email subject: ' . $subject);

    // Send email via SMTP
    $mailSent = sendSMTPEmail($recipientEmail, $subject, $htmlBody);

    // Debug log
    error_log('SMTP mail send result: ' . ($mailSent ? 'Success' : 'Failed'));

    if (!$mailSent) {
        error_log('Failed to send order confirmation email to: ' . $recipientEmail);
        return false;
    }

    return true;
}
?> 