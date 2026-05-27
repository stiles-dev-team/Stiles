<?php
/**
 * Server-Side Rendering (SSR) for Product Category Pages
 * This file handles SEO-friendly rendering of product category pages
 */

// Start output buffering
ob_start();

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set content type
header('Content-Type: text/html; charset=UTF-8');

// Include database configuration
require_once 'api/config.php';

// Function to get category data by slug
function getCategoryBySlug($slug) {
    global $pdo;
    
    try {
        // First try to get from database if categories table exists
        $stmt = $pdo->prepare('SELECT * FROM categories WHERE slug = ? AND is_active = 1 LIMIT 1');
        $stmt->execute([$slug]);
        $category = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($category) {
            return $category;
        }
    } catch (PDOException $e) {
        // If database table doesn't exist, fall back to JSON file
    }
    
    // Fallback to JSON file
    $categoriesFile = __DIR__ . '/data/navbar-categories.json';
    if (file_exists($categoriesFile)) {
        $categories = json_decode(file_get_contents($categoriesFile), true);
        foreach ($categories as $category) {
            if ($category['slug'] === $slug) {
                return $category;
            }
        }
    }
    
    return null;
}

// Function to get products for category
function getCategoryProducts($categoryName, $limit = 15, $offset = 0) {
    global $pdo;
    
    try {
        // Get total count
        $countStmt = $pdo->prepare('SELECT COUNT(*) as total FROM stiles_products WHERE status = "publish" AND product_category LIKE ?');
        $countStmt->execute(['%' . $categoryName . '%']);
        $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        // Get products
        $stmt = $pdo->prepare('
            SELECT 
                ID, title, slug, featured_image, regular_price, sale_price,
                product_category, `attribute:pa_colour` as colour,
                `attribute:pa_finish` as finish, `attribute:pa_brands` as brands,
                `attribute:pa_size` as size, post_date, description, excerpt
            FROM stiles_products 
            WHERE status = "publish" AND product_category LIKE ? 
            ORDER BY post_date DESC 
            LIMIT ? OFFSET ?
        ');
        
        $stmt->execute(['%' . $categoryName . '%', $limit, $offset]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        return [
            'products' => $products,
            'total_count' => $totalCount
        ];
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        return [
            'products' => [],
            'total_count' => 0
        ];
    }
}

// Function to extract plain text from HTML
function extractTextFromHTML($htmlString) {
    if (empty($htmlString)) return '';
    
    // Remove HTML tags and decode entities
    $text = strip_tags($htmlString);
    $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
    
    // Clean up whitespace
    $text = preg_replace('/\s+/', ' ', $text);
    return trim($text);
}

// Function to generate structured data
function generateStructuredData($category, $products) {
    $structuredData = [
        '@context' => 'https://schema.org',
        '@type' => 'CollectionPage',
        'name' => $category['name'],
        'description' => extractTextFromHTML($category['description']),
        'url' => 'https://staging.stiles.co.za/product-category/' . $category['slug'],
        'mainEntity' => [
            '@type' => 'ItemList',
            'name' => $category['name'] . ' Products',
            'numberOfItems' => count($products),
            'itemListElement' => []
        ]
    ];
    
    foreach ($products as $index => $product) {
        $structuredData['mainEntity']['itemListElement'][] = [
            '@type' => 'ListItem',
            'position' => $index + 1,
            'item' => [
                '@type' => 'Product',
                'name' => $product['title'],
                'description' => extractTextFromHTML($product['description']),
                'url' => 'https://staging.stiles.co.za/product/' . $product['slug'],
                'image' => $product['featured_image'] ? 'https://staging.stiles.co.za' . $product['featured_image'] : '',
                'offers' => [
                    '@type' => 'Offer',
                    'price' => $product['regular_price'],
                    'priceCurrency' => 'ZAR',
                    'availability' => 'https://schema.org/InStock'
                ]
            ]
        ];
    }
    
    return $structuredData;
}

// Get the slug from URL
$requestUri = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim($requestUri, '/'));
$slug = end($pathParts);

// Remove query parameters from slug
$slug = strtok($slug, '?');

// Get category data
$category = getCategoryBySlug($slug);

if (!$category) {
    // Category not found, return 404
    http_response_code(404);
    include '404.html';
    exit;
}

// Get products for this category (limit to 20 for SEO)
$productsData = getCategoryProducts($category['name'], 20, 0);
$products = $productsData['products'];

// Generate structured data
$structuredData = generateStructuredData($category, $products);

// Extract meta description
$metaDescription = extractTextFromHTML($category['description']);
if (strlen($metaDescription) > 160) {
    $metaDescription = substr($metaDescription, 0, 157) . '...';
}

// Generate keywords from category and products
$keywords = [];
$keywords[] = $category['name'];
$keywords[] = 'Stiles';
$keywords[] = 'South Africa';

// Add product-related keywords
foreach ($products as $product) {
    if (!empty($product['brands'])) {
        $keywords[] = $product['brands'];
    }
    if (!empty($product['colour'])) {
        $keywords[] = $product['colour'];
    }
    if (!empty($product['finish'])) {
        $keywords[] = $product['finish'];
    }
}

$keywords = array_unique($keywords);
$keywordsString = implode(', ', array_slice($keywords, 0, 10));

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- SEO Meta Tags -->
    <title><?php echo htmlspecialchars($category['name']); ?> | Stiles - South Africa's Leading Tile & Sanitaryware Retailer</title>
    <meta name="description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <meta name="keywords" content="<?php echo htmlspecialchars($keywordsString); ?>">
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo htmlspecialchars($category['name']); ?> | Stiles">
    <meta property="og:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://staging.stiles.co.za/product-category/<?php echo $category['slug']; ?>">
    <meta property="og:image" content="https://staging.stiles.co.za/images/logo.png">
    <meta property="og:site_name" content="Stiles">
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo htmlspecialchars($category['name']); ?> | Stiles">
    <meta name="twitter:description" content="<?php echo htmlspecialchars($metaDescription); ?>">
    <meta name="twitter:image" content="https://staging.stiles.co.za/images/logo.png">
    
    <!-- Canonical URL -->
    <link rel="canonical" href="https://staging.stiles.co.za/product-category/<?php echo $category['slug']; ?>">
    
    <!-- Structured Data -->
    <script type="application/ld+json">
    <?php echo json_encode($structuredData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES); ?>
    </script>
    
    <!-- Preload critical resources -->
    <link rel="preload" href="/assets/index-BCfe1Gxa.css" as="style">
    <link rel="preload" href="/assets/index-BfmRy43I.js" as="script">
    
    <!-- Styles -->
    <link rel="stylesheet" href="/assets/index-BCfe1Gxa.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/webp" href="/images/favi.webp">
</head>
<body>
    <!-- SEO-optimized content for search engines -->
    <div id="seo-content" style="display: none;">
        <h1><?php echo htmlspecialchars($category['name']); ?></h1>
        <div class="category-description">
            <?php echo $category['description']; ?>
        </div>
        
        <h2>Products in <?php echo htmlspecialchars($category['name']); ?></h2>
        <div class="products-list">
            <?php foreach ($products as $product): ?>
                <div class="product-item">
                    <h3><a href="/product/<?php echo $product['slug']; ?>"><?php echo htmlspecialchars($product['title']); ?></a></h3>
                    <p><?php echo htmlspecialchars(extractTextFromHTML($product['description'])); ?></p>
                    <?php if (!empty($product['brands'])): ?>
                        <p><strong>Brand:</strong> <?php echo htmlspecialchars($product['brands']); ?></p>
                    <?php endif; ?>
                    <?php if (!empty($product['colour'])): ?>
                        <p><strong>Colour:</strong> <?php echo htmlspecialchars($product['colour']); ?></p>
                    <?php endif; ?>
                    <?php if (!empty($product['finish'])): ?>
                        <p><strong>Finish:</strong> <?php echo htmlspecialchars($product['finish']); ?></p>
                    <?php endif; ?>
                    <p><strong>Price:</strong> R<?php echo number_format($product['regular_price'], 2); ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
    
    <!-- React app container -->
    <div id="root"></div>
    
    <!-- Load React app -->
    <script src="/assets/index-BfmRy43I.js"></script>
    
    <!-- Additional SEO content -->
    <noscript>
        <div class="no-js-content">
            <h1><?php echo htmlspecialchars($category['name']); ?></h1>
            <p><?php echo $category['description']; ?></p>
            <h2>Available Products</h2>
            <ul>
                <?php foreach ($products as $product): ?>
                    <li>
                        <a href="/product/<?php echo $product['slug']; ?>"><?php echo htmlspecialchars($product['title']); ?></a>
                        - R<?php echo number_format($product['regular_price'], 2); ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
    </noscript>
</body>
</html>
