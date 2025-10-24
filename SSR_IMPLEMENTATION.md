# Server-Side Rendering (SSR) Implementation for Stiles

This document explains the SSR implementation for product category pages to improve SEO.

## Overview

The SSR implementation provides server-side rendering for the `/product-category/:slug` route, allowing search engines to properly index and display your product categories with rich metadata.

## Files Created

### 1. `public/product-category.php`
The main SSR handler that:
- Fetches category data from the database or JSON file
- Retrieves products for the category
- Generates SEO-optimized HTML with meta tags
- Includes structured data (JSON-LD) for search engines
- Provides fallback content for users without JavaScript

### 2. `public/.htaccess`
URL rewriting rules that:
- Route `/product-category/{slug}` to `product-category.php`
- Handle other SSR routes (products, blog posts, etc.)
- Provide security headers
- Enable caching and compression

### 3. `public/test-ssr.php`
Test script to verify the SSR implementation is working correctly.

## Features

### SEO Optimization
- **Dynamic Title Tags**: `{Category Name} | Stiles - South Africa's Leading Tile & Sanitaryware Retailer`
- **Meta Descriptions**: Extracted from category descriptions (truncated to 160 characters)
- **Keywords**: Auto-generated from category name, brands, colors, and finishes
- **Open Graph Tags**: For social media sharing
- **Twitter Cards**: For Twitter sharing
- **Canonical URLs**: Prevents duplicate content issues
- **Structured Data**: JSON-LD format for rich snippets

### Performance
- **Caching**: 5-minute cache for API responses
- **Compression**: Gzip compression for faster loading
- **Preloading**: Critical CSS and JS files are preloaded
- **Lazy Loading**: Products are limited to 20 for initial load

### Accessibility
- **NoScript Support**: Fallback content for users without JavaScript
- **Semantic HTML**: Proper heading structure and content hierarchy
- **Alt Text**: Image alt attributes for accessibility

## How It Works

1. **URL Routing**: When a user visits `/product-category/tiles`, Apache routes it to `product-category.php`
2. **Data Fetching**: The PHP script fetches category data and products from the database
3. **SEO Generation**: Meta tags, structured data, and content are generated server-side
4. **HTML Output**: A complete HTML page is sent to the browser with SEO content
5. **React Hydration**: The React app loads and takes over the page for interactivity

## Testing

### 1. Run the Test Script
Visit `/test-ssr.php` to verify all components are working.

### 2. Test Category Pages
Try these URLs:
- `/product-category/tiles`
- `/product-category/sanitary-ware`
- `/product-category/flooring`

### 3. SEO Verification
Use these tools to verify SEO:
- **Google Search Console**: Check how pages appear in search results
- **Facebook Debugger**: Test Open Graph tags
- **Twitter Card Validator**: Test Twitter cards
- **Google Rich Results Test**: Verify structured data

## Configuration

### Database Setup
Ensure your database has:
- `stiles_products` table with product data
- `categories` table (optional, falls back to JSON)
- Proper indexes on `slug` and `product_category` fields

### Server Requirements
- Apache with mod_rewrite enabled
- PHP 7.4+ with PDO extension
- MySQL/MariaDB database

## Customization

### Adding New Meta Tags
Edit `product-category.php` and add new meta tags in the `<head>` section:

```php
<meta name="robots" content="index, follow">
<meta name="author" content="Stiles">
```

### Modifying Structured Data
Update the `generateStructuredData()` function to include additional schema.org properties.

### Adding More Routes
Add new rewrite rules in `.htaccess` for additional SSR routes:

```apache
RewriteRule ^blog/([^/]+)/?$ blog-post.php [L,QSA]
```

## Troubleshooting

### Common Issues

1. **404 Errors**: Check that `.htaccess` is in the correct directory and mod_rewrite is enabled
2. **Database Errors**: Verify database connection in `api/config.php`
3. **Missing Categories**: Ensure `data/navbar-categories.json` exists and is valid JSON
4. **No Products**: Check that products exist in the database with matching category names

### Debug Mode
Enable debug mode by adding this to the top of `product-category.php`:

```php
ini_set('display_errors', 1);
error_reporting(E_ALL);
```

## Performance Monitoring

### Key Metrics to Monitor
- **Page Load Time**: Should be under 2 seconds
- **SEO Score**: Use tools like Lighthouse or GTmetrix
- **Search Console**: Monitor indexing and click-through rates
- **Core Web Vitals**: LCP, FID, CLS scores

### Optimization Tips
- Enable server-side caching (Redis/Memcached)
- Optimize database queries with proper indexes
- Use CDN for static assets
- Implement image optimization

## Future Enhancements

### Planned Features
1. **Product Page SSR**: Individual product pages with rich snippets
2. **Blog Post SSR**: Blog posts with article structured data
3. **Sitemap Generation**: Automatic XML sitemap generation
4. **Cache Invalidation**: Smart cache clearing when content updates

### Advanced SEO
1. **Breadcrumb Schema**: Add breadcrumb structured data
2. **FAQ Schema**: Add FAQ sections to category pages
3. **Review Schema**: Include customer reviews and ratings
4. **Local Business Schema**: Add location and contact information

## Support

For issues or questions about the SSR implementation:
1. Check the test script results
2. Review server error logs
3. Verify database connectivity
4. Test with different category slugs

## Maintenance

### Regular Tasks
- Monitor search console for indexing issues
- Update structured data as needed
- Test new categories for proper rendering
- Review and update meta descriptions
- Check for broken links and missing images

### Updates
- Keep PHP and server software updated
- Monitor for security vulnerabilities
- Test after any database schema changes
- Verify SEO performance after updates
