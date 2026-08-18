<?php
/**
 * Server-side Open Graph meta tags for blog post sharing.
 * Serves index.html with injected OG/Twitter meta so social crawlers
 * receive correct preview data before React hydrates the page.
 */

ob_start();

require_once __DIR__ . '/config.php';

header('Content-Type: text/html; charset=UTF-8');
header('Cache-Control: public, max-age=300');

const SITE_URL = 'https://stiles.co.za';
const DEFAULT_OG_IMAGE = 'https://stiles.co.za/images/logo.png';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

function getBlogBySlug(PDO $pdo, string $slug): ?array
{
    $stmt = $pdo->prepare(
        "SELECT * FROM blogs WHERE slug = ? AND post_status = 'publish' LIMIT 1"
    );
    $stmt->execute([$slug]);
    $blog = $stmt->fetch(PDO::FETCH_ASSOC);

    return $blog ?: null;
}

function getMetaDescription(array $blog): string
{
    $description = trim($blog['metadescription'] ?? '');
    if ($description !== '' && strtoupper($description) !== 'NULL') {
        return $description;
    }

    $excerpt = trim($blog['post_excerpt'] ?? '');
    if ($excerpt !== '' && strtoupper($excerpt) !== 'NULL') {
        return $excerpt;
    }

    return '';
}

function getShareImage(array $blog): string
{
    $image = trim($blog['featured_image'] ?? '');
    if ($image === '') {
        return DEFAULT_OG_IMAGE;
    }

    $image = preg_replace('/^http:\/\//i', 'https://', $image);

    if (!preg_match('/^https?:\/\//i', $image)) {
        $image = SITE_URL . (str_starts_with($image, '/') ? '' : '/') . $image;
    }

    return $image;
}

function getMetaTitle(array $blog): string
{
    return $blog['post_title'] . ' | Stiles';
}

function getShareUrl(array $blog): string
{
    return SITE_URL . '/stiles-blog/' . rawurlencode($blog['slug']);
}

function escape(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function buildMetaTags(array $blog): string
{
    $title = getMetaTitle($blog);
    $description = getMetaDescription($blog);
    $shareUrl = getShareUrl($blog);
    $shareImage = getShareImage($blog);

    $tags = [
        '<title>' . escape($title) . '</title>',
        '<meta name="description" content="' . escape($description) . '">',
        '<meta property="og:title" content="' . escape($title) . '">',
        '<meta property="og:description" content="' . escape($description) . '">',
        '<meta property="og:type" content="website">',
        '<meta property="og:url" content="' . escape($shareUrl) . '">',
        '<meta property="og:site_name" content="Stiles">',
        '<meta property="og:locale" content="en_ZA">',
        '<meta property="og:image" content="' . escape($shareImage) . '">',
        '<meta property="og:image:secure_url" content="' . escape($shareImage) . '">',
        '<meta property="og:image:width" content="' . OG_IMAGE_WIDTH . '">',
        '<meta property="og:image:height" content="' . OG_IMAGE_HEIGHT . '">',
        '<meta property="og:image:alt" content="' . escape($blog['post_title']) . '">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="' . escape($title) . '">',
        '<meta name="twitter:description" content="' . escape($description) . '">',
        '<meta name="twitter:image" content="' . escape($shareImage) . '">',
        '<link rel="canonical" href="' . escape($shareUrl) . '">',
    ];

    if (!empty($blog['categories'])) {
        foreach (array_slice(array_map('trim', explode(',', $blog['categories'])), 0, 5) as $category) {
            if ($category !== '') {
                $tags[] = '<meta property="article:section" content="' . escape($category) . '">';
            }
        }
    }

    return implode("\n    ", $tags);
}

function buildStructuredData(array $blog): string
{
    $description = getMetaDescription($blog);
    $shareUrl = getShareUrl($blog);
    $shareImage = getShareImage($blog);

    $structuredData = [
        '@context' => 'https://schema.org',
        '@type' => 'BlogPosting',
        'headline' => $blog['post_title'],
        'description' => $description,
        'url' => $shareUrl,
        'image' => [$shareImage],
        'author' => [
            '@type' => 'Organization',
            'name' => 'Stiles',
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => 'Stiles',
            'logo' => [
                '@type' => 'ImageObject',
                'url' => DEFAULT_OG_IMAGE,
            ],
        ],
    ];

    $json = json_encode(
        $structuredData,
        JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT
    );

    return '<script type="application/ld+json">' . "\n    " . $json . "\n    </script>";
}

function serveSpa(string $indexPath, int $statusCode = 200): void
{
    http_response_code($statusCode);
    readfile($indexPath);
    exit;
}

function injectBlogMeta(string $html, array $blog): string
{
    $injectedHead = buildMetaTags($blog) . "\n    " . buildStructuredData($blog);

    $html = preg_replace('/<title>.*?<\/title>/is', '', $html, 1);
    $html = preg_replace('/<meta\s+name="description"[^>]*>/i', '', $html, 1);
    $html = preg_replace('/<link\s+rel="canonical"[^>]*>/i', '', $html, 1);

    return preg_replace('/<\/head>/i', "    {$injectedHead}\n  </head>", $html, 1);
}

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';
$indexPath = dirname(__DIR__) . '/index.html';

if ($slug === '' || $slug === 'category') {
    serveSpa($indexPath);
}

$blog = getBlogBySlug($pdo, $slug);

if (!$blog || !file_exists($indexPath)) {
    serveSpa($indexPath, $blog ? 200 : 404);
}

echo injectBlogMeta(file_get_contents($indexPath), $blog);

if (ob_get_level() > 0) {
    ob_end_flush();
}
