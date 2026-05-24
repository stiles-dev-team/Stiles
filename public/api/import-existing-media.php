<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
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
        
        $imagesDir = '../images/';
        $importedFiles = [];
        $errors = [];
        
        if (!is_dir($imagesDir)) {
            echo json_encode(['success' => false, 'message' => 'Images directory not found']);
            exit;
        }
        
        // Recursively get all files from the images directory and subdirectories
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx'];
        $allFiles = getRecursiveFiles($imagesDir, $allowedExtensions);
        
        foreach ($allFiles as $fileInfo) {
            $file = $fileInfo['file'];
            $relativePath = $fileInfo['relativePath'];
            $filePath = $fileInfo['fullPath'];
            
            // Check if file already exists in database (using relative path as unique identifier)
            $stmt = $pdo->prepare("SELECT id FROM media_files WHERE file_path = ?");
            $stmt->execute(['https://staging.stiles.co.za/images/' . $relativePath]);
            if ($stmt->fetch()) {
                continue; // Skip if already exists
            }
            
            // Determine file type
            $fileExtension = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            $fileType = in_array($fileExtension, ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']) ? 'image' : 'document';
            
            // Get file size
            $fileSize = filesize($filePath);
            
            // Generate alt text based on filename
            $altText = ucfirst(str_replace(['_', '-'], ' ', pathinfo($file, PATHINFO_FILENAME)));
            
            // Determine category based on path and filename
            $category = 'general';
            $lowerPath = strtolower($relativePath);
            $lowerFile = strtolower($file);
            
            if (strpos($lowerPath, 'logo') !== false || strpos($lowerFile, 'logo') !== false) {
                $category = 'branding';
            } elseif (strpos($lowerPath, 'banner') !== false || strpos($lowerFile, 'banner') !== false) {
                $category = 'banners';
            } elseif (strpos($lowerPath, 'product') !== false || strpos($lowerFile, 'product') !== false) {
                $category = 'products';
            } elseif (preg_match('/\d{4}/', $relativePath)) {
                // If path contains year, categorize by year
                $category = 'archive';
            }
            
            // Insert into database
            $stmt = $pdo->prepare("INSERT INTO media_files (filename, file_path, file_type, file_size, alt_text, description, category) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $result = $stmt->execute([
                $file,
                'https://staging.stiles.co.za/images/' . $relativePath,
                $fileType,
                $fileSize,
                $altText,
                'Imported from existing files in ' . dirname($relativePath),
                $category
            ]);
            
            if ($result) {
                $fileId = $pdo->lastInsertId();
                $importedFiles[] = [
                    'id' => (int)$fileId,
                    'filename' => $file,
                    'url' => 'https://staging.stiles.co.za/images/' . $relativePath,
                    'type' => $fileType,
                    'size' => formatFileSize($fileSize),
                    'alt' => $altText,
                    'description' => 'Imported from existing files in ' . dirname($relativePath),
                    'category' => $category,
                    'uploadedAt' => date('Y-m-d H:i:s')
                ];
            } else {
                $errors[] = "Error importing file: $relativePath";
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Files imported successfully',
            'imported' => count($importedFiles),
            'files' => $importedFiles,
            'errors' => $errors
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error importing files: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}

function getRecursiveFiles($dir, $allowedExtensions) {
    $files = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($dir, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::LEAVES_ONLY
    );
    
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $extension = strtolower($file->getExtension());
            if (in_array($extension, $allowedExtensions)) {
                $fullPath = $file->getRealPath();
                $relativePath = str_replace($dir, '', $fullPath);
                $relativePath = ltrim($relativePath, '/\\'); // Remove leading slashes
                
                // Ensure we only get the path relative to images directory
                if (strpos($relativePath, 'images/') === 0) {
                    $relativePath = substr($relativePath, 7); // Remove 'images/' prefix
                }
                
                $files[] = [
                    'file' => $file->getFilename(),
                    'relativePath' => $relativePath,
                    'fullPath' => $fullPath
                ];
            }
        }
    }
    
    return $files;
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
