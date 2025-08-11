<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once 'config.php';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $page = isset($_GET['page']) ? $_GET['page'] : '';
        
        if (empty($page)) {
            echo json_encode(['success' => false, 'message' => 'Page parameter is required']);
            exit;
        }
        
        try {
            // Check if content table exists, if not create it
            $pdo->exec("CREATE TABLE IF NOT EXISTS page_content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                page_name VARCHAR(255) NOT NULL UNIQUE,
                content JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            
            $stmt = $pdo->prepare("SELECT content FROM page_content WHERE page_name = ?");
            $stmt->execute([$page]);
            $result = $stmt->fetch();
            
            if ($result) {
                $content = json_decode($result['content'], true);
            } else {
                // Return default content based on page
                $content = getDefaultContent($page);
            }
            
            echo json_encode(['success' => true, 'content' => $content]);
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error fetching content: ' . $e->getMessage()]);
        }
        break;
        
    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['page']) || !isset($input['content'])) {
            echo json_encode(['success' => false, 'message' => 'Page and content are required']);
            exit;
        }
        
        $page = $input['page'];
        $content = $input['content'];
        
        try {
            // Check if content table exists, if not create it
            $pdo->exec("CREATE TABLE IF NOT EXISTS page_content (
                id INT AUTO_INCREMENT PRIMARY KEY,
                page_name VARCHAR(255) NOT NULL UNIQUE,
                content JSON NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )");
            
            // Use INSERT ... ON DUPLICATE KEY UPDATE for upsert
            $stmt = $pdo->prepare("INSERT INTO page_content (page_name, content) VALUES (?, ?) 
                                  ON DUPLICATE KEY UPDATE content = VALUES(content), updated_at = CURRENT_TIMESTAMP");
            $result = $stmt->execute([$page, json_encode($content)]);
            
            if ($result) {
                echo json_encode(['success' => true, 'message' => 'Content saved successfully']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error saving content']);
            }
            
        } catch(PDOException $e) {
            echo json_encode(['success' => false, 'message' => 'Error saving content: ' . $e->getMessage()]);
        }
        break;
        
    default:
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

function getDefaultContent($page) {
    switch ($page) {
        case 'home':
            return [
                'hero' => [
                    'slides' => [
                        [
                            'id' => 1,
                            'title' => 'Quality and Style Specially Handpicked for You',
                            'subtitle' => '',
                            'background_image' => '/images/Website_Banners.jpg',
                            'button_text' => 'Know More',
                            'button_link' => '#whoweareHome'
                        ],
                        [
                            'id' => 2,
                            'title' => 'Quality and Style Specially Handpicked for You',
                            'subtitle' => '',
                            'background_image' => '/images/Website_Banners2.jpg',
                            'button_text' => 'Know More',
                            'button_link' => '#whoweareHome'
                        ],
                        [
                            'id' => 3,
                            'title' => 'Quality and Style Specially Handpicked for You',
                            'subtitle' => '',
                            'background_image' => '/images/Website_Banners3.jpg',
                            'button_text' => 'Know More',
                            'button_link' => '#whoweareHome'
                        ],
                        [
                            'id' => 4,
                            'title' => 'Quality and Style Specially Handpicked for You',
                            'subtitle' => '',
                            'background_image' => '/images/Website_Banners4.jpg',
                            'button_text' => 'Know More',
                            'button_link' => '#whoweareHome'
                        ]
                    ]
                ],
                'whoWeAre' => [
                    'title' => 'WE ARE STILES',
                    'paragraph1' => 'At Stiles, we\'re all about keeping things stylish, in your home, your office, your restaurant, and any space you can imagine! Our goal at Stiles is to be exclusive and unique, offering only the best quality tiles and sanitaryware in South Africa. Quality and style will always outweigh price when we select products.',
                    'paragraph2' => 'Along with importing products from top tile and sanitaryware factories across the globe, we pride ourselves in being a community-driven South African company. Stiles supports local industry, artisans and artists from South Africa. We believe in the tiles and sanitaryware we market, and employ creative people with an enthusiasm to keep all things stylish, making us leaders in service, technical advice, creative ability and innovative ideas.'
                ],
                'ourProducts' => [
                    'title' => 'Our Products',
                    'subtitle' => 'Discover our curated collection',
                    'featured_products' => [],
                    'category' => 'Tiles'
                ],
                'subscribeBanner' => [
                    'title' => 'Subscribe to our newsletter',
                    'subtitle' => 'Get the latest updates and exclusive offers',
                    'placeholder' => 'Enter your email'
                ],
                'shopCategory' => [
                    'title' => 'Shop by category',
                    'subtitle' => 'Find what you\'re looking for',
                    'categories' => [
                        [
                            'id' => 1,
                            'name' => 'Floor Tiles',
                            'image' => '/images/floor_tiles.webp',
                            'link' => '/product-category/tiles/floor-tiles',
                            'position' => 'row-span-2'
                        ],
                        [
                            'id' => 2,
                            'name' => 'Bathrooms',
                            'image' => '/images/bathrooms.jpg',
                            'link' => '/product-category/sanitary-ware/bathroom-accessories',
                            'position' => 'default'
                        ],
                        [
                            'id' => 3,
                            'name' => 'Kitchen Sinks',
                            'image' => '/images/kitchen_sinks.jpg',
                            'link' => '/product-category/sanitary-ware/kitchen-sinks',
                            'position' => 'col-start-2 row-start-2'
                        ],
                        [
                            'id' => 4,
                            'name' => 'Mosaics',
                            'image' => '/images/mosaics.png',
                            'link' => '/product-category/tiles/mosaics',
                            'position' => 'row-span-2 col-start-3 row-start-1'
                        ]
                    ]
                ],
                'weWorkWithTheBest' => [
                    'title' => 'We Work With The Best',
                    'subtitle' => 'Partnering with leading brands'
                ],
                'blog' => [
                    'title' => 'Latest from our blog',
                    'subtitle' => 'Stay updated with the latest trends'
                ]
            ];
            
        case 'about':
            return [
                'title' => 'About Us',
                'subtitle' => 'Learn more about Stiles',
                'content' => 'About page content...'
            ];
            
        case 'contact':
            return [
                'title' => 'Contact Us',
                'subtitle' => 'Get in touch with us',
                'content' => 'Contact page content...'
            ];
            
        default:
            return [];
    }
}
?>
