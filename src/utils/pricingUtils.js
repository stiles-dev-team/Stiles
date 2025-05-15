/**
 * Utility functions for handling product pricing display
 */

/**
 * Determines the appropriate pricing unit based on product category
 * @param {Object} product - The product object
 * @returns {string} - The pricing unit (m2, each, per paver, per sheet, per slab, etc.)
 */
export const getPricingUnit = (product) => {
  if (!product || !product.product_cat) return 'm2'; // Default to m2 if no category info

  const categories = Array.isArray(product.product_cat) 
    ? product.product_cat 
    : [product.product_cat];

  // Check for specific product types
  if (categories.some(cat => cat.includes('Sanitary Ware'))) {
    return 'each';
  }
  
  if (categories.some(cat => cat.includes('Pavers'))) {
    return 'per paver';
  }
  
  if (categories.some(cat => cat.includes('Mosaics'))) {
    return 'per sheet';
  }
  
  // Check for large slabs in the category
  if (categories.some(cat => cat.includes('Large Slab'))) {
    return 'per slab';
  }
  
  // Default for tiles and flooring products
  return 'm2';
};

/**
 * Formats a price with the appropriate unit
 * @param {number|string} price - The price value
 * @param {string} unit - The pricing unit
 * @returns {string} - Formatted price with unit
 */
export const formatPriceWithUnit = (price, unit) => {
  if (!price) return '';
  
  // Clean the price string by removing currency symbols and non-numeric characters
  const cleanPrice = price.toString().replace(/[^\d.-]/g, '');
  const numericPrice = parseFloat(cleanPrice);
  
  if (isNaN(numericPrice)) return '';
  
  return `R${numericPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
}; 