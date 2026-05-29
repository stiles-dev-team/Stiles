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
        // Get all files with incorrect paths (multiple patterns)
        $stmt = $pdo->prepare("SELECT id, file_path FROM media_files WHERE file_path LIKE '%/usr/www/users/%' OR file_path LIKE '%/usr/www/%' OR file_path LIKE '%/var/www/%'");
        $stmt->execute();
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $updated = 0;
        $errors = [];
        
        foreach ($files as $file) {
            $oldPath = $file['file_path'];
            
            // Extract the relative path after the last /images/ occurrence
            $lastImagesPos = strrpos($oldPath, '/images/');
            if ($lastImagesPos !== false) {
                $relativePath = substr($oldPath, $lastImagesPos + 8); // +8 to skip '/images/'
                $newPath = 'https://staging.stiles.co.za/images/' . $relativePath;
                
                // Update the file path
                $updateStmt = $pdo->prepare("UPDATE media_files SET file_path = ? WHERE id = ?");
                $result = $updateStmt->execute([$newPath, $file['id']]);
                
                if ($result) {
                    $updated++;
                } else {
                    $errors[] = "Failed to update file ID: " . $file['id'];
                }
            } else {
                $errors[] = "Could not parse path for file ID: " . $file['id'] . " - " . $oldPath;
            }
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'File paths updated successfully',
            'updated' => $updated,
            'total_found' => count($files),
            'errors' => $errors
        ]);
        
    } catch(PDOException $e) {
        echo json_encode(['success' => false, 'message' => 'Error fixing file paths: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}
?>
