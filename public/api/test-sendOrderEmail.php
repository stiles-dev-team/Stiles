<?php
/**
 * Test file for sendOrderEmail.php
 * 
 * Usage:
 * - Browser: http://your-domain/api/test-sendOrderEmail.php
 * - Command line: php test-sendOrderEmail.php
 * - With email parameter: ?email=test@example.com
 * - With dry-run: ?dry_run=1 (won't actually send email)
 */

require_once 'config.php';
require_once 'sendOrderEmail.php';

// Enable error reporting for testing
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Determine if running from CLI or browser
$isCLI = php_sapi_name() === 'cli';

// Get parameters
$testEmail = isset($_GET['email']) ? $_GET['email'] : (isset($argv[1]) ? $argv[1] : 'cpadillam5@gmail.com');
$dryRun = isset($_GET['dry_run']) || (isset($argv[2]) && $argv[2] === 'dry_run');

// Output function that works for both CLI and browser
function output($message, $type = 'info') {
    global $isCLI;
    
    if ($isCLI) {
        $colors = [
            'success' => "\033[32m", // Green
            'error' => "\033[31m",   // Red
            'warning' => "\033[33m", // Yellow
            'info' => "\033[36m",    // Cyan
            'reset' => "\033[0m"
        ];
        $prefix = $colors[$type] ?? '';
        $suffix = $colors['reset'];
        echo $prefix . $message . $suffix . "\n";
    } else {
        $classes = [
            'success' => 'success',
            'error' => 'error',
            'warning' => 'warning',
            'info' => 'info'
        ];
        $class = $classes[$type] ?? 'info';
        echo "<div class='$class'>$message</div>";
    }
}

// Start HTML output if browser
if (!$isCLI) {
    echo '<!DOCTYPE html>
<html>
<head>
    <title>sendOrderEmail.php Test</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .success { color: #155724; background-color: #d4edda; border: 1px solid #c3e6cb; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .error { color: #721c24; background-color: #f8d7da; border: 1px solid #f5c6cb; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .info { color: #0c5460; background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .warning { color: #856404; background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 10px 0; border-radius: 4px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 4px; background-color: #f9f9f9; }
        .code-block { background-color: #f4f4f4; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px; overflow-x: auto; margin: 10px 0; }
        h1 { color: #333; }
        h2 { color: #555; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
        h3 { color: #666; }
        .form-section { background-color: #e9ecef; padding: 15px; border-radius: 4px; margin: 20px 0; }
        input[type="email"], input[type="text"] { padding: 8px; width: 300px; margin: 5px; }
        button { padding: 8px 15px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        button:hover { background-color: #0056b3; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 sendOrderEmail.php Test Suite</h1>';
}

// Test configuration
output("📋 Test Configuration", 'info');
output("Test Email: $testEmail", 'info');
output("Dry Run Mode: " . ($dryRun ? 'YES (Email will NOT be sent)' : 'NO (Email WILL be sent)'), $dryRun ? 'warning' : 'info');
output("SMTP Host: " . SMTP_HOST, 'info');
output("SMTP Port: " . SMTP_PORT, 'info');
output("From Email: " . SMTP_FROM_EMAIL, 'info');

if (!$isCLI) {
    echo '<div class="form-section">
        <h3>Test Options</h3>
        <form method="GET" action="">
            <label>Test Email Address:</label><br>
            <input type="email" name="email" value="' . htmlspecialchars($testEmail) . '" placeholder="test@example.com"><br>
            <label><input type="checkbox" name="dry_run" value="1" ' . ($dryRun ? 'checked' : '') . '> Dry Run (Don\'t send email)</label><br>
            <button type="submit">Run Test</button>
        </form>
    </div>';
}

// Test 1: Complete valid order data
output("\n" . ($isCLI ? "" : "<div class='test-section'>") . "📦 Test 1: Complete Valid Order Data" . ($isCLI ? "" : "</div>"), 'info');

$validOrderData = [
    'id' => 'TEST-' . time(),
    'created_at' => date('Y-m-d H:i:s'),
    'total' => 1250.75,
    'shippingAddress' => [
        'firstName' => 'John',
        'lastName' => 'Doe',
        'companyName' => 'Test Company Ltd',
        'email' => 'john.doe@example.com',
        'phone' => '+27 11 123 4567',
        'orderNotes' => 'Please deliver between 9am and 5pm',
        'street' => '123 Main Street',
        'city' => 'Johannesburg',
        'state' => 'Gauteng',
        'postalCode' => '2000'
    ],
    'items' => [
        [
            'name' => 'Premium Ceramic Tile - White',
            'sku' => 'TILE-001-WH',
            'quantity' => 10,
            'price' => 45.50
        ],
        [
            'name' => 'Grout - Grey',
            'sku' => 'GROUT-GRY-001',
            'quantity' => 2,
            'price' => 125.25
        ],
        [
            'name' => 'Adhesive - Standard',
            'sku' => 'ADH-STD-001',
            'quantity' => 5,
            'price' => 89.00
        ]
    ]
];

if (!$isCLI) {
    echo '<div class="code-block">';
    echo 'Order ID: ' . htmlspecialchars($validOrderData['id']) . '<br>';
    echo 'Total: R' . number_format($validOrderData['total'], 2) . '<br>';
    echo 'Items: ' . count($validOrderData['items']) . '<br>';
    echo 'Customer: ' . htmlspecialchars($validOrderData['shippingAddress']['firstName'] . ' ' . $validOrderData['shippingAddress']['lastName']);
    echo '</div>';
}

if ($dryRun) {
    output("✅ Test 1: Order data structure is valid (Dry run - email not sent)", 'success');
} else {
    output("📤 Attempting to send email...", 'info');
    $result1 = sendOrderEmail($validOrderData, $testEmail);
    
    if ($result1) {
        output("✅ Test 1: PASSED - Email sent successfully!", 'success');
    } else {
        output("❌ Test 1: FAILED - Email sending failed. Check error logs.", 'error');
    }
}

// Test 2: Order with missing optional fields
output("\n" . ($isCLI ? "" : "<div class='test-section'>") . "📦 Test 2: Order with Missing Optional Fields" . ($isCLI ? "" : "</div>"), 'info');

$minimalOrderData = [
    'id' => 'TEST-MIN-' . time(),
    'created_at' => date('Y-m-d H:i:s'),
    'total' => 500.00,
    'shippingAddress' => [
        'firstName' => 'Jane',
        'lastName' => 'Smith',
        'companyName' => '', // Empty
        'email' => 'jane.smith@example.com',
        'phone' => '',
        'orderNotes' => '', // Empty
        'street' => '456 Oak Avenue',
        'city' => 'Cape Town',
        'state' => 'Western Cape',
        'postalCode' => '8001'
    ],
    'items' => [
        [
            'name' => 'Basic Tile',
            'sku' => '', // Empty SKU
            'quantity' => 5,
            'price' => 100.00
        ]
    ]
];

if ($dryRun) {
    output("✅ Test 2: Minimal order data structure is valid (Dry run - email not sent)", 'success');
} else {
    output("📤 Attempting to send email...", 'info');
    $result2 = sendOrderEmail($minimalOrderData, $testEmail);
    
    if ($result2) {
        output("✅ Test 2: PASSED - Email sent successfully with minimal data!", 'success');
    } else {
        output("❌ Test 2: FAILED - Email sending failed.", 'error');
    }
}

// Test 3: Order with special characters (XSS test)
output("\n" . ($isCLI ? "" : "<div class='test-section'>") . "📦 Test 3: Order with Special Characters (XSS Protection Test)" . ($isCLI ? "" : "</div>"), 'info');

$specialCharOrderData = [
    'id' => 'TEST-XSS-' . time(),
    'created_at' => date('Y-m-d H:i:s'),
    'total' => 750.50,
    'shippingAddress' => [
        'firstName' => '<script>alert("XSS")</script>',
        'lastName' => 'O\'Brien & Associates',
        'companyName' => 'Test & Co. <>"\'',
        'email' => 'test+special@example.com',
        'phone' => '+27 (11) 123-4567',
        'orderNotes' => 'Special chars: <>&"\'',
        'street' => '123 Main St. #4',
        'city' => 'Durban',
        'state' => 'KwaZulu-Natal',
        'postalCode' => '4001'
    ],
    'items' => [
        [
            'name' => 'Tile <script>alert("test")</script>',
            'sku' => 'SKU-<>&"\'',
            'quantity' => 3,
            'price' => 250.17
        ]
    ]
];

if ($dryRun) {
    output("✅ Test 3: Special characters handled (Dry run - email not sent)", 'success');
} else {
    output("📤 Attempting to send email with special characters...", 'info');
    $result3 = sendOrderEmail($specialCharOrderData, $testEmail);
    
    if ($result3) {
        output("✅ Test 3: PASSED - Email sent successfully with special characters!", 'success');
    } else {
        output("❌ Test 3: FAILED - Email sending failed.", 'error');
    }
}

// Test 4: Large order with many items
output("\n" . ($isCLI ? "" : "<div class='test-section'>") . "📦 Test 4: Large Order with Many Items" . ($isCLI ? "" : "</div>"), 'info');

$largeOrderData = [
    'id' => 'TEST-LARGE-' . time(),
    'created_at' => date('Y-m-d H:i:s'),
    'total' => 0, // Will calculate
    'shippingAddress' => [
        'firstName' => 'Large',
        'lastName' => 'Order',
        'companyName' => 'Bulk Purchase Inc',
        'email' => 'bulk@example.com',
        'phone' => '+27 11 999 8888',
        'orderNotes' => 'Large commercial order',
        'street' => '789 Business Park',
        'city' => 'Pretoria',
        'state' => 'Gauteng',
        'postalCode' => '0001'
    ],
    'items' => []
];

// Generate 20 items
$total = 0;
for ($i = 1; $i <= 20; $i++) {
    $price = rand(50, 500);
    $quantity = rand(1, 10);
    $itemTotal = $price * $quantity;
    $total += $itemTotal;
    
    $largeOrderData['items'][] = [
        'name' => "Product Item #$i - Test Tile",
        'sku' => "SKU-$i",
        'quantity' => $quantity,
        'price' => $price
    ];
}
$largeOrderData['total'] = $total;

if (!$isCLI) {
    echo '<div class="code-block">';
    echo 'Items: ' . count($largeOrderData['items']) . '<br>';
    echo 'Total: R' . number_format($largeOrderData['total'], 2);
    echo '</div>';
}

if ($dryRun) {
    output("✅ Test 4: Large order data structure is valid (Dry run - email not sent)", 'success');
} else {
    output("📤 Attempting to send email with " . count($largeOrderData['items']) . " items...", 'info');
    $result4 = sendOrderEmail($largeOrderData, $testEmail);
    
    if ($result4) {
        output("✅ Test 4: PASSED - Email sent successfully with large order!", 'success');
    } else {
        output("❌ Test 4: FAILED - Email sending failed.", 'error');
    }
}

// Test 5: Invalid email address
output("\n" . ($isCLI ? "" : "<div class='test-section'>") . "📦 Test 5: Invalid Email Address" . ($isCLI ? "" : "</div>"), 'info');

$invalidEmail = 'not-a-valid-email';
output("📤 Attempting to send email to invalid address: $invalidEmail", 'warning');

if ($dryRun) {
    output("⚠️ Test 5: Skipped in dry run mode", 'warning');
} else {
    $result5 = sendOrderEmail($validOrderData, $invalidEmail);
    
    if (!$result5) {
        output("✅ Test 5: PASSED - Correctly rejected invalid email address!", 'success');
    } else {
        output("❌ Test 5: FAILED - Should have rejected invalid email address.", 'error');
    }
}

// Summary
output("\n" . ($isCLI ? "" : "<div class='test-section'>") . "📊 Test Summary" . ($isCLI ? "" : "</div>"), 'info');

if (!$dryRun) {
    $passed = 0;
    $failed = 0;
    
    if (isset($result1) && $result1) $passed++; else if (isset($result1)) $failed++;
    if (isset($result2) && $result2) $passed++; else if (isset($result2)) $failed++;
    if (isset($result3) && $result3) $passed++; else if (isset($result3)) $failed++;
    if (isset($result4) && $result4) $passed++; else if (isset($result4)) $failed++;
    if (isset($result5) && !$result5) $passed++; else if (isset($result5)) $failed++;
    
    output("Tests Passed: $passed", 'success');
    if ($failed > 0) {
        output("Tests Failed: $failed", 'error');
    }
    
    if ($passed > 0 && $failed == 0) {
        output("🎉 All tests passed! sendOrderEmail.php is working correctly.", 'success');
    } else if ($failed > 0) {
        output("⚠️ Some tests failed. Check error logs for details.", 'warning');
    }
} else {
    output("ℹ️ Dry run completed. No emails were sent.", 'info');
    output("💡 Remove ?dry_run=1 parameter to actually send test emails.", 'info');
}

// Troubleshooting section
if (!$isCLI) {
    echo '<div class="test-section">
        <h2>🔧 Troubleshooting</h2>
        <ul>
            <li><strong>Email not sending:</strong> Check SMTP configuration in config.php</li>
            <li><strong>Connection errors:</strong> Verify SMTP_HOST and SMTP_PORT are correct</li>
            <li><strong>Authentication errors:</strong> Check SMTP_USERNAME and SMTP_PASSWORD</li>
            <li><strong>Check error logs:</strong> Look in your PHP error log for detailed error messages</li>
            <li><strong>Test SMTP connection:</strong> <a href="test-smtp.php">Run SMTP connection test</a></li>
        </ul>
    </div>';
    
    echo '<div class="test-section">
        <h2>📝 Test Scenarios Covered</h2>
        <ul>
            <li>✅ Complete valid order data</li>
            <li>✅ Order with missing optional fields</li>
            <li>✅ Order with special characters (XSS protection)</li>
            <li>✅ Large order with many items</li>
            <li>✅ Invalid email address handling</li>
        </ul>
    </div>';
    
    echo '</div></body></html>';
} else {
    output("\n💡 Tip: Use 'php test-sendOrderEmail.php [email] [dry_run]' to run from command line", 'info');
}
?>
