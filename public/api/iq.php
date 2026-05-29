<?php
// Allow from any origin
header("Access-Control-Allow-Origin: https://staging.stiles.co.za");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Max-Age: 86400"); // 24 hours

// Set a standard browser-like User-Agent
header("User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Set error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Get the code parameter from either GET or POST
$code = isset($_GET['code']) ? $_GET['code'] : (isset($_POST['code']) ? $_POST['code'] : null);

// Validate the code parameter
if (empty($code)) {
    http_response_code(400);
    echo json_encode(['error' => 'Stock code is required']);
    exit;
}

// Sanitize the code parameter
$code = urlencode(trim($code));

$curl = curl_init();

// Retry configuration
$maxRetries = 3;
$retryCount = 0;
$success = false;

// Test DNS resolution first
$host = 'stiles.southafricanorth.cloudapp.azure.com';
$ip = gethostbyname($host);
$dnsCheck = [
    'host' => $host,
    'resolved_ip' => $ip,
    'is_resolved' => ($ip !== $host)
];

// Test if port is open
$port = 5006;
$connection = @fsockopen($ip, $port, $errno, $errstr, 5);
$portCheck = [
    'port' => $port,
    'is_open' => ($connection !== false),
    'error' => $errstr ?? null
];
if ($connection) {
    fclose($connection);
}

while ($retryCount < $maxRetries && !$success) {
    curl_setopt_array($curl, array(
        CURLOPT_URL => 'https://' . $host . ':5006/Stock/GetByCode?code=' . $code,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 3,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
        CURLOPT_HTTPHEADER => array(
            'Authorization: Basic V2ViVXNlcjExNDI6ZSRZZTYhZ11JflhASyFE'
        ),
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0,
        CURLOPT_VERBOSE => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_DNS_CACHE_TIMEOUT => 2,
        CURLOPT_IPRESOLVE => CURL_IPRESOLVE_V4,
    ));

    // Create a temporary file handle for CURL debug output
    $verbose = fopen('php://temp', 'w+');
    curl_setopt($curl, CURLOPT_STDERR, $verbose);

    $response = curl_exec($curl);
    $curlError = curl_error($curl);
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    $curlInfo = curl_getinfo($curl);

    if (curl_errno($curl)) {
        $retryCount++;
        if ($retryCount < $maxRetries) {
            sleep(2);
            continue;
        }
        
        http_response_code(500);
        echo json_encode([
            'error' => 'Curl error after ' . $maxRetries . ' retries: ' . $curlError,
            'verbose' => stream_get_contents($verbose),
            'curl_info' => $curlInfo,
            'request_url' => 'https://' . $host . ':5006/Stock/GetByCode?code=' . $code,
            'retry_count' => $retryCount,
            'connection_diagnostics' => [
                'dns_check' => $dnsCheck,
                'port_check' => $portCheck,
                'server_ip' => $ip,
                'curl_error_number' => curl_errno($curl),
                'curl_error_string' => $curlError
            ]
        ]);
    } else {
        $success = true;
        $responseData = json_decode($response, true);
        
        if ($httpCode >= 400) {
            http_response_code($httpCode);
        }
        
        echo json_encode([
            'status' => $httpCode,
            'data' => $responseData,
            'curl_info' => $curlInfo,
            'raw_response' => $response,
            'request_url' => 'https://' . $host . ':5006/Stock/GetByCode?code=' . $code,
            'retry_count' => $retryCount,
            'connection_diagnostics' => [
                'dns_check' => $dnsCheck,
                'port_check' => $portCheck,
                'server_ip' => $ip
            ]
        ]);
    }
}

fclose($verbose);
curl_close($curl);
