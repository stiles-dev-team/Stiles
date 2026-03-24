<?php
// Disable error display in production
error_reporting(0);
ini_set('display_errors', 0);

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

// Database configuration
$host = 'dedi397.cpt4.host-h.net';
$dbname = 'stileucwjz_db_ws';
$username = 'stileucwjz_3';
$password = 'by8uVbZJ8y7mAcstcuC8';

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
            PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
        ]
    );
} catch(PDOException $e) {
    error_log('Connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit();
}

// SMTP Configuration
define('SMTP_HOST', 'smtp.office365.com'); // Change to your SMTP server
define('SMTP_PORT', 587); // Common ports: 25, 465 (SSL), 587 (TLS)
define('SMTP_USERNAME', 'no-reply@stiles.co.za'); // Your SMTP username
define('SMTP_PASSWORD', 'wyGL158nhW'); // Your SMTP password
define('SMTP_SECURE', 'tls'); // 'ssl', 'tls', or '' for no encryption
define('SMTP_FROM_EMAIL', 'no-reply@stiles.co.za');
define('SMTP_FROM_NAME', 'Stiles No-Reply');
define('SMTP_REPLY_TO', 'support@stiles.co.za');
define('SMTP_BCC', 'cpadillam5@gmail.com');

// Email configuration
define('EMAIL_CHARSET', 'UTF-8');
define('EMAIL_ENCODING', '8bit');
?> 