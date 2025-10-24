<?php
/**
 * Test script for SSR implementation
 * This script tests the SSR functionality for product categories
 */

// Include the SSR handler
require_once 'product-category.php';

// Test function to check if SSR is working
function testSSR() {
    echo "<h1>SSR Test Results</h1>";
    
    // Test 1: Check if product-category.php exists
    if (file_exists('product-category.php')) {
        echo "<p>✅ product-category.php exists</p>";
    } else {
        echo "<p>❌ product-category.php not found</p>";
    }
    
    // Test 2: Check if .htaccess exists
    if (file_exists('.htaccess')) {
        echo "<p>✅ .htaccess exists</p>";
    } else {
        echo "<p>❌ .htaccess not found</p>";
    }
    
    // Test 3: Check if database connection works
    try {
        require_once 'api/config.php';
        $pdo->query('SELECT 1');
        echo "<p>✅ Database connection works</p>";
    } catch (Exception $e) {
        echo "<p>❌ Database connection failed: " . $e->getMessage() . "</p>";
    }
    
    // Test 4: Check if categories JSON exists
    if (file_exists('data/navbar-categories.json')) {
        echo "<p>✅ Categories JSON file exists</p>";
        
        // Test reading categories
        $categories = json_decode(file_get_contents('data/navbar-categories.json'), true);
        if ($categories && count($categories) > 0) {
            echo "<p>✅ Categories loaded successfully (" . count($categories) . " categories)</p>";
            
            // Show first few categories
            echo "<h3>Sample Categories:</h3>";
            echo "<ul>";
            for ($i = 0; $i < min(5, count($categories)); $i++) {
                $category = $categories[$i];
                echo "<li><strong>" . htmlspecialchars($category['name']) . "</strong> (slug: " . htmlspecialchars($category['slug']) . ")</li>";
            }
            echo "</ul>";
        } else {
            echo "<p>❌ Failed to load categories</p>";
        }
    } else {
        echo "<p>❌ Categories JSON file not found</p>";
    }
    
    // Test 5: Check if products table exists
    try {
        $stmt = $pdo->query('SELECT COUNT(*) as count FROM stiles_products WHERE status = "publish"');
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<p>✅ Products table accessible (" . $result['count'] . " published products)</p>";
    } catch (Exception $e) {
        echo "<p>❌ Products table error: " . $e->getMessage() . "</p>";
    }
    
    echo "<h3>Test URLs to try:</h3>";
    echo "<ul>";
    echo "<li><a href='/product-category/tiles'>/product-category/tiles</a></li>";
    echo "<li><a href='/product-category/sanitary-ware'>/product-category/sanitary-ware</a></li>";
    echo "<li><a href='/product-category/flooring'>/product-category/flooring</a></li>";
    echo "</ul>";
    
    echo "<h3>SEO Test:</h3>";
    echo "<p>To test SEO, view the page source of the URLs above and check for:</p>";
    echo "<ul>";
    echo "<li>Proper title tags</li>";
    echo "<li>Meta descriptions</li>";
    echo "<li>Open Graph tags</li>";
    echo "<li>Structured data (JSON-LD)</li>";
    echo "<li>Canonical URLs</li>";
    echo "</ul>";
}

// Run the test
testSSR();
?>
