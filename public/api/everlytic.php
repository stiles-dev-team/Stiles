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
$email = isset($_GET['email']) ? $_GET['email'] : (isset($_POST['email']) ? $_POST['email'] : null);

// Validate the code parameter
if (empty($email)) {
    echo json_encode(['error' => 'Email is required']);
    exit;
}

// Sanitize the code parameter
$email = urlencode(trim($email));

$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL => 'https://comms21.everlytic.net/api/2.0/contacts?list_id=83129&email=' . $email,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'POST',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Basic ' . base64_encode('renier@boostly.co.za:D9Fh9kO522Gv4s7xtHo5ECr2LtoHwqUr_21'),
    'Cookie: __cf_bm=Ihh83NZtctLsWojLXWc6iXDo3ZJXM.rxqtykrSyLBos-1748014103-1.0.1.1-wMJrOQfFPX5I7CeHhl2TS2e9Gph5MUgfxRlhj.IC4ApKdRBTOu.zfv2rWpN.c7_U0B3oKXAU7e2N08jBC.RX5NePTppJW4HhxJ8ZFLXQtr8; EVSESSIONID=n1fh8v7rtqrrhjh1jeit7a79vc'
  ),
));

$response = curl_exec($curl);

curl_close($curl);
echo $response;
