<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

// Create blogs table if it doesn't exist
$createTableSQL = "
CREATE TABLE IF NOT EXISTS blogs (
    ID INT AUTO_INCREMENT PRIMARY KEY,
    post_title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    post_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    post_content LONGTEXT,
    post_excerpt TEXT,
    post_status ENUM('publish', 'draft', 'private') DEFAULT 'publish',
    categories VARCHAR(255),
    tags VARCHAR(255),
    featured_image VARCHAR(500),
    metadescription TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTableSQL);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Failed to create blogs table: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Fetch all blogs
        try {
            $stmt = $pdo->query("SELECT * FROM blogs ORDER BY post_date DESC");
            $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // If no blogs in database, try to fetch from JSON file as fallback
            if (empty($blogs)) {
                $blogsFile = '../data/blogs.json';
                if (file_exists($blogsFile)) {
                    $jsonBlogs = json_decode(file_get_contents($blogsFile), true);
                    if ($jsonBlogs) {
                        // Import blogs from JSON to database
                        $insertStmt = $pdo->prepare("
                            INSERT INTO blogs (ID, post_title, slug, post_date, post_content, 
                            post_excerpt, post_status, categories, tags, featured_image, metadescription)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ");
                        
                        foreach ($jsonBlogs as $blog) {
                            try {
                                $insertStmt->execute([
                                    $blog['ID'],
                                    $blog['post_title'],
                                    $blog['slug'],
                                    $blog['post_date'],
                                    $blog['post_content'],
                                    $blog['post_excerpt'] ?? '',
                                    $blog['post_status'] ?? 'publish',
                                    $blog['categories'] ?? '',
                                    $blog['tags'] ?? '',
                                    $blog['featured_image'] ?? '',
                                    $blog['metadescription'] ?? ''
                                ]);
                            } catch(PDOException $e) {
                                // Skip if blog already exists
                                continue;
                            }
                        }
                        
                        // Fetch blogs again after import
                        $stmt = $pdo->query("SELECT * FROM blogs ORDER BY post_date DESC");
                        $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    }
                }
            }
            
            echo json_encode(['success' => true, 'blogs' => $blogs]);
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Failed to fetch blogs: ' . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Create or update blog
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!$data) {
            echo json_encode(['error' => 'Invalid JSON data']);
            exit;
        }
        
        try {
            if (isset($data['ID']) && $data['ID']) {
                // Update existing blog
                $stmt = $pdo->prepare("
                    UPDATE blogs SET 
                    post_title = ?, slug = ?, post_content = ?, post_excerpt = ?, 
                    post_status = ?, categories = ?, tags = ?, featured_image = ?, 
                    metadescription = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE ID = ?
                ");
                
                $stmt->execute([
                    $data['post_title'],
                    $data['slug'],
                    $data['post_content'],
                    $data['post_excerpt'] ?? '',
                    $data['post_status'] ?? 'publish',
                    $data['categories'] ?? '',
                    $data['tags'] ?? '',
                    $data['featured_image'] ?? '',
                    $data['metadescription'] ?? '',
                    $data['ID']
                ]);
                
                echo json_encode(['success' => true, 'message' => 'Blog updated successfully']);
            } else {
                // Create new blog
                $stmt = $pdo->prepare("
                    INSERT INTO blogs (post_title, slug, post_content, post_excerpt, 
                    post_status, categories, tags, featured_image, metadescription)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $data['post_title'],
                    $data['slug'],
                    $data['post_content'],
                    $data['post_excerpt'] ?? '',
                    $data['post_status'] ?? 'publish',
                    $data['categories'] ?? '',
                    $data['tags'] ?? '',
                    $data['featured_image'] ?? '',
                    $data['metadescription'] ?? ''
                ]);
                
                echo json_encode(['success' => true, 'message' => 'Blog created successfully', 'id' => $pdo->lastInsertId()]);
            }
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Failed to save blog: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Delete blog
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($data['ID'])) {
            echo json_encode(['error' => 'Blog ID is required']);
            exit;
        }
        
        try {
            $stmt = $pdo->prepare("DELETE FROM blogs WHERE ID = ?");
            $stmt->execute([$data['ID']]);
            
            if ($stmt->rowCount() > 0) {
                echo json_encode(['success' => true, 'message' => 'Blog deleted successfully']);
            } else {
                echo json_encode(['error' => 'Blog not found']);
            }
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Failed to delete blog: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
