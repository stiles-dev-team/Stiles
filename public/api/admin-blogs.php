<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

// try {
//     $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
//     $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
// } catch(PDOException $e) {
//     echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
//     exit;
// }

// Create new_blogs table if it doesn't exist
$createTableSQL = "
CREATE TABLE IF NOT EXISTS new_blogs (
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
    featured_position TINYINT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

try {
    $pdo->exec($createTableSQL);
} catch(PDOException $e) {
    echo json_encode(['error' => 'Failed to create new_blogs table: ' . $e->getMessage()]);
    exit;
}

// If assigning slot 1–3, clear that slot on any other blog first.
function claimFeaturedPosition($pdo, $position, $excludeId = null) {
    $position = (int) $position;
    if (!in_array($position, [1, 2, 3], true)) {
        return;
    }
    $sql = 'UPDATE new_blogs SET featured_position = 0 WHERE featured_position = ?';
    $params = [$position];
    if ($excludeId) {
        $sql .= ' AND ID != ?';
        $params[] = (int) $excludeId;
    }
    $pdo->prepare($sql)->execute($params);
}

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Fetch all blogs
        try {
            $stmt = $pdo->query("SELECT * FROM new_blogs ORDER BY ID DESC");
            $blogs = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // If no blogs in database, try to fetch from JSON file as fallback
            if (empty($blogs)) {
                $blogsFile = '../data/blogs.json';
                if (file_exists($blogsFile)) {
                    $jsonBlogs = json_decode(file_get_contents($blogsFile), true);
                    if ($jsonBlogs) {
                        // Import blogs from JSON to database
                        $insertStmt = $pdo->prepare("
                            INSERT INTO new_blogs (ID, post_title, slug, post_date, post_content, 
                            post_excerpt, post_status, categories, tags, featured_image, metadescription, featured_position)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
                                    $blog['metadescription'] ?? '',
                                    (int)($blog['featured_position'] ?? 0)
                                ]);
                            } catch(PDOException $e) {
                                // Skip if blog already exists
                                continue;
                            }
                        }
                        
                        // Fetch blogs again after import
                        $stmt = $pdo->query("SELECT * FROM new_blogs ORDER BY ID DESC");
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
            if (array_key_exists('featured_position', $data)) {
                $featuredPosition = (int) ($data['featured_position'] ?? 0);
                $excludeId = !empty($data['ID']) ? (int) $data['ID'] : null;
                claimFeaturedPosition($pdo, $featuredPosition, $excludeId);
            }

            if (isset($data['ID']) && $data['ID']) {
                // Update existing blog
                $stmt = $pdo->prepare("
                    UPDATE new_blogs SET 
                    post_title = ?, slug = ?, post_date = ?, post_content = ?, post_excerpt = ?, 
                    post_status = ?, categories = ?, tags = ?, featured_image = ?, 
                    metadescription = ?, featured_position = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE ID = ?
                ");
                
                $stmt->execute([
                    $data['post_title'],
                    $data['slug'],
                    $data['post_date'],
                    $data['post_content'],
                    $data['post_excerpt'] ?? '',
                    $data['post_status'] ?? 'publish',
                    $data['categories'] ?? '',
                    $data['tags'] ?? '',
                    $data['featured_image'] ?? '',
                    $data['metadescription'] ?? '',
                    (int)($data['featured_position'] ?? 0),
                    $data['ID']
                ]);
                
                echo json_encode(['success' => true, 'message' => 'Blog updated successfully']);
            } else {
                // Create new blog
                $stmt = $pdo->prepare("
                    INSERT INTO new_blogs (post_title, slug, post_date, post_content, post_excerpt, 
                    post_status, categories, tags, featured_image, metadescription, featured_position)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $data['post_title'],
                    $data['slug'],
                    $data['post_date'],
                    $data['post_content'],
                    $data['post_excerpt'] ?? '',
                    $data['post_status'] ?? 'publish',
                    $data['categories'] ?? '',
                    $data['tags'] ?? '',
                    $data['featured_image'] ?? '',
                    $data['metadescription'] ?? '',
                    (int)($data['featured_position'] ?? 0)
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
            $stmt = $pdo->prepare("DELETE FROM new_blogs WHERE ID = ?");
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
