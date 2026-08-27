<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$menuItemsFile = '../data/menu-items.json';

function readMenus() {
    global $menuItemsFile;
    if (!file_exists($menuItemsFile)) {
        return ['menus' => []];
    }
    $content = file_get_contents($menuItemsFile);
    $data = json_decode($content, true);
    if (!is_array($data)) {
        return ['menus' => []];
    }
    if (!isset($data['menus']) || !is_array($data['menus'])) {
        $data['menus'] = [];
    }
    return $data;
}

function writeMenus($data) {
    global $menuItemsFile;
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    return file_put_contents($menuItemsFile, $json) !== false;
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            echo json_encode([
                'success' => true,
                'menus' => readMenus()['menus']
            ]);
            break;

        case 'PUT':
            $input = json_decode(file_get_contents('php://input'), true);

            if (!isset($input['menus']) || !is_array($input['menus'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'menus array is required']);
                break;
            }

            if (writeMenus(['menus' => $input['menus']])) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Menu items updated successfully',
                    'menus' => $input['menus']
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'error' => 'Failed to save menu items']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
?>
