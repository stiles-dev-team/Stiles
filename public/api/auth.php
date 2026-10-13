<?php

function allowCookieCors() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '') {
        return;
    }

    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

function loginCookieOptions($expires) {
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

    return [
        'expires' => $expires,
        'path' => '/',
        'secure' => $https,
        'httponly' => true,
        'samesite' => 'Lax',
    ];
}

function setLoginCookie($token) {
    setcookie('stiles_auth_token', $token, loginCookieOptions(time() + 60 * 60 * 24 * 7));
}

function clearLoginCookie() {
    setcookie('stiles_auth_token', '', loginCookieOptions(time() - 3600));
}

function requireAdmin($pdo) {
    allowCookieCors();

    $token = $_COOKIE['stiles_auth_token'] ?? '';
    if ($token === '') {
        http_response_code(401);
        echo json_encode(['error' => 'No token provided']);
        exit();
    }

    $stmt = $pdo->prepare('SELECT id FROM users WHERE token = ? AND is_active = 1 AND is_admin = 1');
    $stmt->execute([$token]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(403);
        echo json_encode(['error' => 'Admin access required']);
        exit();
    }

    return $user;
}
