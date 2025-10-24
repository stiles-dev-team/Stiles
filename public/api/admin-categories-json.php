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
                    'parent' => $category['parent'] ?? 0,
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
                'parent' => $input['parent'] ?? 0,
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
                        'parent' => $newCategory['parent'],
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
            
            foreach ($categories as &$category) {
                if ($category['term_id'] == $input['id']) {
                    $category['name'] = trim($input['category']);
                    $category['slug'] = generateSlug($input['category']);
                    if (isset($input['description'])) {
                        $category['description'] = $input['description'];
                    }
                    if (isset($input['parent'])) {
                        $category['parent'] = $input['parent'];
                    }
                    if (isset($input['thumbnail'])) {
                        $category['thumbnail'] = $input['thumbnail'];
                    }
                    $found = true;
                    break;
                }
            }
            
            if (!$found) {
                echo json_encode([
                    'success' => false,
                    'error' => 'Category not found'
                ]);
                exit;
            }
            
            if (writeCategories($categories)) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Category updated successfully'
                ]);
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
