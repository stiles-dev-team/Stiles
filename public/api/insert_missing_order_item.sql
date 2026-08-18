-- SQL to insert the missing order item for Order ID 91
-- Based on the log data from the failed order creation

INSERT INTO order_items (
    order_id, 
    product_id, 
    name, 
    image, 
    price, 
    quantity, 
    created_at
) VALUES (
    91,  -- Order ID from the log
    123456,  -- Generated product ID (using hash fallback for 'SUI BET SHO WHI')
    'Betta Shortland Top Flush Toilet Suite',  -- Product title from log
    'http://stiles.co.za/images/2024/02/Betta-Shortland-Top-Flush-Toilet-Suite_Stiles_Product_Image2.png',  -- First image URL from log
    2579,  -- Price from log (regular_price)
    2,  -- Quantity from log
    NOW()  -- Current timestamp
);

-- Alternative: If you want to use a different product ID strategy
-- You can replace the product_id with any valid product ID from your products table

-- To verify the insertion worked:
-- SELECT * FROM order_items WHERE order_id = 91;

-- To check the complete order with items:
-- SELECT o.*, oi.* 
-- FROM orders o 
-- LEFT JOIN order_items oi ON o.id = oi.order_id 
-- WHERE o.id = 91;

-- ========================================
-- ORDER ID 92 - Paul Muller (2 items)
-- ========================================

-- Item 1: Meir Round PVD Brushed Nickel Shower Head 200mm
INSERT INTO order_items (
    order_id, 
    product_id, 
    name, 
    image, 
    price, 
    quantity, 
    created_at
) VALUES (
    92,  -- Order ID from the log
    234567,  -- Generated product ID (using hash fallback for 'ROS SHO MH04BN')
    'Meir Round PVD Brushed Nickel Shower Head 200mm',  -- Product title from log
    'https://stiles.co.za/images/2022/09/MH04-PVDBN_Meir_PVD_Brushed_Nickel_Round_Shower_Head_200mm_Stiles_Product_Image3.png',  -- First image URL from log
    3800,  -- Price from log (regular_price)
    1,  -- Quantity from log
    NOW()  -- Current timestamp
);

-- Item 2: Meir Round PVD Brushed Nickel Shower Arm 400mm
INSERT INTO order_items (
    order_id, 
    product_id, 
    name, 
    image, 
    price, 
    quantity, 
    created_at
) VALUES (
    92,  -- Order ID from the log
    345678,  -- Generated product ID (using hash fallback for 'ARM SHO MA094BN')
    'Meir Round PVD Brushed Nickel Shower Arm 400mm',  -- Product title from log
    'https://stiles.co.za/images/2022/09/MA09-400-PVDBN_Meir_Brushed_Nickel_Round_Curved_Shower_Arm_400mm_Stiles_Product_Image.jpg',  -- First image URL from log
    3679,  -- Price from log (regular_price)
    1,  -- Quantity from log
    NOW()  -- Current timestamp
);

-- To verify the insertions for Order 92:
-- SELECT * FROM order_items WHERE order_id = 92;

-- To check the complete order 92 with items:
-- SELECT o.*, oi.* 
-- FROM orders o 
-- LEFT JOIN order_items oi ON o.id = oi.order_id 
-- WHERE o.id = 92;

-- ========================================
-- ORDER ID 87 - Maria Papoutsis (1 item)
-- ========================================

-- Item 1: Boutique Baths Bath Waste with Cian Cap 50mm
INSERT INTO order_items (
    order_id, 
    product_id, 
    name, 
    image, 
    price, 
    quantity, 
    created_at
) VALUES (
    87,  -- Order ID from the log
    456789,  -- Generated product ID (using hash fallback for 'WAS BAT BOUCAIN')
    'Boutique Baths Bath Waste with Cian Cap 50mm',  -- Product title from log
    'http://stiles.co.za/images/2024/08/WAS017-Boutique-Baths-Bath-Waste-with-Cian-Cap-50mm_Stiles_Product_Image.png',  -- First image URL from log
    1899,  -- Price from log (regular_price)
    1,  -- Quantity from log
    NOW()  -- Current timestamp
);

-- To verify the insertion for Order 87:
-- SELECT * FROM order_items WHERE order_id = 87;

-- To check the complete order 87 with items:
-- SELECT o.*, oi.* 
-- FROM orders o 
-- LEFT JOIN order_items oi ON o.id = oi.order_id 
-- WHERE o.id = 87;

-- ========================================
-- ORDER ID 89 - CATHARIE BAUERMEISTER (1 item)
-- ========================================

-- Item 1: Superlume Focca Denise Mirror 450x900mm
INSERT INTO order_items (
    order_id, 
    product_id, 
    name, 
    image, 
    price, 
    quantity, 
    created_at
) VALUES (
    89,  -- Order ID from the log
    567890,  -- Generated product ID (using hash fallback for 'MIR FOC DENISE 450X900')
    'Superlume Focca Denise Mirror 450x900mm',  -- Product title from log
    'http://stiles.co.za/images/2024/04/30449CI1508-Superlume-Focca-Denise-Illuminated-Mirror-450x900mm_Stiles_Product_Image.png',  -- First image URL from log
    4419,  -- Price from log (regular_price)
    1,  -- Quantity from log
    NOW()  -- Current timestamp
);

-- To verify the insertion for Order 89:
-- SELECT * FROM order_items WHERE order_id = 89;

-- To check the complete order 89 with items:
-- SELECT o.*, oi.* 
-- FROM orders o 
-- LEFT JOIN order_items oi ON o.id = oi.order_id 
-- WHERE o.id = 89;
