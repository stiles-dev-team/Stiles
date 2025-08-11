<?php
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $timeRange = isset($_GET['timeRange']) ? (int)$_GET['timeRange'] : 30;
        
        // Calculate date range
        $endDate = date('Y-m-d H:i:s');
        $startDate = date('Y-m-d H:i:s', strtotime("-{$timeRange} days"));
        
        // Get total revenue from orders
        $revenueStmt = $pdo->prepare("
            SELECT SUM(total) as total_revenue
            FROM orders 
            WHERE created_at >= ? AND created_at <= ?
        ");
        $revenueStmt->execute([$startDate, $endDate]);
        $totalRevenue = $revenueStmt->fetch()['total_revenue'] ?? 0;
        
        // Get total orders
        $ordersStmt = $pdo->prepare("
            SELECT COUNT(*) as total_orders
            FROM orders 
            WHERE created_at >= ? AND created_at <= ?
        ");
        $ordersStmt->execute([$startDate, $endDate]);
        $totalOrders = $ordersStmt->fetch()['total_orders'] ?? 0;
        
        // Get total products
        $productsStmt = $pdo->prepare("
            SELECT COUNT(*) as total_products
            FROM stiles_products 
            WHERE status = 'publish'
        ");
        $productsStmt->execute();
        $totalProducts = $productsStmt->fetch()['total_products'] ?? 0;
        
        // Get total customers
        $customersStmt = $pdo->prepare("
            SELECT COUNT(*) as total_customers
            FROM users 
            WHERE is_active = 1
        ");
        $customersStmt->execute();
        $totalCustomers = $customersStmt->fetch()['total_customers'] ?? 0;
        
        // Get new customers in time range
        $newCustomersStmt = $pdo->prepare("
            SELECT COUNT(*) as new_customers
            FROM users 
            WHERE created_at >= ? AND created_at <= ? AND is_active = 1
        ");
        $newCustomersStmt->execute([$startDate, $endDate]);
        $newCustomers = $newCustomersStmt->fetch()['new_customers'] ?? 0;
        
        // Get monthly revenue data for the selected time range
        $monthlyRevenueStmt = $pdo->prepare("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                SUM(total) as revenue
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        ");
        $monthlyRevenueStmt->execute([$timeRange]);
        $monthlyRevenueData = $monthlyRevenueStmt->fetchAll();
        
        // Format monthly revenue data
        $monthlyRevenue = [];
        foreach ($monthlyRevenueData as $row) {
            $monthName = date('M', strtotime($row['month'] . '-01'));
            $monthlyRevenue[] = [
                'month' => $monthName,
                'value' => (float)$row['revenue']
            ];
        }
        
        // Get monthly orders data for the selected time range
        $monthlyOrdersStmt = $pdo->prepare("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as orders
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
            ORDER BY month ASC
        ");
        $monthlyOrdersStmt->execute([$timeRange]);
        $monthlyOrdersData = $monthlyOrdersStmt->fetchAll();
        
        // Format monthly orders data
        $monthlyOrders = [];
        foreach ($monthlyOrdersData as $row) {
            $monthName = date('M', strtotime($row['month'] . '-01'));
            $monthlyOrders[] = [
                'month' => $monthName,
                'value' => (int)$row['orders']
            ];
        }
        
        // Get products by brand
        $brandsStmt = $pdo->prepare("
            SELECT 
                `attribute:pa_brands` as brand,
                COUNT(*) as count
            FROM stiles_products 
            WHERE status = 'publish' AND `attribute:pa_brands` IS NOT NULL AND `attribute:pa_brands` != ''
            GROUP BY `attribute:pa_brands`
            ORDER BY count DESC
            LIMIT 10
        ");
        $brandsStmt->execute();
        $brandsData = $brandsStmt->fetchAll();
        
        // Format brands data
        $brands = [];
        foreach ($brandsData as $row) {
            $brands[] = [
                'name' => $row['brand'],
                'count' => (int)$row['count']
            ];
        }
        
        // Get products by colour
        $coloursStmt = $pdo->prepare("
            SELECT 
                `attribute:pa_colour` as colour,
                COUNT(*) as count
            FROM stiles_products 
            WHERE status = 'publish' AND `attribute:pa_colour` IS NOT NULL AND `attribute:pa_colour` != ''
            GROUP BY `attribute:pa_colour`
            ORDER BY count DESC
            LIMIT 10
        ");
        $coloursStmt->execute();
        $coloursData = $coloursStmt->fetchAll();
        
        // Format colours data
        $colours = [];
        foreach ($coloursData as $row) {
            $colours[] = [
                'name' => $row['colour'],
                'count' => (int)$row['count']
            ];
        }
        
        // Get products by finish
        $finishesStmt = $pdo->prepare("
            SELECT 
                `attribute:pa_finish` as finish,
                COUNT(*) as count
            FROM stiles_products 
            WHERE status = 'publish' AND `attribute:pa_finish` IS NOT NULL AND `attribute:pa_finish` != ''
            GROUP BY `attribute:pa_finish`
            ORDER BY count DESC
            LIMIT 10
        ");
        $finishesStmt->execute();
        $finishesData = $finishesStmt->fetchAll();
        
        // Format finishes data
        $finishes = [];
        foreach ($finishesData as $row) {
            $finishes[] = [
                'name' => $row['finish'],
                'count' => (int)$row['count']
            ];
        }
        
        // Get products by size
        $sizesStmt = $pdo->prepare("
            SELECT 
                `attribute:pa_size` as size,
                COUNT(*) as count
            FROM stiles_products 
            WHERE status = 'publish' AND `attribute:pa_size` IS NOT NULL AND `attribute:pa_size` != ''
            GROUP BY `attribute:pa_size`
            ORDER BY count DESC
            LIMIT 10
        ");
        $sizesStmt->execute();
        $sizesData = $sizesStmt->fetchAll();
        
        // Format sizes data
        $sizes = [];
        foreach ($sizesData as $row) {
            $sizes[] = [
                'name' => $row['size'],
                'count' => (int)$row['count']
            ];
        }
        
        // Get recent activity
        $recentActivityStmt = $pdo->prepare("
            (SELECT 
                'order' as type,
                CONCAT('New order #', id, ' received') as message,
                created_at as time,
                'bg-green-500' as color
            FROM orders 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY created_at DESC
            LIMIT 3)
            UNION ALL
            (SELECT 
                'user' as type,
                CONCAT('New customer registered') as message,
                created_at as time,
                'bg-blue-500' as color
            FROM users 
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND is_active = 1
            ORDER BY created_at DESC
            LIMIT 2)
            ORDER BY time DESC
            LIMIT 5
        ");
        $recentActivityStmt->execute();
        $recentActivityData = $recentActivityStmt->fetchAll();
        
        // Format recent activity data
        $recentActivity = [];
        foreach ($recentActivityData as $row) {
            $timeAgo = '';
            $timeDiff = time() - strtotime($row['time']);
            
            if ($timeDiff < 60) {
                $timeAgo = $timeDiff . ' seconds ago';
            } elseif ($timeDiff < 3600) {
                $timeAgo = floor($timeDiff / 60) . ' minutes ago';
            } elseif ($timeDiff < 86400) {
                $timeAgo = floor($timeDiff / 3600) . ' hours ago';
            } else {
                $timeAgo = floor($timeDiff / 86400) . ' days ago';
            }
            
            $recentActivity[] = [
                'message' => $row['message'],
                'time' => $timeAgo,
                'color' => $row['color']
            ];
        }
        
        // Calculate growth percentages (mock for now - you can implement real calculations)
        $revenueGrowth = $totalRevenue > 0 ? 12.5 : 0;
        $ordersGrowth = $totalOrders > 0 ? 8.3 : 0;
        $customersGrowth = $totalCustomers > 0 ? 15.2 : 0;
        
        echo json_encode([
            'success' => true,
            'analytics' => [
                'revenue' => [
                    'total' => (float)$totalRevenue,
                    'monthly' => $monthlyRevenue,
                    'growth' => $revenueGrowth
                ],
                'orders' => [
                    'total' => (int)$totalOrders,
                    'monthly' => $monthlyOrders,
                    'growth' => $ordersGrowth
                ],
                'products' => [
                    'total' => (int)$totalProducts,
                    'brands' => $brands,
                    'colours' => $colours,
                    'finishes' => $finishes,
                    'sizes' => $sizes
                ],
                'customers' => [
                    'total' => (int)$totalCustomers,
                    'new' => (int)$newCustomers,
                    'growth' => $customersGrowth
                ],
                'recentActivity' => $recentActivity
            ]
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>
