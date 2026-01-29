<?php
/**
 * Diagnostic script to help identify 403 Forbidden issues
 * Access this file directly via browser: https://stiles.co.za/api/diagnose-403.php
 */

// Set headers first
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, Accept');
header('Content-Type: text/html; charset=utf-8');

?>
<!DOCTYPE html>
<html>
<head>
    <title>403 Diagnostic Tool</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .section { background: white; padding: 20px; margin: 10px 0; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .success { color: green; }
        .error { color: red; }
        .warning { color: orange; }
        pre { background: #f0f0f0; padding: 10px; border-radius: 3px; overflow-x: auto; }
        h2 { margin-top: 0; }
    </style>
</head>
<body>
    <h1>403 Forbidden Diagnostic Tool</h1>
    
    <div class="section">
        <h2>Server Information</h2>
        <p><strong>PHP Version:</strong> <?php echo phpversion(); ?></p>
        <p><strong>Server Software:</strong> <?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></p>
        <p><strong>Request Method:</strong> <?php echo $_SERVER['REQUEST_METHOD']; ?></p>
        <p><strong>Script Path:</strong> <?php echo __FILE__; ?></p>
        <p><strong>Document Root:</strong> <?php echo $_SERVER['DOCUMENT_ROOT'] ?? 'Unknown'; ?></p>
    </div>

    <div class="section">
        <h2>File Permissions</h2>
        <?php
        $file = __FILE__;
        $dir = dirname(__FILE__);
        echo "<p><strong>File:</strong> $file</p>";
        echo "<p><strong>File Permissions:</strong> " . substr(sprintf('%o', fileperms($file)), -4) . "</p>";
        echo "<p><strong>Directory:</strong> $dir</p>";
        echo "<p><strong>Directory Permissions:</strong> " . substr(sprintf('%o', fileperms($dir)), -4) . "</p>";
        echo "<p><strong>File Owner:</strong> " . (function_exists('posix_getpwuid') ? posix_getpwuid(fileowner($file))['name'] : 'Unknown') . "</p>";
        echo "<p><strong>File Group:</strong> " . (function_exists('posix_getgrgid') ? posix_getgrgid(filegroup($file))['name'] : 'Unknown') . "</p>";
        ?>
    </div>

    <div class="section">
        <h2>PHP Configuration</h2>
        <p><strong>upload_max_filesize:</strong> <?php echo ini_get('upload_max_filesize'); ?></p>
        <p><strong>post_max_size:</strong> <?php echo ini_get('post_max_size'); ?></p>
        <p><strong>max_file_uploads:</strong> <?php echo ini_get('max_file_uploads'); ?></p>
        <p><strong>max_execution_time:</strong> <?php echo ini_get('max_execution_time'); ?> seconds</p>
        <p><strong>memory_limit:</strong> <?php echo ini_get('memory_limit'); ?></p>
    </div>

    <div class="section">
        <h2>Request Headers</h2>
        <pre><?php print_r(getallheaders()); ?></pre>
    </div>

    <div class="section">
        <h2>POST Test</h2>
        <?php if ($_SERVER['REQUEST_METHOD'] === 'POST'): ?>
            <p class="success">✓ POST request received successfully!</p>
            <p><strong>POST Data:</strong></p>
            <pre><?php print_r($_POST); ?></pre>
            <p><strong>FILES Data:</strong></p>
            <pre><?php print_r($_FILES); ?></pre>
        <?php else: ?>
            <p class="warning">This is a GET request. Try submitting a POST request to test.</p>
            <form method="POST" enctype="multipart/form-data">
                <p>
                    <label>Test Text Field:</label><br>
                    <input type="text" name="test_field" value="test value">
                </p>
                <p>
                    <label>Test File Upload:</label><br>
                    <input type="file" name="test_file">
                </p>
                <p>
                    <button type="submit">Submit POST Request</button>
                </p>
            </form>
        <?php endif; ?>
    </div>

    <div class="section">
        <h2>Environment Variables</h2>
        <pre><?php 
        $envVars = [
            'REQUEST_URI' => $_SERVER['REQUEST_URI'] ?? 'Not set',
            'SCRIPT_NAME' => $_SERVER['SCRIPT_NAME'] ?? 'Not set',
            'PHP_SELF' => $_SERVER['PHP_SELF'] ?? 'Not set',
            'HTTP_HOST' => $_SERVER['HTTP_HOST'] ?? 'Not set',
            'SERVER_NAME' => $_SERVER['SERVER_NAME'] ?? 'Not set',
            'HTTPS' => $_SERVER['HTTPS'] ?? 'Not set',
        ];
        print_r($envVars);
        ?></pre>
    </div>

    <div class="section">
        <h2>Diagnostic Recommendations</h2>
        <ol>
            <li><strong>If you see this page:</strong> GET requests work. The issue is specifically with POST requests.</li>
            <li><strong>If POST test fails:</strong> Check mod_security logs, Apache error logs, and server configuration.</li>
            <li><strong>Check file permissions:</strong> Files should be readable (644) and directories executable (755).</li>
            <li><strong>Contact hosting provider:</strong> Ask them to check mod_security rules blocking POST to /api/ directory.</li>
            <li><strong>Check .htaccess:</strong> Ensure the API .htaccess file is uploaded and not being overridden.</li>
        </ol>
    </div>
</body>
</html>
