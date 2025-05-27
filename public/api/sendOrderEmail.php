<?php
require_once 'config.php';

function sendOrderEmail($orderData, $recipientEmail) {
    // Debug log
    error_log('Attempting to send email to: ' . $recipientEmail);
    error_log('Order data: ' . print_r($orderData, true));

    // Email headers
    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Stiles Store <noreply@stiles.co.za>',
        'Reply-To: support@stiles.co.za',
        'Bcc: cpadillam5@gmail.com',
        'X-Mailer: PHP/' . phpversion()
    );

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
            .item { border-bottom: 1px solid #eee; padding: 10px 0; }
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
                <h2>Order #' . $orderData['id'] . '</h2>
                <p><strong>Order Date:</strong> ' . date('F j, Y', strtotime($orderData['created_at'])) . '</p>
                
                <h3>Shipping Address</h3>
                <p>
                    ' . $orderData['shippingAddress']['street'] . '<br>
                    ' . $orderData['shippingAddress']['city'] . ', ' . $orderData['shippingAddress']['state'] . '<br>
                    ' . $orderData['shippingAddress']['postalCode'] . '
                </p>

                <h3>Order Items</h3>';

    foreach ($orderData['items'] as $item) {
        $htmlBody .= '
                <div class="item">
                    <p><strong>' . htmlspecialchars($item['name']) . '</strong></p>
                    <p>Quantity: ' . $item['quantity'] . '</p>
                    <p>Price: R' . number_format($item['price'], 2) . '</p>
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

    // Email subject
    $subject = 'Order Confirmation - Order #' . $orderData['id'];

    // Debug log
    error_log('Email headers: ' . print_r($headers, true));
    error_log('Email subject: ' . $subject);

    // Send email
    $mailSent = mail($recipientEmail, $subject, $htmlBody, implode("\r\n", $headers));

    // Debug log
    error_log('Mail send result: ' . ($mailSent ? 'Success' : 'Failed'));

    if (!$mailSent) {
        error_log('Failed to send order confirmation email to: ' . $recipientEmail);
        return false;
    }

    return true;
}
?> 