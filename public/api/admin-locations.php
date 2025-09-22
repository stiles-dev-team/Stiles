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

// Include config for database connection
require_once 'config.php';

// No authentication required - matches other admin APIs

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Path to the locations JSON file
$locationsFile = '../data/stiles-locations.json';

function readLocations() {
    global $locationsFile;
    if (!file_exists($locationsFile)) {
        return ['locations' => []];
    }
    $content = file_get_contents($locationsFile);
    return json_decode($content, true);
}

function writeLocations($data) {
    global $locationsFile;
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    return file_put_contents($locationsFile, $json) !== false;
}

function validateLocation($location) {
    $required = ['title', 'region', 'phone', 'address', 'email', 'hours'];
    foreach ($required as $field) {
        if (!isset($location[$field]) || empty($location[$field])) {
            return false;
        }
    }
    return true;
}

try {
    switch ($method) {
        case 'GET':
            $data = readLocations();
            echo json_encode($data);
            break;

        case 'POST':
            // Add new location
            if (!isset($input['location']) || !validateLocation($input['location'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid location data']);
                break;
            }

            $data = readLocations();
            $newLocation = $input['location'];
            
            // Add default values if not provided
            if (!isset($newLocation['google_iframe'])) {
                $newLocation['google_iframe'] = null;
            }
            if (!isset($newLocation['google_maps'])) {
                $newLocation['google_maps'] = '';
            }
            if (!isset($newLocation['phone_after_hours'])) {
                $newLocation['phone_after_hours'] = '';
            }

            $data['locations'][] = $newLocation;

            if (writeLocations($data)) {
                echo json_encode(['success' => true, 'message' => 'Location added successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to save location']);
            }
            break;

        case 'PUT':
            // Update existing location
            if (!isset($input['index']) || !isset($input['location']) || !validateLocation($input['location'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid location data or index']);
                break;
            }

            $data = readLocations();
            $index = (int)$input['index'];

            if ($index < 0 || $index >= count($data['locations'])) {
                http_response_code(404);
                echo json_encode(['error' => 'Location not found']);
                break;
            }

            $data['locations'][$index] = $input['location'];

            if (writeLocations($data)) {
                echo json_encode(['success' => true, 'message' => 'Location updated successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to update location']);
            }
            break;

        case 'DELETE':
            // Delete location
            if (!isset($input['index'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Index required']);
                break;
            }

            $data = readLocations();
            $index = (int)$input['index'];

            if ($index < 0 || $index >= count($data['locations'])) {
                http_response_code(404);
                echo json_encode(['error' => 'Location not found']);
                break;
            }

            array_splice($data['locations'], $index, 1);

            if (writeLocations($data)) {
                echo json_encode(['success' => true, 'message' => 'Location deleted successfully']);
            } else {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to delete location']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
