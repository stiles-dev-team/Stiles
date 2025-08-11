<?php
require_once 'config.php';

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Create brands table
    $brandsTableSQL = "
    CREATE TABLE IF NOT EXISTS brands (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        description TEXT NULL,
        slug VARCHAR(255) NULL,
        image VARCHAR(255) NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $pdo->exec($brandsTableSQL);

    echo json_encode(['success' => true, 'message' => 'Brands table created/verified successfully.']);

} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred', 'details' => $e->getMessage()]);
}
?>
