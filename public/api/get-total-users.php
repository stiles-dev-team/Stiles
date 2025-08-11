<?php
// Ensure no output before headers
ob_start();

require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Get total count of users
    $stmt = $pdo->prepare('SELECT COUNT(*) as total_users FROM users WHERE is_active = TRUE');
    $stmt->execute();
    $result = $stmt->fetch();

    // Get additional statistics if requested
    $includeStats = isset($_GET['include_stats']) && $_GET['include_stats'] === 'true';
    
    $response = [
        'status' => 'success',
        'message' => 'Total users retrieved successfully',
        'data' => [
            'total_users' => (int)$result['total_users']
        ]
    ];

    // Include additional statistics if requested
    if ($includeStats) {
        // Get total users (including inactive)
        $stmt = $pdo->prepare('SELECT COUNT(*) as total_all_users FROM users');
        $stmt->execute();
        $totalAll = $stmt->fetch();

        // Get active users
        $stmt = $pdo->prepare('SELECT COUNT(*) as active_users FROM users WHERE is_active = TRUE');
        $stmt->execute();
        $activeUsers = $stmt->fetch();

        // Get admin users
        $stmt = $pdo->prepare('SELECT COUNT(*) as admin_users FROM users WHERE is_admin = 1 AND is_active = TRUE');
        $stmt->execute();
        $adminUsers = $stmt->fetch();

        // Get users registered this month
        $stmt = $pdo->prepare('SELECT COUNT(*) as new_users_this_month FROM users WHERE created_at >= DATE_FORMAT(NOW(), "%Y-%m-01")');
        $stmt->execute();
        $newThisMonth = $stmt->fetch();

        $response['data']['statistics'] = [
            'total_all_users' => (int)$totalAll['total_all_users'],
            'active_users' => (int)$activeUsers['active_users'],
            'admin_users' => (int)$adminUsers['admin_users'],
            'new_users_this_month' => (int)$newThisMonth['new_users_this_month']
        ];
    }

    // Clear any output buffers
    ob_end_clean();

    // Return success response
    http_response_code(200);
    echo json_encode($response);

} catch(PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error occurred',
        'error' => 'Database connection failed'
    ]);
} catch(Exception $e) {
    error_log('General error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'An error occurred while retrieving user count',
        'error' => 'Internal server error'
    ]);
}
?>
