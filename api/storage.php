<?php
/**
 * Local Storage API for Assessment Results
 *
 * This simple API saves assessment results to local JSON files
 * and can be easily migrated to a database later.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
define('STORAGE_DIR', __DIR__ . '/../data/results');
define('ACCESS_KEY', 'ae138a37c51dd863e0de53e8c15a0912b1025e9ae0e302aed233c4abfc289e64');

// Ensure storage directory exists
if (!file_exists(STORAGE_DIR)) {
    mkdir(STORAGE_DIR, 0755, true);
}

// Get request data
$rawInput = file_get_contents('php://input');
$request = json_decode($rawInput, true);

// Validate access key
if (!isset($request['access_key']) || $request['access_key'] !== ACCESS_KEY) {
    echo json_encode([
        'success' => false,
        'message' => 'Invalid access key'
    ]);
    http_response_code(403);
    exit();
}

$action = $request['action'] ?? '';

try {
    switch ($action) {
        case 'save':
            handleSave($request);
            break;

        case 'list':
            handleList();
            break;

        case 'get':
            handleGet($request);
            break;

        case 'delete':
            handleDelete($request);
            break;

        default:
            throw new Exception('Invalid action: ' . $action);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
    http_response_code(500);
}

/**
 * Save a new result
 */
function handleSave($request) {
    if (!isset($request['data'])) {
        throw new Exception('No data provided');
    }

    $data = $request['data'];

    // Generate unique ID
    $timestamp = microtime(true);
    $id = date('Y-m-d_His', $timestamp) . '_' . uniqid();

    // Add ID to data
    $data['id'] = $id;

    // Create filename
    $studentName = sanitizeFilename($data['demographics']['studentName'] ?? 'Unknown');
    $testId = $data['testId'] ?? 'unknown';
    $filename = "{$id}_{$testId}_{$studentName}.json";
    $filepath = STORAGE_DIR . '/' . $filename;

    // Save to file
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (file_put_contents($filepath, $json) === false) {
        throw new Exception('Failed to save result');
    }

    echo json_encode([
        'success' => true,
        'id' => $id,
        'filename' => $filename,
        'message' => 'Result saved successfully'
    ]);
}

/**
 * List all results
 */
function handleList() {
    $files = glob(STORAGE_DIR . '/*.json');
    $results = [];

    foreach ($files as $file) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);

        if ($data) {
            $results[] = $data;
        }
    }

    // Sort by submission date (newest first)
    usort($results, function($a, $b) {
        return strtotime($b['submittedAt']) - strtotime($a['submittedAt']);
    });

    echo json_encode([
        'success' => true,
        'data' => $results,
        'count' => count($results)
    ]);
}

/**
 * Get a specific result by ID
 */
function handleGet($request) {
    if (!isset($request['id'])) {
        throw new Exception('No ID provided');
    }

    $id = $request['id'];
    $files = glob(STORAGE_DIR . "/{$id}_*.json");

    if (empty($files)) {
        throw new Exception('Result not found');
    }

    $content = file_get_contents($files[0]);
    $data = json_decode($content, true);

    if (!$data) {
        throw new Exception('Invalid result data');
    }

    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
}

/**
 * Delete a result by ID
 */
function handleDelete($request) {
    if (!isset($request['id'])) {
        throw new Exception('No ID provided');
    }

    $id = $request['id'];
    $files = glob(STORAGE_DIR . "/{$id}_*.json");

    if (empty($files)) {
        throw new Exception('Result not found');
    }

    if (unlink($files[0])) {
        echo json_encode([
            'success' => true,
            'message' => 'Result deleted successfully'
        ]);
    } else {
        throw new Exception('Failed to delete result');
    }
}

/**
 * Sanitize filename
 */
function sanitizeFilename($string) {
    // Remove any character that isn't alphanumeric, underscore, hyphen, or space
    $string = preg_replace('/[^a-zA-Z0-9_\- ]/', '', $string);
    // Replace spaces with underscores
    $string = str_replace(' ', '_', $string);
    // Limit length
    $string = substr($string, 0, 50);
    return $string;
}
