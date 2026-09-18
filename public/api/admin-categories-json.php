<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$categoriesFile = '../data/navbar-categories.json';

// Function to read categories from JSON file
function readCategories() {
    global $categoriesFile;
    
    if (!file_exists($categoriesFile)) {
        return [];
    }
    
    $content = file_get_contents($categoriesFile);
    $categories = json_decode($content, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [];
    }
    
    return $categories ?: [];
}

// Function to write categories to JSON file
function writeCategories($categories) {
    global $categoriesFile;
    
    $json = json_encode($categories, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return false;
    }
    
    return file_put_contents($categoriesFile, $json) !== false;
}

// Function to generate unique term_id
function generateTermId($categories) {
    $maxId = 0;
    foreach ($categories as $category) {
        if (isset($category['term_id']) && $category['term_id'] > $maxId) {
            $maxId = $category['term_id'];
        }
    }
    return $maxId + 1;
}

// Function to generate slug from name
function generateSlug($name) {
    return strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $name), '-'));
}

// Normalize category label for comparison (NBSP + HTML entities)
function normalizeCategoryLabel($name) {
    $name = str_replace("\xC2\xA0", ' ', (string)$name);
    $name = html_entity_decode($name, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    return trim($name);
}

// Encode & the same way product category queries expect
function encodeCategoryLabelForDb($name) {
    $decoded = normalizeCategoryLabel($name);
    return str_replace('&', '&amp;', $decoded);
}

/**
 * Replace an exact category label inside stiles_products.product_category
 * (comma-separated list). Returns number of products updated, or -1 on DB error.
 */
function updateProductCategoryLabels($oldName, $newName) {
    $oldNormalized = normalizeCategoryLabel($oldName);
    $newNormalized = normalizeCategoryLabel($newName);

    if ($oldNormalized === '' || $oldNormalized === $newNormalized) {
        return 0;
    }

    try {
        require_once __DIR__ . '/config.php';
    } catch (Exception $e) {
        error_log('Failed to load config for category label update: ' . $e->getMessage());
        return -1;
    }

    global $pdo;
    if (!$pdo) {
        return -1;
    }

    try {
        $oldEncoded = encodeCategoryLabelForDb($oldNormalized);
        $newEncoded = encodeCategoryLabelForDb($newNormalized);

        $stmt = $pdo->prepare(
            'SELECT ID, product_category FROM stiles_products
             WHERE product_category LIKE ? OR product_category LIKE ?'
        );
        $stmt->execute([
            '%' . $oldNormalized . '%',
            '%' . $oldEncoded . '%'
        ]);

        $updateStmt = $pdo->prepare(
            'UPDATE stiles_products SET product_category = ? WHERE ID = ?'
        );

        $updatedCount = 0;

        foreach ($stmt->fetchAll() as $row) {
            $parts = explode(',', (string)$row['product_category']);
            $changed = false;

            foreach ($parts as &$part) {
                $trimmed = trim(str_replace("\xC2\xA0", ' ', $part));
                if ($trimmed === '') {
                    continue;
                }

                if (normalizeCategoryLabel($trimmed) !== $oldNormalized) {
                    continue;
                }

                // Preserve HTML-entity style when the stored label used it
                $part = ($trimmed !== normalizeCategoryLabel($trimmed))
                    ? $newEncoded
                    : $newNormalized;
                $changed = true;
            }
            unset($part);

            if ($changed) {
                // Keep ", " join style used by admin product saves
                $rebuilt = implode(', ', array_map('trim', $parts));
                $updateStmt->execute([$rebuilt, $row['ID']]);
                $updatedCount++;
            }
        }

        return $updatedCount;
    } catch (Exception $e) {
        error_log('Failed to update product category labels: ' . $e->getMessage());
        return -1;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            $categories = readCategories();
            
            // Convert to the format expected by the frontend
            $formattedCategories = array_map(function($category) {
                return [
                    'id' => $category['term_id'],
                    'category' => $category['name'],
                    'slug' => $category['slug'],
                    'description' => $category['description'] ?? '',
                    'parent' => (int)$category['parent'] ?? 0,
                    'thumbnail' => $category['thumbnail'] ?? ''
                ];
            }, $categories);
            
            echo json_encode([
                'success' => true,
                'categories' => $formattedCategories
            ]);
            break;
            
        case 'POST':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['category']) || empty(trim($input['category']))) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Category name is required'
                ]);
                exit;
            }
            
            $categories = readCategories();
            $newCategory = [
                'term_id' => generateTermId($categories),
                'name' => trim($input['category']),
                'slug' => generateSlug($input['category']),
                'description' => $input['description'] ?? '',
                'display_type' => 'default',
                'parent' => (int)$input['parent'] ?? 0,
                'thumbnail' => $input['thumbnail'] ?? ''
            ];
            
            $categories[] = $newCategory;
            
            if (writeCategories($categories)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Category created successfully',
                    'category' => [
                        'id' => $newCategory['term_id'],
                        'category' => $newCategory['name'],
                        'slug' => $newCategory['slug'],
                        'description' => $newCategory['description'],
                        'parent' => (int)$newCategory['parent'],
                        'thumbnail' => $newCategory['thumbnail']
                    ]
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to save category'
                ]);
            }
            break;
            
        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id']) || !isset($input['category']) || empty(trim($input['category']))) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Category ID and name are required'
                ]);
                exit;
            }
            
            $categories = readCategories();
            $found = false;
            $oldName = '';
            $newName = trim($input['category']);
            
            foreach ($categories as &$category) {
                if ($category['term_id'] == $input['id']) {
                    $oldName = $category['name'] ?? '';
                    $category['name'] = $newName;
                    $category['slug'] = generateSlug($input['category']);
                    if (isset($input['description'])) {
                        $category['description'] = $input['description'];
                    }
                    if (isset($input['parent'])) {
                        $category['parent'] = (int)$input['parent'];
                    }
                    if (isset($input['thumbnail'])) {
                        $category['thumbnail'] = $input['thumbnail'];
                    }
                    $found = true;
                    break;
                }
            }
            unset($category);
            
            if (!$found) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Category not found'
                ]);
                exit;
            }
            
            if (writeCategories($categories)) {
                $productsUpdated = 0;
                if ($oldName !== '' && normalizeCategoryLabel($oldName) !== normalizeCategoryLabel($newName)) {
                    $productsUpdated = updateProductCategoryLabels($oldName, $newName);
                }

                $response = [
                    'success' => true,
                    'message' => 'Category updated successfully'
                ];
                if ($productsUpdated >= 0) {
                    $response['products_updated'] = $productsUpdated;
                } else {
                    $response['warning'] = 'Category saved, but product labels could not be updated';
                }

                echo json_encode($response);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to update category'
                ]);
            }
            break;
            
        case 'DELETE':
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['id'])) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Category ID is required'
                ]);
                exit;
            }
            
            $categories = readCategories();
            $filteredCategories = array_filter($categories, function($category) use ($input) {
                return $category['term_id'] != $input['id'];
            });
            
            // Re-index the array to maintain proper JSON structure
            $filteredCategories = array_values($filteredCategories);
            
            if (writeCategories($filteredCategories)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Category deleted successfully'
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'error' => 'Failed to delete category'
                ]);
            }
            break;
            
        default:
            echo json_encode([
                'success' => false,
                'error' => 'Method not allowed'
            ]);
            http_response_code(405);
            break;
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Server error: ' . $e->getMessage()
    ]);
    http_response_code(500);
}
?>
