<?php
// Ensure no output before headers
ob_start();

require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Check for JSON decode errors
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data']);
    exit();
}

// Validate required fields
if (!isset($data['email']) || empty($data['email'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email is required']);
    exit();
}

// Validate email format
if (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid email format']);
    exit();
}

try {
    // Check if user exists and is active
    $stmt = $pdo->prepare('SELECT id, first_name, last_name, email FROM users WHERE email = ? AND is_active = TRUE');
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();

    if (!$user) {
        // Don't reveal if email exists or not for security
        http_response_code(200);
        echo json_encode(['message' => 'If an account with that email exists, a password reset link has been sent']);
        exit();
    }

    // Generate reset token
    $reset_token = bin2hex(random_bytes(32));
    $reset_token_expires = date('Y-m-d H:i:s', strtotime('+1 hour'));

    // Store reset token in database
    $stmt = $pdo->prepare('UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?');
    $stmt->execute([$reset_token, $reset_token_expires, $user['id']]);

    // Create reset link
    $reset_link = 'https://staging.stiles.co.za/reset-password?token=' . $reset_token;

    // Send email
    $to = $user['email'];
    $subject = 'Password Reset Request - Stiles';
    
    $message = '
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #1a1a1a; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .button { display: inline-block; background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello ' . htmlspecialchars($user['first_name']) . ',</p>
                <p>We received a request to reset your password for your Stiles account.</p>
                <p>Click the button below to reset your password:</p>
                <p style="text-align: center;">
                    <a href="' . $reset_link . '" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p>' . $reset_link . '</p>
                <p><strong>This link will expire in 1 hour.</strong></p>
                <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
                <p>Best regards,<br>The Stiles Team</p>
            </div>
            <div class="footer">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </div>
    </body>
    </html>';

    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: Stiles Store <noreply@stiles.co.za>',
        'Reply-To: support@stiles.co.za',
        'X-Mailer: PHP/' . phpversion()
    );

    $mail_sent = mail($to, $subject, $message, implode("\r\n", $headers));

    if (!$mail_sent) {
        error_log('Failed to send password reset email to: ' . $to);
        http_response_code(500);
        echo json_encode(['error' => 'Failed to send reset email']);
        exit();
    }

    // Clear any output buffers
    ob_end_clean();

    // Return success response (don't reveal if email exists)
    http_response_code(200);
    echo json_encode(['message' => 'If an account with that email exists, a password reset link has been sent']);

} catch (PDOException $e) {
    error_log('Forgot password error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'An error occurred while processing your request']);
}

// Ensure all output is sent
ob_end_flush();
?> 