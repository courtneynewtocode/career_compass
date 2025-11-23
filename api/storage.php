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
define('ANALYTICS_DIR', __DIR__ . '/../data/analytics');
define('ACCESS_KEY', 'ae138a37c51dd863e0de53e8c15a0912b1025e9ae0e302aed233c4abfc289e64');

// Ensure storage directories exist
if (!file_exists(STORAGE_DIR)) {
    mkdir(STORAGE_DIR, 0755, true);
}

if (!file_exists(ANALYTICS_DIR)) {
    mkdir(ANALYTICS_DIR, 0755, true);
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

        case 'track_event':
            handleTrackEvent($request);
            break;

        case 'get_analytics':
            handleGetAnalytics($request);
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
    $id = date('Y-m-d_His', (int)$timestamp) . '_' . uniqid();

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

/**
 * Track analytics event
 */
function handleTrackEvent($request) {
    if (!isset($request['event'])) {
        throw new Exception('No event data provided');
    }

    $event = $request['event'];
    $sessionId = $event['sessionId'] ?? 'unknown';
    $testId = $event['testId'] ?? 'unknown';
    $eventName = $event['eventName'] ?? 'unknown';

    // Create filename: date + testId + sessionId + eventName
    $date = date('Y-m-d');
    $timestamp = microtime(true);
    $filename = "{$date}_{$testId}_{$eventName}_{$sessionId}_{$timestamp}.json";
    $filepath = ANALYTICS_DIR . '/' . $filename;

    // Save event to file
    $json = json_encode($event, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (file_put_contents($filepath, $json) === false) {
        throw new Exception('Failed to save analytics event');
    }

    echo json_encode([
        'success' => true,
        'message' => 'Event tracked successfully'
    ]);
}

/**
 * Get analytics summary
 */
function handleGetAnalytics($request) {
    $files = glob(ANALYTICS_DIR . '/*.json');
    $events = [];

    foreach ($files as $file) {
        $content = file_get_contents($file);
        $event = json_decode($content, true);

        if ($event) {
            $events[] = $event;
        }
    }

    // Group events by type for statistics
    $stats = [
        'total_events' => count($events),
        'test_started' => 0,
        'test_completed' => 0,
        'test_abandoned' => 0,
        'email_sent_success' => 0,
        'email_sent_failure' => 0,
        'unique_sessions' => [],
        'by_test' => []
    ];

    foreach ($events as $event) {
        $eventName = $event['eventName'] ?? 'unknown';
        $sessionId = $event['sessionId'] ?? 'unknown';
        $testId = $event['testId'] ?? 'unknown';

        // Count unique sessions
        if (!in_array($sessionId, $stats['unique_sessions'])) {
            $stats['unique_sessions'][] = $sessionId;
        }

        // Count by test
        if (!isset($stats['by_test'][$testId])) {
            $stats['by_test'][$testId] = [
                'started' => 0,
                'completed' => 0,
                'abandoned' => 0
            ];
        }

        // Count event types
        switch ($eventName) {
            case 'test_started':
                $stats['test_started']++;
                $stats['by_test'][$testId]['started']++;
                break;
            case 'test_completed':
                $stats['test_completed']++;
                $stats['by_test'][$testId]['completed']++;
                break;
            case 'test_abandoned':
                $stats['test_abandoned']++;
                $stats['by_test'][$testId]['abandoned']++;
                break;
            case 'email_sent':
                if ($event['data']['success'] ?? false) {
                    $stats['email_sent_success']++;
                } else {
                    $stats['email_sent_failure']++;
                }
                break;
        }
    }

    // Calculate completion rate
    $stats['completion_rate'] = $stats['test_started'] > 0
        ? round(($stats['test_completed'] / $stats['test_started']) * 100, 2)
        : 0;

    // Count unique sessions
    $stats['unique_sessions_count'] = count($stats['unique_sessions']);
    unset($stats['unique_sessions']); // Remove array, keep only count

    echo json_encode([
        'success' => true,
        'stats' => $stats,
        'recent_events' => array_slice(array_reverse($events), 0, 50) // Last 50 events
    ]);
}
