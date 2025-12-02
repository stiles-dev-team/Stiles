<?php
// Start output buffering at the very beginning
ob_start();

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Log errors to a file
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/api_errors.log');

// Set headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: public, max-age=300'); // Cache for 5 minutes

// Handle compression
$useCompression = false;
if (extension_loaded('zlib')) {
    $useCompression = true;
    ini_set('zlib.output_compression', 'On');
    ini_set('zlib.output_compression_level', '9');
}

require_once 'config.php';

// Test database connection
try {
    $pdo->query('SELECT 1');
} catch(PDOException $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit();
}

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Check if we're fetching a single blog by slug
    if (isset($_GET['slug']) && !empty($_GET['slug'])) {
        $slug = $_GET['slug'];
        $stmt = $pdo->prepare("SELECT * FROM blogs WHERE slug = ? AND post_status = 'publish'");
        $stmt->execute([$slug]);
        $blog = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($blog) {
            // Format the response to match expected structure
            $formattedBlog = [
                'ID' => (int)$blog['ID'],
                'post_title' => $blog['post_title'],
                'slug' => $blog['slug'],
                'post_date' => $blog['post_date'],
                'post_content' => $blog['post_content'],
                'post_excerpt' => $blog['post_excerpt'],
                'desc' => $blog['post_excerpt'], // Add desc field for compatibility
                'post_status' => $blog['post_status'],
                'categories' => $blog['categories'],
                'tags' => $blog['tags'],
                'featured_image' => $blog['featured_image'],
                'metadescription' => $blog['metadescription']
            ];
            
            echo json_encode($formattedBlog, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Blog post not found'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        }
    } else {
        // Fetch all published blogs
        $stmt = $pdo->query("SELECT * FROM blogs WHERE post_status = 'publish' ORDER BY ID DESC");
        $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format the response to match expected structure
        $formattedBlogs = array_map(function($blog) {
            return [
                'ID' => (int)$blog['ID'],
                'post_title' => $blog['post_title'],
                'slug' => $blog['slug'],
                'post_date' => $blog['post_date'],
                'post_content' => $blog['post_content'],
                'post_excerpt' => $blog['post_excerpt'],
                'desc' => $blog['post_excerpt'], // Add desc field for compatibility
                'post_status' => $blog['post_status'],
                'categories' => $blog['categories'],
                'tags' => $blog['tags'],
                'featured_image' => $blog['featured_image'],
                'metadescription' => $blog['metadescription']
            ];
        }, $blogs);
        
        echo json_encode($formattedBlogs, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }
} catch(PDOException $e) {
    error_log('Error in get-blogs.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Database query failed: ' . $e->getMessage()
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

// End output buffering and send the response
if (!$useCompression) {
    ob_end_flush();
}
?>
