-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    slug VARCHAR(255) NULL,
    image VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert existing brands from products table
INSERT INTO brands (name, description, slug, created_at)
SELECT DISTINCT 
    `attribute:pa_brands` as name,
    CONCAT('Brand: ', `attribute:pa_brands`) as description,
    LOWER(REPLACE(REPLACE(REPLACE(`attribute:pa_brands`, ' ', '-'), '&', 'and'), '--', '-')) as slug,
    NOW() as created_at
FROM stiles_products 
WHERE status = 'publish' 
    AND `attribute:pa_brands` IS NOT NULL 
    AND `attribute:pa_brands` != ''
    AND `attribute:pa_brands` NOT IN (SELECT name FROM brands)
ORDER BY `attribute:pa_brands`;

-- Show the results
SELECT 
    id,
    name,
    description,
    slug,
    created_at,
    is_active
FROM brands 
ORDER BY name;
