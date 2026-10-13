<?php
require_once 'config.php';
require_once 'auth.php';

allowCookieCors();
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$token = $_COOKIE['stiles_auth_token'] ?? '';
if ($token !== '') {
    $stmt = $pdo->prepare('UPDATE users SET token = NULL WHERE token = ?');
    $stmt->execute([$token]);
}

clearLoginCookie();

echo json_encode(['message' => 'Logged out']);
