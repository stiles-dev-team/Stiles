<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$cacheFile = sys_get_temp_dir() . '/iq_stock_cache.json';
$cacheTTL  = 300; // seconds (5 minutes)

// Serve from cache if fresh
if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $cacheTTL) {
    echo file_get_contents($cacheFile);
    exit;
}

$url      = 'https://stiles.southafricanorth.cloudapp.azure.com:5006/Stock/GetAllStockWebItems';
$username = 'WebUser1142';
$password = 'e$Ye6!g]I~X@K!D';

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERPWD        => "$username:$password",
    CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_SSL_VERIFYHOST => false,
    CURLOPT_CONNECTTIMEOUT => 60,
    CURLOPT_TIMEOUT        => 60,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error    = curl_error($ch);

if ($error) {
    // Return stale cache rather than an error if available
    if (file_exists($cacheFile)) {
        echo file_get_contents($cacheFile);
    } else {
        http_response_code(500);
        echo json_encode(['error' => $error]);
    }
    exit;
}

if ($httpCode === 200) {
    $decoded = json_decode($response);
    $output  = $decoded !== null ? json_encode($decoded) : $response;
    file_put_contents($cacheFile, $output);
    echo $output;
} else {
    http_response_code($httpCode);
    echo $response;
}
