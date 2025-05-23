<?php
// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

// Get the code parameter from either GET or POST
$code = isset($_GET['code']) ? $_GET['code'] : (isset($_POST['code']) ? $_POST['code'] : null);

// Validate the code parameter
if (empty($code)) {
    echo json_encode(['error' => 'Stock code is required']);
    exit;
}

// Sanitize the code parameter
$code = urlencode(trim($code));

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://stiles.southafricanorth.cloudapp.azure.com:5006/Stock/GetByCode?code=' . $code,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Basic V2ViVXNlcjExNDI6ZSRZZTYhZ11JflhASyFE'
  ),
  CURLOPT_SSL_VERIFYPEER => false,  // Disable SSL verification
  CURLOPT_SSL_VERIFYHOST => 0,      // Don't verify the hostname
  CURLOPT_VERBOSE => true,          // Enable verbose output
));

// Create a temporary file handle for CURL debug output
$verbose = fopen('php://temp', 'w+');
curl_setopt($curl, CURLOPT_STDERR, $verbose);

$response = curl_exec($curl);

if(curl_errno($curl)) {
    echo json_encode([
        'error' => 'Curl error: ' . curl_error($curl),
        'verbose' => stream_get_contents($verbose)
    ]);
} else {
    $httpCode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    echo json_encode([
        'status' => $httpCode,
        'data' => json_decode($response, true)
    ]);
}

fclose($verbose);
curl_close($curl);
