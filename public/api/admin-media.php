<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        try {
            // Check if media_files table exists, if not create it
            $pdo->exec("CREATE TABLE IF NOT EXISTS media_files (
                id INT AUTO_INCREMENT PRIMARY KEY,
                filename VARCHAR(255) NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                file_type ENUM('image', 'document') NOT NULL,
                file_size INT NOT NULL,
                alt_text TEXT,
                description TEXT,
                category VARCHAR(100) DEFAULT 'general',
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            
            // Get pagination parameters
            $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
            $limit = isset($_GET['limit']) ? max(1, min(100, intval($_GET['limit']))) : 30;
            $offset = ($page - 1) * $limit;
            
            // Get search and filter parameters
            $search = isset($_GET['search']) ? trim($_GET['search']) : '';
            $type = isset($_GET['type']) ? $_GET['type'] : '';
            $category = isset($_GET['category']) ? $_GET['category'] : '';
            
            // Build query conditions
            $whereConditions = [];
            $params = [];
            
            if (!empty($search)) {
                $whereConditions[] = "(filename LIKE ? OR alt_text LIKE ? OR description LIKE ?)";
                $searchParam = "%$search%";
                $params[] = $searchParam;
                $params[] = $searchParam;
                $params[] = $searchParam;
            }
            
            if (!empty($type) && $type !== 'all') {
                $whereConditions[] = "file_type = ?";
                $params[] = $type;
            }
            
            if (!empty($category) && $category !== 'all') {
                $whereConditions[] = "category = ?";
                $params[] = $category;
            }
            
            $whereClause = !empty($whereConditions) ? "WHERE " . implode(" AND ", $whereConditions) : "";
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM media_files $whereClause";
            $countStmt = $pdo->prepare($countQuery);
            $countStmt->execute($params);
            $totalCount = $countStmt->fetch()['total'];
            
            // Get paginated results
            $query = "SELECT * FROM media_files $whereClause ORDER BY uploaded_at DESC LIMIT $limit OFFSET $offset";
            
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Format the response
            $formattedFiles = array_map(function($file) {
                return [
                    'id' => (int)$file['id'],
                    'filename' => $file['filename'],
                    'url' => $file['file_path'],
                    'type' => $file['file_type'],
                    'size' => formatFileSize($file['file_size']),
                    'alt' => $file['alt_text'] ?: '',
                    'description' => $file['description'] ?: '',
                    'category' => $file['category'],
                    'uploadedAt' => $file['uploaded_at']
                ];
            }, $files);
            
            $totalPages = ceil($totalCount / $limit);
            
            echo json_encode([
                'success' => true, 
                'files' => $formattedFiles, 
                'pagination' => [
                    'currentPage' => $page,
                    'totalPages' => $totalPages,
                    'totalCount' => (int)$totalCount,
                    'limit' => $limit,
                    'hasNext' => $page < $totalPages,
                    'hasPrev' => $page > 1
                ]
            ]);
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error fetching media files: ' . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        // Handle file upload
        if (isset($_FILES['file']) && !empty($_FILES['file']['name'])) {
            try {
                // Check if media_files table exists, if not create it
                $pdo->exec("CREATE TABLE IF NOT EXISTS media_files (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    filename VARCHAR(255) NOT NULL,
                    file_path VARCHAR(500) NOT NULL,
                    file_type ENUM('image', 'document') NOT NULL,
                    file_size INT NOT NULL,
                    alt_text TEXT,
                    description TEXT,
                    category VARCHAR(100) DEFAULT 'general',
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )");
                
                $file = $_FILES['file'];
                $altText = $_POST['alt'] ?? '';
                $description = $_POST['description'] ?? '';
                $category = $_POST['category'] ?? 'general';
                
                // Validate file
                $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                $maxSize = 10 * 1024 * 1024; // 10MB
                
                if (!in_array($file['type'], $allowedTypes)) {
                    echo json_encode(['success' => false, 'message' => 'Invalid file type']);
                    exit;
                }
                
                if ($file['size'] > $maxSize) {
                    echo json_encode(['success' => false, 'message' => 'File too large. Maximum size is 10MB']);
                    exit;
                }
                
                // Create upload directory if it doesn't exist
                $uploadDir = '../images/';
                if (!file_exists($uploadDir)) {
                    mkdir($uploadDir, 0755, true);
                }
                
                // Generate unique filename
                $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
                $uniqueFilename = uniqid() . '_' . time() . '.' . $fileExtension;
                $uploadPath = $uploadDir . $uniqueFilename;
                
                // Move uploaded file
                if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                    // Determine file type
                    $fileType = strpos($file['type'], 'image/') === 0 ? 'image' : 'document';
                    
                        // Insert into database
                        $stmt = $pdo->prepare("INSERT INTO media_files (filename, file_path, file_type, file_size, alt_text, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
                        $result = $stmt->execute([
                            $file['name'],
                            'https://staging.stiles.co.za/images/' . $uniqueFilename,
                            $fileType,
                            $file['size'],
                            $altText,
                            $description,
                            $category
                        ]);
                    
                    if ($result) {
                        $fileId = $pdo->lastInsertId();
                        echo json_encode([
                            'success' => true, 
                            'message' => 'File uploaded successfully',
                            'file' => [
                                'id' => (int)$fileId,
                                'filename' => $file['name'],
                                'url' => 'https://staging.stiles.co.za/images/' . $uniqueFilename,
                                'type' => $fileType,
                                'size' => formatFileSize($file['size']),
                                'alt' => $altText,
                                'description' => $description,
                                'category' => $category,
                                'uploadedAt' => date('Y-m-d H:i:s')
                            ]
                        ]);
                    } else {
                        echo json_encode(['success' => false, 'message' => 'Error saving file to database']);
                    }
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error uploading file']);
                }
                
            } catch(PDOException $e) {
                echo json_encode(['success' => false, 'message' => 'Error uploading file: ' . $e->getMessage()]);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No file provided']);
        }
        break;
        
    case 'PUT':
        // Handle file metadata update
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id']) || !isset($input['alt']) || !isset($input['description']) || !isset($input['filename'])) {
            echo json_encode(['success' => false, 'message' => 'ID, alt, description, and filename are required']);
            exit;
        }
        
        $id = $input['id'];
        $alt = $input['alt'];
        $description = $input['description'];
        $filename = $input['filename'];
        
        try {
            $stmt = $pdo->prepare("UPDATE media_files SET alt_text = ?, description = ?, filename = ? WHERE id = ?");
            $result = $stmt->execute([$alt, $description, $filename, $id]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'File updated successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error updating file']);
            }
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error updating file: ' . $e->getMessage()]);
        }
        break;
        
    case 'DELETE':
        // Handle file deletion
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id'])) {
            echo json_encode(['success' => false, 'message' => 'File ID is required']);
            exit;
        }
        
        $id = $input['id'];
        
        try {
            // Get file path first
            $stmt = $pdo->prepare("SELECT file_path FROM media_files WHERE id = ?");
            $stmt->execute([$id]);
            $file = $stmt->fetch();
            
            if ($file) {
                // Delete physical file
                $filePath = '..' . $file['file_path'];
                if (file_exists($filePath)) {
                    unlink($filePath);
                }
                
                // Delete database record
                $stmt = $pdo->prepare("DELETE FROM media_files WHERE id = ?");
                $result = $stmt->execute([$id]);
                
                if ($result) {
                    echo json_encode(['success' => true, 'message' => 'File deleted successfully']);
                } else {
                    echo json_encode(['success' => false, 'message' => 'Error deleting file']);
                }
            } else {
                echo json_encode(['success' => false, 'message' => 'File not found']);
            }
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error deleting file: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

function formatFileSize($bytes) {
    if ($bytes >= 1024 * 1024) {
        return round($bytes / (1024 * 1024), 1) . ' MB';
    } elseif ($bytes >= 1024) {
        return round($bytes / 1024, 1) . ' KB';
    } else {
        return $bytes . ' B';
    }
}
?>
