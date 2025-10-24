<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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
        
        $uploadedFiles = [];
        $errors = [];
        
        // Handle multiple file uploads
        if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
            $fileCount = count($_FILES['files']['name']);
            
            for ($i = 0; $i < $fileCount; $i++) {
                if ($_FILES['files']['error'][$i] === UPLOAD_ERR_OK) {
                    $file = [
                        'name' => $_FILES['files']['name'][$i],
                        'type' => $_FILES['files']['type'][$i],
                        'tmp_name' => $_FILES['files']['tmp_name'][$i],
                        'size' => $_FILES['files']['size'][$i]
                    ];
                    
                    // Get metadata for this file
                    $altText = isset($_POST['alt'][$i]) ? $_POST['alt'][$i] : '';
                    $description = isset($_POST['description'][$i]) ? $_POST['description'][$i] : '';
                    $category = isset($_POST['category'][$i]) ? $_POST['category'][$i] : 'general';
                    
                    // Validate file
                    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                    $maxSize = 10 * 1024 * 1024; // 10MB
                    
                    if (!in_array($file['type'], $allowedTypes)) {
                        $errors[] = "File '{$file['name']}' has invalid type";
                        continue;
                    }
                    
                    if ($file['size'] > $maxSize) {
                        $errors[] = "File '{$file['name']}' is too large (max 10MB)";
                        continue;
                    }
                    
                    // Create upload directory if it doesn't exist
                    $uploadDir = '../images/';
                    if (!file_exists($uploadDir)) {
                        mkdir($uploadDir, 0755, true);
                    }
                    
                    // Generate unique filename
                    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
                    $uniqueFilename = uniqid() . '_' . time() . '_' . $i . '.' . $fileExtension;
                    $uploadPath = $uploadDir . $uniqueFilename;
                    
                    // Move uploaded file
                    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
                        // Determine file type
                        $fileType = strpos($file['type'], 'image/') === 0 ? 'image' : 'document';
                        
                        // Insert into database
                        $stmt = $pdo->prepare("INSERT INTO media_files (filename, file_path, file_type, file_size, alt_text, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
                        $result = $stmt->execute([
                            $file['name'],
                            'https://stiles.co.za/images/' . $uniqueFilename,
                            $fileType,
                            $file['size'],
                            $altText,
                            $description,
                            $category
                        ]);
                        
                        if ($result) {
                            $fileId = $pdo->lastInsertId();
                            $uploadedFiles[] = [
                                'id' => (int)$fileId,
                                'filename' => $file['name'],
                                'url' => 'https://stiles.co.za/images/' . $uniqueFilename,
                                'type' => $fileType,
                                'size' => formatFileSize($file['size']),
                                'alt' => $altText,
                                'description' => $description,
                                'category' => $category,
                                'uploadedAt' => date('Y-m-d H:i:s')
                            ];
                        } else {
                            $errors[] = "Error saving '{$file['name']}' to database";
                        }
                    } else {
                        $errors[] = "Error uploading '{$file['name']}'";
                    }
                } else {
                    $errors[] = "Error uploading file: " . $_FILES['files']['name'][$i];
                }
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'No files provided']);
            exit;
        }
        
        // Return response
        if (count($uploadedFiles) > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Files uploaded successfully',
                'files' => $uploadedFiles,
                'errors' => $errors
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'No files were uploaded successfully',
                'errors' => $errors
            ]);
        }
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error uploading files: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
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
