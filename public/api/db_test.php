<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
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

    // Test query
    $stmt = $pdo->query('SELECT COUNT(*) as count FROM stiles_products');
    $result = $stmt->fetch();

    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection successful',
        'database_info' => [
            'total_products' => $result['count'],
            'server_version' => $pdo->getAttribute(PDO::ATTR_SERVER_VERSION),
            'connection_status' => $pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS)
        ]
    ]);

} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}
?> 