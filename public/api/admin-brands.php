<?php
require_once 'config.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Get JSON data from request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            // Get all brands with product counts
            $stmt = $pdo->prepare("
                SELECT 
                    b.id,
                    b.name,
                    b.description,
                    b.slug,
                    b.image,
                    b.is_active,
                    b.created_at,
                    COUNT(p.ID) as product_count
                FROM brands b
                LEFT JOIN stiles_products p ON b.name = p.`attribute:pa_brands` AND p.status = 'publish'
                WHERE b.is_active = 1
                GROUP BY b.id, b.name, b.description, b.slug, b.image, b.is_active, b.created_at
                ORDER BY b.name ASC
            ");
            $stmt->execute();
            $brands = $stmt->fetchAll();

            // Format the brands data
            $formattedBrands = [];
            foreach ($brands as $brand) {
                $formattedBrands[] = [
                    'id' => $brand['id'],
                    'name' => $brand['name'],
                    'description' => $brand['description'],
                    'slug' => $brand['slug'],
                    'image' => $brand['image'],
                    'product_count' => (int)$brand['product_count'],
                    'created_at' => $brand['created_at']
                ];
            }

            echo json_encode([
                'success' => true,
                'brands' => $formattedBrands
            ]);
            break;

        case 'POST':
            // Create new brand
            if (!isset($data['name']) || empty($data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Brand name is required']);
                exit();
            }

            $brandName = trim($data['name']);
            $description = isset($data['description']) ? trim($data['description']) : '';
            $slug = isset($data['slug']) ? trim($data['slug']) : '';
            $image = isset($data['image']) ? trim($data['image']) : '';
            
            // Check if brand already exists
            $checkStmt = $pdo->prepare("SELECT COUNT(*) as count FROM brands WHERE name = ?");
            $checkStmt->execute([$brandName]);
            $exists = $checkStmt->fetch()['count'] > 0;

            if ($exists) {
                http_response_code(400);
                echo json_encode(['error' => 'Brand already exists']);
                exit();
            }

            // Insert new brand
            $insertStmt = $pdo->prepare("
                INSERT INTO brands (name, description, slug, image) 
                VALUES (?, ?, ?, ?)
            ");
            $result = $insertStmt->execute([$brandName, $description, $slug, $image]);

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Brand created successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create brand']);
            }
            break;

        case 'PUT':
            // Update brand
            if (!isset($data['id']) || !isset($data['name'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Brand ID and name are required']);
                exit();
            }

            $brandId = (int)$data['id'];
            $oldName = trim($data['old_name'] ?? '');
            $newName = trim($data['new_name'] ?? $data['name']);
            $description = isset($data['description']) ? trim($data['description']) : '';
            $slug = isset($data['slug']) ? trim($data['slug']) : '';
            $image = isset($data['image']) ? trim($data['image']) : '';

            // Check if new brand name already exists (excluding current brand)
            $checkStmt = $pdo->prepare("SELECT COUNT(*) as count FROM brands WHERE name = ? AND id != ?");
            $checkStmt->execute([$newName, $brandId]);
            $exists = $checkStmt->fetch()['count'] > 0;

            if ($exists) {
                http_response_code(400);
                echo json_encode(['error' => 'Brand name already exists']);
                exit();
            }

            // Update brand in brands table
            $updateStmt = $pdo->prepare("
                UPDATE brands 
                SET name = ?, description = ?, slug = ?, image = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $result = $updateStmt->execute([$newName, $description, $slug, $image, $brandId]);

            if ($result && !empty($oldName) && $oldName !== $newName) {
                // Update all products with the old brand name to the new brand name
                $updateProductsStmt = $pdo->prepare("
                    UPDATE stiles_products 
                    SET `attribute:pa_brands` = ? 
                    WHERE `attribute:pa_brands` = ? AND status = 'publish'
                ");
                $updateProductsStmt->execute([$newName, $oldName]);
            }

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Brand updated successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update brand']);
            }
            break;

        case 'DELETE':
            // Delete brand (soft delete)
            if (!isset($data['id'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Brand ID is required']);
                exit();
            }

            $brandId = (int)$data['id'];
            $brandName = trim($data['name'] ?? '');

            // Soft delete the brand
            $deleteStmt = $pdo->prepare("UPDATE brands SET is_active = 0 WHERE id = ?");
            $result = $deleteStmt->execute([$brandId]);

            if ($result && !empty($brandName)) {
                // Remove brand from all products
                $removeFromProductsStmt = $pdo->prepare("
                    UPDATE stiles_products 
                    SET `attribute:pa_brands` = '' 
                    WHERE `attribute:pa_brands` = ? AND status = 'publish'
                ");
                $removeFromProductsStmt->execute([$brandName]);
            }

            if ($result) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Brand deleted successfully'
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete brand']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
}
?>
