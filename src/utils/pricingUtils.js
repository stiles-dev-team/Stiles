/**
 * Utility functions for handling product pricing display
 */

/**
 * Determines the appropriate pricing unit based on product category
 * @param {Object} product - The product object
 * @param {Object} stockInfo - Optional stock info object containing iq_table.model
 * @returns {string} - The pricing unit (m2, each, per paver, per sheet, per slab, etc.)
 */
export const getPricingUnit = (product, stockInfo = null) => {
  if (!product || !product.product_category) return 'm2'; // Default to m2 if no category info

  // Check iq_table.model first - if model is 'PC', always return 'per m2'
  const model = stockInfo?.model || product.model || product.iq_model;
  if (model === 'PC') {
    return 'per m2';
  }

  // Check if product_tag contains "Per m2" (handle both string and array formats)
  if (product.product_tag) {
    let productTagString = '';
    if (Array.isArray(product.product_tag)) {
      productTagString = product.product_tag.join(', ');
    } else if (typeof product.product_tag === 'string') {
      productTagString = product.product_tag;
    }
    
    if (productTagString && (productTagString.includes('Per m2') || productTagString.includes('per m2'))) {
      return 'per m2';
    }
  }

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
  
  // Check for Pavers category - but only if product_tag doesn't explicitly say "Per m2"
  // This allows products with "Pavers" in category but "Per m2" in tag to show per m2
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

  if (categories.some(cat => cat.includes('Tile Accessories'))) {
    return 'each';
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

/**
 * Formats a currency value with proper comma and decimal formatting
 * @param {number|string} amount - The amount to format
 * @returns {string} - Formatted currency string (e.g., "R1,234.56")
 */
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return 'R0.00';
  
  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount)) return 'R0.00';
  
  return `R${numericAmount.toLocaleString('en-ZA', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
};

/**
 * Decodes HTML entities in a string
 * @param {string} str - The string containing HTML entities
 * @returns {string} - The decoded string
 */
export const decodeHtmlEntities = (str) => {
  if (!str) return '';
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = str;
  return textarea.value;
}; 