<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$blogsFile = '../data/blogs.json';

if (file_exists($blogsFile)) {
    $blogs = json_decode(file_get_contents($blogsFile), true);
    echo json_encode(['success' => true, 'blogs' => $blogs]);
} else {
    echo json_encode(['success' => false, 'error' => 'Blogs file not found']);
}
?>
