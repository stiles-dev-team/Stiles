/**
 * Utility functions for handling product pricing display
 */

/**
 * Determines the appropriate pricing unit based on product category
 * @param {Object} product - The product object
 * @returns {string} - The pricing unit (m2, each, per paver, per sheet, per slab, etc.)
 */
export const getPricingUnit = (product) => {
  if (!product || !product.product_category) return 'm2'; // Default to m2 if no category info

  const skus_exception = [
    "176-BALIAN",
    "176-BALIAZ",
    "176-BALIBL",
    "176-BALIV",
    "176-BHEX",
    "176-CALAC",
    "176-CIRCLEB",
    "176-CIRCLEW",
    "176-FLMA",
    "176-FLTW",
    "176-HEXWH",
    "176-RHOMBUSB",
    "176-RHOMBUSW",
    "176-SHEX",
    "176-ZELLIGE",
    "183-FR63CO.AV",
    "183-FR63CO.CE",
    "183-FR63CO.FU",
    "183-FR63CO.SB"
  ];

  const categories = Array.isArray(product.product_category) 
    ? product.product_category 
    : [product.product_category];

  const brands = Array.isArray(product['attribute:pa_brands'])
    ? product['attribute:pa_brands']
    : [product['attribute:pa_brands']];

  // Check for specific product types

  if (skus_exception.includes(product.sku)) {
    return 'm2';
  }

  if (brands.includes('Klay')) {
    return 'per item';
  }

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