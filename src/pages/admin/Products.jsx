import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Select from 'react-select';
import { formatCurrency } from '../../utils/pricingUtils';
import MediaSelector from '../../components/MediaSelector';

const AdminProducts = () => {
  // Function to extract YouTube video ID from URL
  const extractYouTubeId = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
  };

  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false); // Separate loading state for table
  
  // Products cache - stores fetched products by cache key
  const productsCache = useRef(new Map());
  const cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout
  const debounceTimeoutRef = useRef(null);
  
  // Initialize filter states from URL params, with defaults
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('brand') || "all");
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || "all");
  const [selectedColour, setSelectedColour] = useState(searchParams.get('colour') || "all");
  const [selectedFinish, setSelectedFinish] = useState(searchParams.get('finish') || "all");
  const [selectedPromo, setSelectedPromo] = useState(searchParams.get('promo') || "all");
  const [selectedProductTypes, setSelectedProductTypes] = useState(
    searchParams.get('product_type') ? searchParams.get('product_type').split(',') : []
  );
  const [selectedProductCategory, setSelectedProductCategory] = useState(searchParams.get('category_id') || "all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colours, setColours] = useState([]);
  const [finishes, setFinishes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [promos, setPromos] = useState([]);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    slug: "",
    description: "",
    status: "publish",
    post_date: new Date().toISOString().split('T')[0],
    sku: "",
    stock: 0,
    regular_price: 0,
    sale_price: 0,
    metadesc: "",
    product_category: [],
    product_tag: "",
    "attribute:pa_brands": "",
    "attribute:pa_colour": [],
    "attribute:pa_finish": [],
    "attribute:pa_size": [],
    "meta:product_details": "",
    pdf_url: "",
    pdf_preview: "",
    featured_image: "",
    featured_preview: "",
    featured_file: null,
    gallery_images: "",
    gallery_previews: [],
    gallery_files: [],
    youtube_video_url: "",
    promo: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_products: 0,
    products_per_page: 20,
    has_next_page: false,
    has_prev_page: false,
  });
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
  const [iqStatus, setIqStatus] = useState(null); // null = not checked, true = exists, false = doesn't exist
  const [checkingIq, setCheckingIq] = useState(false);
  const [csvUploading, setCsvUploading] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [selectedBrandsForDownload, setSelectedBrandsForDownload] = useState([]);
  const [showExcelInstructions, setShowExcelInstructions] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [sortField, setSortField] = useState(searchParams.get('sort_field') || null);
  const [sortDirection, setSortDirection] = useState(searchParams.get('sort_direction') || 'asc');
  
  // Function to update URL params with current filter state
  const updateURLParams = (updates = {}) => {
    const newParams = new URLSearchParams(searchParams);
    
    // Update or remove search
    if (updates.search !== undefined) {
      if (updates.search) newParams.set('search', updates.search);
      else newParams.delete('search');
    } else if (searchTerm) {
      newParams.set('search', searchTerm);
    } else {
      newParams.delete('search');
    }
    
    // Update or remove brand
    if (updates.brand !== undefined) {
      if (updates.brand && updates.brand !== 'all') newParams.set('brand', updates.brand);
      else newParams.delete('brand');
    } else if (selectedCategory && selectedCategory !== 'all') {
      newParams.set('brand', selectedCategory);
    } else {
      newParams.delete('brand');
    }
    
    // Update or remove status
    if (updates.status !== undefined) {
      if (updates.status && updates.status !== 'all') newParams.set('status', updates.status);
      else newParams.delete('status');
    } else if (selectedStatus && selectedStatus !== 'all') {
      newParams.set('status', selectedStatus);
    } else {
      newParams.delete('status');
    }
    
    // Update or remove colour
    if (updates.colour !== undefined) {
      if (updates.colour && updates.colour !== 'all') newParams.set('colour', updates.colour);
      else newParams.delete('colour');
    } else if (selectedColour && selectedColour !== 'all') {
      newParams.set('colour', selectedColour);
    } else {
      newParams.delete('colour');
    }
    
    // Update or remove finish
    if (updates.finish !== undefined) {
      if (updates.finish && updates.finish !== 'all') newParams.set('finish', updates.finish);
      else newParams.delete('finish');
    } else if (selectedFinish && selectedFinish !== 'all') {
      newParams.set('finish', selectedFinish);
    } else {
      newParams.delete('finish');
    }
    
    // Update or remove promo
    if (updates.promo !== undefined) {
      if (updates.promo && updates.promo !== 'all') newParams.set('promo', updates.promo);
      else newParams.delete('promo');
    } else if (selectedPromo && selectedPromo !== 'all') {
      newParams.set('promo', selectedPromo);
    } else {
      newParams.delete('promo');
    }
    
    // Update or remove product_type
    if (updates.product_type !== undefined) {
      if (updates.product_type && updates.product_type.length > 0) {
        newParams.set('product_type', updates.product_type.join(','));
      } else {
        newParams.delete('product_type');
      }
    } else if (selectedProductTypes && selectedProductTypes.length > 0) {
      newParams.set('product_type', selectedProductTypes.join(','));
    } else {
      newParams.delete('product_type');
    }
    
    // Update or remove category_id
    if (updates.category_id !== undefined) {
      if (updates.category_id && updates.category_id !== 'all') newParams.set('category_id', updates.category_id);
      else newParams.delete('category_id');
    } else if (selectedProductCategory && selectedProductCategory !== 'all') {
      newParams.set('category_id', selectedProductCategory);
    } else {
      newParams.delete('category_id');
    }
    
    // Update or remove page
    if (updates.page !== undefined) {
      if (updates.page > 1) newParams.set('page', updates.page.toString());
      else newParams.delete('page');
    } else if (currentPage > 1) {
      newParams.set('page', currentPage.toString());
    } else {
      newParams.delete('page');
    }
    
    // Update or remove sort_field
    if (updates.sort_field !== undefined) {
      if (updates.sort_field) {
        newParams.set('sort_field', updates.sort_field);
        newParams.set('sort_direction', updates.sort_direction || sortDirection);
      } else {
        newParams.delete('sort_field');
        newParams.delete('sort_direction');
      }
    } else if (sortField) {
      newParams.set('sort_field', sortField);
      newParams.set('sort_direction', sortDirection);
    } else {
      newParams.delete('sort_field');
      newParams.delete('sort_direction');
    }
    
    // Preserve slug if it exists
    if (searchParams.get('slug')) {
      newParams.set('slug', searchParams.get('slug'));
    }
    
    setSearchParams(newParams, { replace: true });
  };

  const syncIqPrices = async () => {
    setTableLoading(true);
    const response = await fetch("https://n8n.srv925550.hstgr.cloud/webhook/75de692b-34bc-4e72-9759-dffcb33cf349", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    setTimeout(() => {
      // Invalidate cache and refetch after sync
      invalidateCache();
      fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection, false);
      setTableLoading(false);
    }, 30000);
  };

  // Function to toggle menu
  const toggleMenu = (productId, product, event) => {
    console.log("Toggling menu for product:", product);
    if (openMenuId === productId) {
      setOpenMenuId(null);
    } else {
      // Calculate button position for dropdown (using fixed positioning)
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8, // 8px for mt-2 equivalent
        right: window.innerWidth - rect.right
      });
      setOpenMenuId(productId);
    }
  };

  // Function to close menu
  const closeMenu = () => {
    setOpenMenuId(null);
  };

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && !event.target.closest('.menu-trigger') && !event.target.closest('.dropdown-menu')) {
        closeMenu();
      }
    };

    const handleScroll = () => {
      if (openMenuId) {
        closeMenu();
      }
    };

    if (openMenuId) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [openMenuId]);

  // Function to handle quick view - redirect to product page
  const handleQuickView = (product) => {
    if (product.slug) {
      window.open(`/product/${product.slug}`, '_blank');
    } else {
      alert('Product slug not found');
    }
    closeMenu();
  };

  // Function to handle column sorting
  const handleSort = (field) => {
    let newSortDirection = 'asc';
    
    if (sortField === field) {
      // If clicking the same field, toggle direction
      newSortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // If clicking a new field, set it and default to ascending
      newSortDirection = 'asc';
    }
    
    setSortField(field);
    setSortDirection(newSortDirection);
    updateURLParams({ sort_field: field, sort_direction: newSortDirection });
    
    // Fetch products with new sorting
    fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, field, newSortDirection);
  };


  // Function to handle bulk selection
  const handleBulkSelect = (productId, isSelected) => {
    if (isSelected) {
      setSelectedProducts([...selectedProducts, productId]);
    } else {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    }
  };

  // Function to select all products
  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map(product => String(product.ID || product.id)));
    }
  };

  // Function to handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      alert("Please select products to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) {
      try {
        const deletePromises = selectedProducts.map(productId => 
          fetch("https://stiles.co.za/api/admin-products.php", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ id: productId }),
          })
        );

        const results = await Promise.all(deletePromises);
        const jsonResults = await Promise.all(results.map(r => r.json()));

        const successCount = jsonResults.filter(r => r.status === "success").length;
        
        if (successCount > 0) {
          alert(`Successfully deleted ${successCount} product(s)`);
          setSelectedProducts([]);
          // Invalidate cache and refetch
          invalidateCache();
          fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection, false);
        } else {
          alert("Error deleting products");
        }
      } catch (error) {
        console.error("Error bulk deleting products:", error);
        alert("Error deleting products");
      }
    }
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-menu') && !event.target.closest('.menu-trigger')) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Function to clean up blob URLs
  const cleanupBlobUrls = () => {
    if (formData.pdf_preview && formData.pdf_preview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.pdf_preview);
    }
    if (formData.featured_preview && formData.featured_preview.startsWith('blob:')) {
      URL.revokeObjectURL(formData.featured_preview);
    }
    if (formData.gallery_previews && formData.gallery_previews.length > 0) {
      formData.gallery_previews.forEach(preview => {
        if (preview && preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    }
  };

  // Cleanup blob URLs and debounce timeout when component unmounts
  useEffect(() => {
    return () => {
      cleanupBlobUrls();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Cleanup blob URLs when modal closes
  useEffect(() => {
    if (!showAddModal) {
      cleanupBlobUrls();
    }
  }, [showAddModal]);

  useEffect(() => {
    // Initial fetch should bypass cache to get fresh data
    // Use currentPage from URL params (or default to 1)
    fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection, false);
    fetchCategories();
    fetchUniqueCategories();
    fetchBrands();
    fetchColours();
    fetchFinishes();
    fetchSizes();
    fetchPromos();
  }, []);

  // Handle slug parameter to open edit modal
  useEffect(() => {
    const slug = searchParams.get('slug');
    console.log('Slug useEffect triggered:', { slug, productsLength: products.length, loading });
    
    if (slug && !loading) {
      console.log('Looking for product with slug:', slug);
      
      // Fetch the specific product by slug
      fetchProductBySlug(slug).then(product => {
        console.log('Found product:', product);
        
        if (product) {
          console.log('Opening edit modal for product:', product.title);
          openEditModal(product);
          // Remove the slug parameter from URL after opening modal
          const newSearchParams = new URLSearchParams(searchParams);
          newSearchParams.delete('slug');
          window.history.replaceState({}, '', `${window.location.pathname}${newSearchParams.toString() ? '?' + newSearchParams.toString() : ''}`);
        } else {
          console.log('No product found with slug:', slug);
        }
      });
    }
  }, [searchParams, loading]);

  // Check IQ status when SKU changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkIqStatus(formData.sku);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.sku]);

  // Generate cache key from filter parameters
  const getCacheKey = (page, search, category, status, colour, finish, promo, productType, productCategory, sortField, sortDirection) => {
    // Use default sort (id, asc) when no explicit sort is set, to match API behavior
    const effectiveSortField = sortField || 'id';
    const effectiveSortDirection = sortField ? sortDirection : 'asc';
    
    return JSON.stringify({
      page,
      search: search || '',
      category: category || 'all',
      status: status || 'all',
      colour: colour || 'all',
      finish: finish || 'all',
      promo: promo || 'all',
      productType: Array.isArray(productType) ? productType.sort().join(',') : '',
      productCategory: productCategory || 'all',
      sortField: effectiveSortField,
      sortDirection: effectiveSortDirection
    });
  };

  // Check if cache entry is still valid
  const isCacheValid = (cacheEntry) => {
    if (!cacheEntry) return false;
    return Date.now() - cacheEntry.timestamp < cacheTimeout;
  };

  // Invalidate cache - clear all or specific entries
  const invalidateCache = (pattern = null) => {
    if (pattern === null) {
      // Clear all cache
      productsCache.current.clear();
    } else {
      // Clear cache entries matching pattern
      for (const key of productsCache.current.keys()) {
        if (key.includes(pattern)) {
          productsCache.current.delete(key);
        }
      }
    }
  };

  const fetchProducts = async (page = 1, search = "", category = "", status = "", colour = "", finish = "", promo = "", productType = [], productCategory = "", sortField = null, sortDirection = "asc", useCache = true) => {
    // Generate cache key
    const cacheKey = getCacheKey(page, search, category, status, colour, finish, promo, productType, productCategory, sortField, sortDirection);
    
    // Check cache first
    if (useCache) {
      const cached = productsCache.current.get(cacheKey);
      if (cached && isCacheValid(cached)) {
        console.log('Using cached products for:', cacheKey);
        setProducts(cached.products);
        setPagination(cached.pagination);
        setTableLoading(false);
        setLoading(false);
        return;
      }
    }

    try {
      // Show table loading (not full page loading) for filter changes
      if (products.length > 0) {
        setTableLoading(true);
      } else {
        setLoading(true);
      }
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);
      if (category && category !== "all") params.append("brand", category);
      if (status && status !== "all") params.append("status", status);
      if (colour && colour !== "all") params.append("colour", colour);
      if (finish && finish !== "all") params.append("finish", finish);
      if (promo && promo !== "all") params.append("promo", promo);
      if (productType && productType.length > 0) params.append("product_type", productType.join(","));
      if (productCategory && productCategory !== "all") {
        // Find the category name from the ID
        // If uniqueCategories is not loaded yet, try to use the ID as fallback
        const selectedCategory = uniqueCategories.length > 0 
          ? uniqueCategories.find(cat => String(cat.id) === String(productCategory))
          : null;
        
        if (selectedCategory) {
          params.append("category", selectedCategory.category);
          console.log('Product Category Filter - ID:', productCategory, 'Name:', selectedCategory.category);
        } else if (uniqueCategories.length === 0) {
          // If categories not loaded yet, store the ID and we'll retry after categories load
          console.warn('uniqueCategories not loaded yet, category filter will be applied after categories load');
          // Don't add the filter yet - it will be applied when categories load
        } else {
          console.warn('Category not found in uniqueCategories:', productCategory, 'Available categories:', uniqueCategories.map(c => ({id: c.id, name: c.category})));
        }
      }
      // Always apply a sort to ensure consistent ordering
      // If no explicit sort is set, default to ID ascending for consistent results
      if (sortField) {
        params.append("sort_field", sortField);
        params.append("sort_direction", sortDirection);
      } else {
        // Default sort by ID to ensure consistent ordering when no explicit sort is applied
        params.append("sort_field", "id");
        params.append("sort_direction", "asc");
      }

      // Debug logging
      console.log('Fetching products with params:', {
        page,
        search,
        category,
        status,
        colour,
        finish,
        url: `https://stiles.co.za/api/admin-products.php?${params}`
      });

      const response = await fetch(
        `https://stiles.co.za/api/admin-products.php?${params}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();
      console.log(data);

      if (data.status === "success") {
        const productsData = data.products || [];
        const paginationData = data.pagination || {
          current_page: 1,
          total_pages: 1,
          total_products: 0,
          products_per_page: 20,
          has_next_page: false,
          has_prev_page: false,
        };

        // Update state
        setProducts(productsData);
        setPagination(paginationData);

        // Cache the results
        productsCache.current.set(cacheKey, {
          products: productsData,
          pagination: paginationData,
          timestamp: Date.now()
        });

        // Limit cache size to prevent memory issues (keep last 50 entries)
        if (productsCache.current.size > 50) {
          const firstKey = productsCache.current.keys().next().value;
          productsCache.current.delete(firstKey);
        }
      } else {
        console.error("Error fetching products:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setTableLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/unique-categories.php", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/admin-brands.php", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.brands) {
        setBrands(data.brands);
      } else {
        console.error('Error fetching brands:', data.error || 'Unknown error');
        setBrands([]);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      setBrands([]);
    }
  };

  const fetchColours = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/unique-colours.php", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      setColours(data.colours || []);
    } catch (error) {
      console.error("Error fetching colours:", error);
    }
  };

  const fetchFinishes = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/unique-finishes.php", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      setFinishes(data.finishes || []);
    } catch (error) {
      console.error("Error fetching finishes:", error);
    }
  };

  const fetchSizes = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/unique-sizes.php", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      setSizes(data.sizes || []);
    } catch (error) {
      console.error("Error fetching sizes:", error);
    }
  };

  const fetchPromos = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/unique-promos.php", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      setPromos(data.promos || []);
    } catch (error) {
      console.error("Error fetching promos:", error);
    }
  };

  const fetchUniqueCategories = async () => {
    try {
      const response = await fetch('https://stiles.co.za/api/admin-categories-json.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success && data.categories) {
        setUniqueCategories(data.categories);
      } else {
        console.error('Error fetching unique categories:', data.error || 'Unknown error');
        setUniqueCategories([]);
      }
    } catch (error) {
      console.error('Error fetching unique categories:', error);
      setUniqueCategories([]);
    }
  };

  // Refetch products when uniqueCategories loads if a product category is selected
  // Use a ref to track if we've already refetched to prevent infinite loops
  const categoriesLoadedRef = useRef(false);
  useEffect(() => {
    if (uniqueCategories.length > 0 && !categoriesLoadedRef.current) {
      categoriesLoadedRef.current = true;
      // If a category is selected, refetch products with the filter
      if (selectedProductCategory !== "all") {
        fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection);
      }
    }
  }, [uniqueCategories.length]); // Only trigger when categories are loaded

  // Function to sort categories hierarchically for display
  const getSortedCategories = () => {
    const sorted = [];
    const categoryMap = new Map();
    
    // Create a map for quick lookup
    uniqueCategories.forEach(cat => categoryMap.set(cat.id, cat));
    
    // First add root categories (parent = 0)
    const rootCategories = uniqueCategories.filter(cat => cat.parent === 0);
    rootCategories.sort((a, b) => a.category.localeCompare(b.category));
    
    // Then recursively add children
    const addChildren = (parentId, level = 0) => {
      const children = uniqueCategories.filter(cat => cat.parent === parentId);
      children.sort((a, b) => a.category.localeCompare(b.category));
      
      children.forEach(child => {
        sorted.push({ ...child, level });
        addChildren(child.id, level + 1);
      });
    };
    
    rootCategories.forEach(root => {
      sorted.push({ ...root, level: 0 });
      addChildren(root.id, 1);
    });
    
    return sorted;
  };

  const fetchProductBySlug = async (slug) => {
    try {
      const response = await fetch(`https://stiles.co.za/api/admin-products.php?slug=${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      
      if (data.status === 'success' && data.product) {
        return data.product;
      } else {
        console.error('Product not found:', data.message);
        return null;
      }
    } catch (error) {
      console.error("Error fetching product by slug:", error);
      return null;
    }
  };

  const getNextId = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/admin-products.php?get_max_id=1", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      
      if (data.status === "success" && data.max_id !== undefined) {
        return data.max_id + 1;
      }
      return 1; // Default if no products exist
    } catch (error) {
      console.error("Error fetching next ID:", error);
      return 1;
    }
  };

  const checkIqStatus = async (sku) => {
    if (!sku || sku.trim() === '') {
      setIqStatus(null);
      return;
    }

    try {
      setCheckingIq(true);
      const response = await fetch(`https://stiles.co.za/api/iq_new.php?code=${encodeURIComponent(sku.trim())}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('IQ check response:', data);
      
      // Check if the response contains data, indicating the SKU exists
      if (data && data.data) {
        setIqStatus(true);
      } else {
        setIqStatus(false);
      }
    } catch (error) {
      console.error('Error checking IQ status:', error);
      setIqStatus(false);
    } finally {
      setCheckingIq(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(value);
  };

  // Server-side filtering and sorting is now handled by the API
  const filteredProducts = products;

  const handleEditProduct = (product) => {
    openEditModal(product);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        // Ensure productId is always treated as a string to prevent precision loss
        const stringId = String(productId);
        console.log("Deleting product:", stringId);
        const response = await fetch(
          "https://stiles.co.za/api/admin-products.php",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ id: stringId }),
          }
        );

        const result = await response.json();

        if (result.status === "success") {
          alert("Product deleted successfully");
          // Invalidate cache and refetch
          invalidateCache();
          fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection, false);
        } else {
          alert("Error deleting product: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const handleDuplicateProduct = async (product) => {
    try {
      cleanupBlobUrls();
      
      // Get next available ID
      const nextId = await getNextId();
      
      // Generate new slug based on title
      const newSlug = generateSlug(product.title + " Copy");
      
      // Generate preview URLs for existing gallery images
      let galleryPreviews = [];
      if (product.gallery_images) {
        galleryPreviews = product.gallery_images.split(', ').map(image => image.trim());
      }
      
      // Set form data with duplicated product data
      setFormData({
        id: nextId.toString(),
        title: product.title + " Copy",
        slug: newSlug,
        description: product.description || "",
        status: "draft", // Set to draft by default for duplicates
        post_date: new Date().toISOString().split('T')[0],
        sku: product.sku ? product.sku + "-COPY" : "",
        stock: 0, // Reset stock for duplicate
        regular_price: product.regular_price || 0,
        sale_price: product.sale_price || 0,
        metadesc: product.metadesc || "",
        product_category: product.product_category ? product.product_category.split(',').map(cat => cat.trim()).filter(cat => cat) : [],
        product_tag: product.product_tag || "",
        "attribute:pa_brands": product["attribute:pa_brands"] || "",
        "attribute:pa_colour": product["attribute:pa_colour"] ? product["attribute:pa_colour"].split(',').map(colour => colour.trim()).filter(colour => colour) : [],
        "attribute:pa_finish": product["attribute:pa_finish"] ? product["attribute:pa_finish"].split(',').map(finish => finish.trim()).filter(finish => finish) : [],
        "attribute:pa_size": product["attribute:pa_size"] ? product["attribute:pa_size"].split(',').map(size => size.trim()).filter(size => size) : [],
        "meta:product_details": product["meta:product_details"] || "",
        pdf_url: product.pdf_url || "",
        pdf_preview: product.pdf_url || "",
        pdf_file: null,
        featured_image: product.featured_image || "",
        featured_preview: product.featured_image || "",
        featured_file: null,
        gallery_images: product.gallery_images || "",
        gallery_previews: galleryPreviews,
        gallery_files: [],
        youtube_video_url: product.youtube_video_url || "",
        promo: product.promo ? product.promo.split(',').map(promo => promo.trim()).filter(promo => promo) : [],
      });
      
      setEditingProduct(null); // Clear editing product since this is a new product
      setShowAddModal(true);
      closeMenu();
    } catch (error) {
      console.error("Error duplicating product:", error);
      alert("Error duplicating product");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "https://stiles.co.za/api/admin-products.php";
      const method = "POST";
      
      // Check if we have actual files to upload
      const hasFiles = formData.pdf_file || formData.featured_file || 
                      (formData.gallery_files && formData.gallery_files.length > 0);
      
      let bodyToSend;
      let headers = {
        Accept: "application/json",
      };
      
      if (hasFiles) {
        // Use FormData only when files are present (multipart/form-data)
        const formDataToSend = new FormData();
        
        // Add all form fields (excluding file objects and preview URLs)
        Object.keys(formData).forEach(key => {
          if (key !== 'featured_file' && key !== 'gallery_files' && key !== 'pdf_file' && key !== 'featured_preview' && key !== 'gallery_previews' && key !== 'pdf_preview') {
            // Only add non-empty values
            if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
              // Convert arrays to comma-separated strings
              if ((key === 'product_category' || key === 'attribute:pa_colour' || key === 'attribute:pa_finish' || key === 'attribute:pa_size' || key === 'promo') && Array.isArray(formData[key])) {
                formDataToSend.append(key, formData[key].join(', '));
              } else {
                formDataToSend.append(key, formData[key]);
              }
            }
          }
        });
        
        // Add files if they exist
        if (formData.pdf_file) {
          formDataToSend.append('pdf_url', formData.pdf_file);
        } else if (formData.pdf_url && formData.pdf_url !== '') {
          formDataToSend.append('pdf_url', formData.pdf_url);
        }
        
        if (formData.featured_file) {
          formDataToSend.append('featured_image', formData.featured_file);
        } else if (formData.featured_image && formData.featured_image !== '') {
          formDataToSend.append('featured_image', formData.featured_image);
        }
        
        if (formData.gallery_files && formData.gallery_files.length > 0) {
          formData.gallery_files.forEach((file, index) => {
            formDataToSend.append(`gallery_images[${index}]`, file);
          });
        } else if (formData.gallery_images && formData.gallery_images !== '') {
          formDataToSend.append('gallery_images', formData.gallery_images);
        }
        
        // Add editing product ID if updating
        if (editingProduct) {
          formDataToSend.append('id', String(editingProduct.ID || editingProduct.id));
        }
        
        bodyToSend = formDataToSend;
        // Don't set Content-Type for FormData - browser sets it automatically with boundary
      } else {
        // Use JSON when no files (avoids mod_security blocking multipart/form-data)
        const jsonData = {};
        
        // Add all form fields (excluding file objects and preview URLs)
        Object.keys(formData).forEach(key => {
          if (key !== 'featured_file' && key !== 'gallery_files' && key !== 'pdf_file' && key !== 'featured_preview' && key !== 'gallery_previews' && key !== 'pdf_preview') {
            // Only add non-empty values
            if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
              // Convert arrays to comma-separated strings for consistency
              if ((key === 'product_category' || key === 'attribute:pa_colour' || key === 'attribute:pa_finish' || key === 'attribute:pa_size' || key === 'promo') && Array.isArray(formData[key])) {
                jsonData[key] = formData[key].join(', ');
              } else {
                jsonData[key] = formData[key];
              }
            }
          }
        });
        
        // Add existing file paths (not new files)
        if (formData.pdf_url && formData.pdf_url !== '' && !formData.pdf_file) {
          jsonData['pdf_url'] = formData.pdf_url;
        }
        
        if (formData.featured_image && formData.featured_image !== '' && !formData.featured_file) {
          jsonData['featured_image'] = formData.featured_image;
        }
        
        if (formData.gallery_images && formData.gallery_images !== '' && (!formData.gallery_files || formData.gallery_files.length === 0)) {
          jsonData['gallery_images'] = formData.gallery_images;
        }
        
        // Add editing product ID if updating
        if (editingProduct) {
          jsonData['id'] = String(editingProduct.ID || editingProduct.id);
        }
        
        bodyToSend = JSON.stringify(jsonData);
        headers['Content-Type'] = 'application/json';
      }
      
      // Debug: Log what's being sent
      console.log('Request method:', method);
      console.log('Has files:', hasFiles);
      console.log('Content-Type:', headers['Content-Type'] || 'multipart/form-data (FormData)');
      if (hasFiles) {
        console.log('FormData contents:');
        for (let [key, value] of bodyToSend.entries()) {
          console.log(key, value instanceof File ? `[File: ${value.name}]` : value);
        }
      } else {
        console.log('JSON data:', bodyToSend);
      }

      const response = await fetch(url, {
        method,
        headers,
        body: bodyToSend,
      });

      // Check response status and content type before parsing JSON
      const contentType = response.headers.get('content-type') || '';
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} Error:`, errorText);
        
        // If server returned HTML error page (common with 403 Forbidden)
        if (contentType.includes('text/html') || errorText.trim().startsWith('<!DOCTYPE')) {
          throw new Error(`HTTP ${response.status} Forbidden: The server is blocking this request. This is likely a server security configuration issue (mod_security or Apache rules). Please contact your hosting provider.`);
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200) || response.statusText}`);
      }

      // Check if response is actually JSON before parsing
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', contentType, text.substring(0, 200));
        throw new Error(`Server returned ${contentType} instead of JSON. Response: ${text.substring(0, 200)}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        alert(
          editingProduct
            ? "Product updated successfully"
            : "Product created successfully"
        );
        cleanupBlobUrls();
        setShowAddModal(false);
        setEditingProduct(null);
                 setFormData({
           id: "",
           title: "",
           slug: "",
           description: "",
           status: "publish",
           post_date: new Date().toISOString().split('T')[0],
           sku: "",
           stock: 0,
           regular_price: 0,
           sale_price: 0,
           metadesc: "",
           product_category: [],
           product_tag: "",
           "attribute:pa_brands": "",
           "attribute:pa_colour": [],
           "attribute:pa_finish": [],
           "attribute:pa_size": [],
           "meta:product_details": "",
           pdf_url: "",
           pdf_preview: "",
           featured_image: "",
           featured_preview: "",
           featured_file: null,
           gallery_images: "",
           gallery_previews: [],
           gallery_files: [],
           promo: [],
         });
        // Invalidate cache and refetch
        invalidateCache();
        fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection, false);
      } else {
        // Handle specific error types
        if (result.error === 'SKU_CONFLICT') {
          alert("Error: A product with this SKU already exists. Please use a different SKU.");
        } else {
          alert("Error: " + result.message);
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      const errorMessage = error.message || "Error saving product";
      alert(`Error saving product: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // Function to generate slug from title
  const generateSlug = (title) => {
    if (!title) return '';
    
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Function to handle auto-generate slug button click
  const handleGenerateSlug = () => {
    if (formData.title) {
      const generatedSlug = generateSlug(formData.title);
      setFormData((prev) => ({
        ...prev,
        slug: generatedSlug,
      }));
    }
  };



  const openAddModal = async () => {
    cleanupBlobUrls();
    setEditingProduct(null);
    const nextId = await getNextId();
    setFormData({
      id: nextId.toString(),
      title: "",
      slug: "",
      description: "",
      status: "publish",
      post_date: new Date().toISOString().split('T')[0],
      sku: "",
      stock: 0,
      regular_price: 0,
      sale_price: 0,
      metadesc: "",
      product_category: [],
      product_tag: "",
      "attribute:pa_brands": "",
      "attribute:pa_colour": [],
      "attribute:pa_finish": [],
      "attribute:pa_size": [],
      "meta:product_details": "",
      pdf_url: "",
      pdf_preview: "",
      pdf_file: null,
      featured_image: "",
      featured_preview: "",
      featured_file: null,
      gallery_images: "",
      gallery_previews: [],
      gallery_files: [],
      promo: [],
    });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    cleanupBlobUrls();
    console.log("Product data:", product);
    console.log("Product ID:", product.id);
    console.log("Product ID (uppercase):", product.ID);
    console.log("Product ID as string:", String(product.ID || product.id));
    console.log("Product ID type:", typeof (product.ID || product.id));
    setEditingProduct(product);
    closeMenu();
    
    // Generate preview URLs for existing gallery images
    let galleryPreviews = [];
    if (product.gallery_images) {
      galleryPreviews = product.gallery_images.split(', ').map(image => image.trim());
    }
    
    setFormData({
      id: String(product.ID || product.id || ""),
      title: product.title || "",
      slug: product.slug || "",
      description: product.description || "",
      status: product.status || "publish",
      post_date: product.post_date ? product.post_date.split(' ')[0] : new Date().toISOString().split('T')[0],
      sku: product.sku || "",
      stock: product.stock || 0,
      regular_price: product.regular_price || 0,
      sale_price: product.sale_price || 0,
      metadesc: product.metadesc || "",
      product_category: product.product_category ? product.product_category.split(',').map(cat => cat.trim()).filter(cat => cat) : [],
      product_tag: product.product_tag || "",
      "attribute:pa_brands": product["attribute:pa_brands"] || "",
      "attribute:pa_colour": product["attribute:pa_colour"] ? product["attribute:pa_colour"].split(',').map(colour => colour.trim()).filter(colour => colour) : [],
      "attribute:pa_finish": product["attribute:pa_finish"] ? product["attribute:pa_finish"].split(',').map(finish => finish.trim()).filter(finish => finish) : [],
      "attribute:pa_size": product["attribute:pa_size"] ? product["attribute:pa_size"].split(',').map(size => size.trim()).filter(size => size) : [],
      "meta:product_details": product["meta:product_details"] || "",
      pdf_url: product.pdf_url || "",
      pdf_preview: product.pdf_url || "",
      pdf_file: null,
      featured_image: product.featured_image || "",
      featured_preview: product.featured_image || "",
      featured_file: null,
      gallery_images: product.gallery_images || "",
      gallery_previews: galleryPreviews,
      gallery_files: [],
      youtube_video_url: product.youtube_video_url || "",
      promo: product.promo ? product.promo.split(',').map(promo => promo.trim()).filter(promo => promo) : [],
    });
    console.log("FormData after setting:", formData);
    setShowAddModal(true);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    // Debounce the API call
    debounceTimeoutRef.current = setTimeout(() => {
      setCurrentPage(1);
      updateURLParams({ search: value, page: 1 });
      fetchProducts(1, value, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection);
    }, 500); // 500ms debounce
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    updateURLParams({ brand: value, page: 1 });
    fetchProducts(1, searchTerm, value, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory);
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setCurrentPage(1);
    updateURLParams({ status: value, page: 1 });
    fetchProducts(1, searchTerm, selectedCategory, value, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory);
  };

  const handleColourChange = (value) => {
    setSelectedColour(value);
    setCurrentPage(1);
    updateURLParams({ colour: value, page: 1 });
    fetchProducts(1, searchTerm, selectedCategory, selectedStatus, value, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory);
  };

  const handleFinishChange = (value) => {
    setSelectedFinish(value);
    setCurrentPage(1);
    updateURLParams({ finish: value, page: 1 });
    fetchProducts(1, searchTerm, selectedCategory, selectedStatus, selectedColour, value, selectedPromo, selectedProductTypes, selectedProductCategory);
  };

  const handlePromoChange = (value) => {
    setSelectedPromo(value);
    setCurrentPage(1);
    updateURLParams({ promo: value, page: 1 });
    fetchProducts(1, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, value, selectedProductTypes, selectedProductCategory);
  };

  const handleProductCategoryChange = (value) => {
    setSelectedProductCategory(value);
    setCurrentPage(1);
    updateURLParams({ category_id: value, page: 1 });
    fetchProducts(1, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, value, sortField, sortDirection);
  };

  const handleProductTypeChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedProductTypes(values);
    setCurrentPage(1);
    updateURLParams({ product_type: values, page: 1 });
    fetchProducts(1, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, values, selectedProductCategory);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURLParams({ page });
    fetchProducts(page, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection);
  };

  // Function to open download modal
  const openDownloadModal = () => {
    setShowDownloadModal(true);
    // Initialize with all brands selected
    setSelectedBrandsForDownload(brands.map(brand => brand.name));
  };

  // Function to download selected products as CSV
  const downloadProductsCSV = async () => {
    try {
      setLoading(true);
      
      // Build brand filter parameter
      let brandFilter = '';
      if (selectedBrandsForDownload.length > 0 && selectedBrandsForDownload.length < brands.length) {
        brandFilter = selectedBrandsForDownload.map(brand => encodeURIComponent(brand)).join(',');
      }
      
      // Fetch products with brand filter
      let url = "https://stiles.co.za/api/admin-products.php?limit=10000";
      if (brandFilter) {
        url += `&brands=${brandFilter}`;
      }
      
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();

      if (data.status === "success" && data.products) {
        let filteredProducts = data.products;
        
        // If we have brand filter, also filter on frontend to ensure accuracy
        if (selectedBrandsForDownload.length > 0 && selectedBrandsForDownload.length < brands.length) {
          filteredProducts = data.products.filter(product => 
            selectedBrandsForDownload.includes(product['attribute:pa_brands'])
          );
        }
        
        // Define CSV headers based on product structure
        const headers = [
          'ID', 'Title', 'Slug', 'Description', 'Status', 'Post Date', 'SKU', 'Stock',
          'Regular Price', 'Sale Price', 'Meta Description', 'Product Category', 'Product Tag',
          'Brand', 'Colour', 'Finish', 'Size', 'Product Details', 'PDF URL', 'Featured Image',
          'Gallery Images', 'YouTube Video URL', 'Promo'
        ];

        // Convert products to CSV rows (using tilde as separator)
        const csvRows = [
          headers.join('~'),
          ...filteredProducts.map(product => [
            String(product.ID || product.id || ''),
            `"${(product.title || '').replace(/"/g, '""')}"`,
            product.slug || '',
            `"${(product.description || '').replace(/"/g, '""')}"`,
            product.status || '',
            product.post_date || '',
            product.sku || '',
            product.stock || '',
            product.regular_price || '',
            product.sale_price || '',
            `"${(product.metadesc || '').replace(/"/g, '""')}"`,
            Array.isArray(product.product_category) ? product.product_category.join(', ') : (product.product_category || ''),
            product.product_tag || '',
            product['attribute:pa_brands'] || '',
            Array.isArray(product['attribute:pa_colour']) ? product['attribute:pa_colour'].join(', ') : (product['attribute:pa_colour'] || ''),
            Array.isArray(product['attribute:pa_finish']) ? product['attribute:pa_finish'].join(', ') : (product['attribute:pa_finish'] || ''),
            Array.isArray(product['attribute:pa_size']) ? product['attribute:pa_size'].join(', ') : (product['attribute:pa_size'] || ''),
            `"${(product['meta:product_details'] || '').replace(/"/g, '""')}"`,
            product.pdf_url || '',
            product.featured_image || '',
            product.gallery_images || '',
            product.youtube_video_url || '',
            Array.isArray(product.promo) ? product.promo.join(', ') : (product.promo || '')
          ].join('~'))
        ];

        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          const brandSuffix = selectedBrandsForDownload.length < brands.length ? 
            `_${selectedBrandsForDownload.length}brands` : 'all';
          link.setAttribute('href', url);
          link.setAttribute('download', `products_${brandSuffix}_${new Date().toISOString().split('T')[0]}.csv`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
        // Close modal and show Excel instructions after successful download
        setShowDownloadModal(false);
        setShowExcelInstructions(true);
      } else {
        alert('Error fetching products for CSV download');
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Error downloading CSV file');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle CSV file upload
  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Please select a valid CSV file');
      return;
    }

    try {
      setCsvUploading(true);
      const formData = new FormData();
      formData.append('csv_file', file);

      const response = await fetch('https://stiles.co.za/api/upload-products-csv.php', {
        method: 'POST',
        body: formData,
      });

      // Check response status and content type
      const contentType = response.headers.get('content-type') || '';
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP ${response.status} Error:`, errorText);
        
        if (contentType.includes('text/html') || errorText.trim().startsWith('<!DOCTYPE')) {
          throw new Error(`HTTP ${response.status} Forbidden: The server is blocking this request. This is likely a server security configuration issue.`);
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200) || response.statusText}`);
      }

      if (!contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Expected JSON but got:', contentType, text.substring(0, 200));
        throw new Error(`Server returned ${contentType} instead of JSON`);
      }

      const result = await response.json();

      if (result.status === 'success') {
        alert(`CSV upload successful!\nUpdated: ${result.updated} products\nInserted: ${result.inserted} new products`);
        // Invalidate cache and refresh the products list
        invalidateCache();
        fetchProducts(currentPage, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection, false);
      } else {
        alert(`Error uploading CSV: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      alert(`Error uploading CSV file: ${error.message || error}`);
    } finally {
      setCsvUploading(false);
      // Reset the file input
      event.target.value = '';
    }
  };

  // Only show full page loading on initial load
  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-0 pt-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product catalog and inventory.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* CSV Download Button */}
          <button
            onClick={openDownloadModal}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download CSV
          </button>
          
          {/* CSV Upload Button */}
          <div className="relative opacity-50 cursor-not-allowed">
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
              disabled
              id="csv-upload"
              // disabled={csvUploading}
            />
            <label
              htmlFor="csv-upload"
              className={`bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                csvUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {csvUploading ? 'Uploading...' : 'Upload CSV'}
            </label>
          </div>
          
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="space-y-4">
          {/* First row - Search and Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
               <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                   onKeyPress={(e) => {
                     if (e.key === 'Enter') {
                       // Clear debounce and search immediately
                       if (debounceTimeoutRef.current) {
                         clearTimeout(debounceTimeoutRef.current);
                       }
                       setCurrentPage(1);
                       updateURLParams({ search: searchTerm, page: 1 });
                       fetchProducts(1, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection);
                     }
                   }}
                   className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                 />
                 <button
                   onClick={() => {
                     // Clear debounce and search immediately
                     if (debounceTimeoutRef.current) {
                       clearTimeout(debounceTimeoutRef.current);
                     }
                     setCurrentPage(1);
                     updateURLParams({ search: searchTerm, page: 1 });
                     fetchProducts(1, searchTerm, selectedCategory, selectedStatus, selectedColour, selectedFinish, selectedPromo, selectedProductTypes, selectedProductCategory, sortField, sortDirection);
                   }}
                   className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   Search
                 </button>
               </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.name}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Category
              </label>
              <select
                value={selectedProductCategory}
                onChange={(e) => handleProductCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {getSortedCategories().map((category) => (
                  <option key={category.id} value={category.id}>
                    {'  '.repeat(category.level || 0)}{category.level > 0 ? '└─ ' : ''}{category.category}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Second row - Status, Colour, and Finish */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="publish">Published</option>
                <option value="private">Private</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Colour
              </label>
              <select
                value={selectedColour}
                onChange={(e) => handleColourChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Colours</option>
                {colours.map((colour) => (
                  <option key={colour.id} value={colour.name}>
                    {colour.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finish
              </label>
              <select
                value={selectedFinish}
                onChange={(e) => handleFinishChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Finishes</option>
                {finishes.map((finish) => (
                  <option key={finish.id} value={finish.name}>
                    {finish.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo
              </label>
              <select
                value={selectedPromo}
                onChange={(e) => handlePromoChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Promos</option>
                {promos.map((promo) => (
                  <option key={promo.id} value={promo.name}>
                    {promo.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Type
              </label>
              <Select
                isMulti
                value={selectedProductTypes.map(type => ({ value: type, label: type }))}
                onChange={handleProductTypeChange}
                options={[
                  { value: "Tiles", label: "Tiles" },
                  { value: "Sanitary Ware", label: "Sanware" },
                  { value: "Engineered Hardwood", label: "Engineered Hardwood" },
                  { value: "Vinyl", label: "Vinyl" },
                  { value: "Laminate", label: "Laminate" },
                  { value: "Accessories", label: "Accessories" }
                ]}
                placeholder="Select product types..."
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '42px',
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#d1d5db'
                    }
                  })
                }}
              />
            </div>
          </div>
          
          {/* Reset Filters Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedStatus("all");
                setSelectedColour("all");
                setSelectedFinish("all");
                setSelectedPromo("all");
                setSelectedProductTypes([]);
                setSelectedProductCategory("all");
                setCurrentPage(1);
                setSortField(null);
                setSortDirection("asc");
                // Clear all URL params except slug
                const newParams = new URLSearchParams();
                if (searchParams.get('slug')) {
                  newParams.set('slug', searchParams.get('slug'));
                }
                setSearchParams(newParams, { replace: true });
                fetchProducts(1, "", "all", "all", "all", "all", "all", [], "all", null, "asc");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
            >
              Reset Filters
            </button>
          </div>
          
          {/* Third row - Product count and active filters */}
          <div className="border-t pt-4">
            <div className="text-sm text-gray-600">
              <div className="font-medium">Showing {products.length} of {pagination.total_products} products</div>
              {(searchTerm || selectedCategory !== "all" || selectedStatus !== "all" || selectedColour !== "all" || selectedFinish !== "all" || selectedPromo !== "all" || selectedProductTypes.length > 0 || selectedProductCategory !== "all") && (
                <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                  <span className="font-medium">Active Filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Brand: {selectedCategory}
                    </span>
                  )}
                  {selectedStatus !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Status: {selectedStatus}
                    </span>
                  )}
                  {selectedColour !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                      Colour: {selectedColour}
                    </span>
                  )}
                  {selectedFinish !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-pink-100 text-pink-800">
                      Finish: {selectedFinish}
                    </span>
                  )}
                  {selectedPromo !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                      Promo: {selectedPromo}
                    </span>
                  )}
                  {selectedProductTypes.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
                      Product Type: {selectedProductTypes.join(", ")}
                    </span>
                  )}
                  {selectedProductCategory !== "all" && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-800">
                      Product Category: {uniqueCategories.find(cat => String(cat.id) === String(selectedProductCategory))?.category || selectedProductCategory}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedProducts.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedProducts([])}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden relative">
        {/* Table Loading Overlay */}
        {tableLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading products...</p>
            </div>
          </div>
        )}
        
        {filteredProducts.length === 0 && !loading ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <button className='px-6 py-3 border-b border-gray-200 bg-purple-400 text-white w-full my-3 mx-auto text-center' onClick={() => syncIqPrices()}>Sync IQ Prices</button>
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[40px]">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === filteredProducts.length && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th 
                    className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[200px] cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Product</span>
                      {sortField === 'title' && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="hidden md:table-cell px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px] cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('brand')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Brand</span>
                      {sortField === 'brand' && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('sku')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>SKU</span>
                      {sortField === 'sku' && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="hidden sm:table-cell px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('iq_price')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Price (IQ)</span>
                      {sortField === 'iq_price' && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="hidden lg:table-cell px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px] cursor-pointer hover:bg-gray-100 select-none"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Status</span>
                      {sortField === 'status' && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[60px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.ID || product.id} className="hover:bg-gray-50">
                    <td className="px-2 sm:px-3 py-4">
                      <input
                        type="checkbox"
                        checked={selectedProducts.includes(String(product.ID || product.id))}
                        onChange={(e) => handleBulkSelect(String(product.ID || product.id), e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-2 sm:px-3 py-4">
                      <div className="flex items-center min-w-0">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                            src={
                              product.featured_image + "?v=" + new Date().getTime()
                            }
                            alt={product.title}
                            onError={(e) => {
                              e.target.src = "/images/product_ph.png";
                            }}
                          />
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {product.slug}
                          </div>
                          {/* Show additional info on mobile */}
                          <div className="md:hidden mt-1 space-y-1">
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Brand:</span> {product["attribute:pa_brands"] || "N/A"}
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">SKU:</span> {product.sku || "N/A"}
                            </div>
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Price:</span> {product.iq_price ? `R${product.iq_price}` : "N/A"}
                            </div>
                            <div className="text-xs">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  product.status === "publish"
                                    ? "bg-green-100 text-green-800"
                                    : product.status === "private"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {product.status === "publish" 
                                  ? "Published" 
                                  : product.status === "private"
                                  ? "Private"
                                  : "Draft"
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-2 sm:px-3 py-4 text-sm text-gray-900">
                      <div className="truncate" title={product["attribute:pa_brands"] || "N/A"}>
                        {product["attribute:pa_brands"] || "N/A"}
                      </div>
                    </td>
                    <td className="px-2 sm:px-3 py-4 text-sm text-gray-900">
                      <div className="truncate" title={product.sku || "N/A"}>
                        {product.sku || "N/A"}
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-3 py-4 text-sm text-gray-900">
                      <div className="truncate" title={product.iq_price ? formatCurrency(product.iq_price) : "N/A"}>
                        {product.iq_price ? formatCurrency(product.iq_price) : "N/A"}
                      </div>
                    </td>
                    <td className="hidden lg:table-cell px-2 sm:px-3 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "publish"
                            ? "bg-green-100 text-green-800"
                            : product.status === "private"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status === "publish" 
                          ? "Published" 
                          : product.status === "private"
                          ? "Private"
                          : "Draft"
                        }
                      </span>
                    </td>
                    <td className="px-2 sm:px-3 py-4 text-sm font-medium">
                      <div className="relative">
                        <button
                            onClick={(e) => toggleMenu(String(product.ID || product.id), product, e)}
                          className="menu-trigger p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          title="Actions"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        
                        {openMenuId === String(product.ID || product.id) && (
                          <div 
                            className="dropdown-menu fixed w-48 bg-white rounded-md shadow-lg z-[9999] border border-gray-200"
                            style={{ 
                              top: `${dropdownPosition.top}px`,
                              right: `${dropdownPosition.right}px`
                            }}
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleQuickView(product)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-3 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Quick View
                              </button>
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Product
                              </button>
                              <button
                                onClick={() => handleDuplicateProduct(product)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Duplicate Product
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(String(product.ID || product.id))}
                                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <svg className="w-4 h-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Product
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.total_pages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
              <div className="text-sm text-gray-700">
                Showing page {pagination.current_page} of{" "}
                {pagination.total_pages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={!pagination.has_prev_page}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>

                {/* Page numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from(
                    { length: Math.min(5, pagination.total_pages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.total_pages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.current_page <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.current_page >=
                        pagination.total_pages - 2
                      ) {
                        pageNum = pagination.total_pages - 4 + i;
                      } else {
                        pageNum = pagination.current_page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md ${
                            pageNum === pagination.current_page
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={!pagination.has_next_page}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {(showAddModal || editingProduct) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ marginTop: '0px !important' }}>
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => {
                  cleanupBlobUrls();
                  setShowAddModal(false);
                  setEditingProduct(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
               <form onSubmit={handleSubmit} className="space-y-4">
                                   {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateSlug}
                        disabled={!formData.title}
                        className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-1"
                        title="Generate slug from title"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Auto
                      </button>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="draft">Draft</option>
                        <option value="private">Private</option>
                        <option value="publish">Publish</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                      Post Date
                    </label>
                    <input
                      type="date"
                      name="post_date"
                      value={formData.post_date}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    {/* IQ Status Badge */}
                    {formData.sku && (
                      <div className="mb-2">
                        {checkingIq ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-yellow-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Checking IQ status...
                          </span>
                        ) : iqStatus === true ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Found in IQ table
                          </span>
                        ) : iqStatus === false ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ✗ Not found in IQ table
                          </span>
                        ) : null}
                      </div>
                    )}
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>


                                   {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Rich Text)
                    </label>
                    <div className="border border-gray-300 rounded-md">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="description"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<strong>' + selected + '</strong>' + after;
                            setFormData(prev => ({ ...prev, description: newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="description"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<em>' + selected + '</em>' + after;
                            setFormData(prev => ({ ...prev, description: newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="description"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<a href="#">' + selected + '</a>' + after;
                            setFormData(prev => ({ ...prev, description: newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Link"
                        >
                          Link
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="description"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<br>' + selected + after;
                            setFormData(prev => ({ ...prev, description: newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Line Break"
                        >
                          BR
                        </button>
                      </div>
                      <textarea
                        rows={4}
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0"
                        placeholder="Enter HTML content for rich text description..."
                      />
                    </div>
                  </div>

                 {/* Meta Information */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     Meta Description
                  </label>
                  <textarea
                    rows={3}
                     name="metadesc"
                     value={formData.metadesc}
                     onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Product Category
                    </label>
                    <Select
                      name="product_category"
                      isMulti
                      value={formData.product_category.map(cat => ({
                        value: cat,
                        label: cat
                      }))}
                      onChange={(selectedOptions) => {
                        const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                        setFormData(prev => ({
                          ...prev,
                          product_category: values
                        }));
                      }}
                      options={categories.map(category => ({
                        value: category.name,
                        label: category.name
                      }))}
                      placeholder="Select categories..."
                      isClearable
                    />
                     {/* <textarea
                       rows={2}
                       name="product_category"
                       value={formData.product_category}
                       onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    /> */}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                       Product Tags
                    </label>
                     <textarea
                       rows={2}
                       name="product_tag"
                       value={formData.product_tag}
                       onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                 </div>

                                   {/* Attributes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                    </label>
                      <select
                        name="attribute:pa_brands"
                        value={formData["attribute:pa_brands"]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a brand</option>
                        {brands.map((brand) => (
                          <option key={brand.id} value={brand.name}>
                            {brand.name}
                          </option>
                        ))}
                    </select>
                  </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Colour
                      </label>
                      <Select
                        name="attribute:pa_colour"
                        isMulti
                        value={formData["attribute:pa_colour"].map(colour => ({
                          value: colour,
                          label: colour
                        }))}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                          setFormData(prev => ({
                            ...prev,
                            "attribute:pa_colour": values
                          }));
                        }}
                        options={colours.map(colour => ({
                          value: colour.name,
                          label: colour.name
                        }))}
                        placeholder="Select colours..."
                        isClearable
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Finish
                      </label>
                      <Select
                        name="attribute:pa_finish"
                        isMulti
                        value={formData["attribute:pa_finish"].map(finish => ({
                          value: finish,
                          label: finish
                        }))}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                          setFormData(prev => ({
                            ...prev,
                            "attribute:pa_finish": values
                          }));
                        }}
                        options={finishes.map(finish => ({
                          value: finish.name,
                          label: finish.name
                        }))}
                        placeholder="Select finishes..."
                        isClearable
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <Select
                        name="attribute:pa_size"
                        isMulti
                        value={formData["attribute:pa_size"].map(size => ({
                          value: size,
                          label: size
                        }))}
                        onChange={(selectedOptions) => {
                          const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                          setFormData(prev => ({
                            ...prev,
                            "attribute:pa_size": values
                          }));
                        }}
                        options={sizes.map(size => ({
                          value: size.name,
                          label: size.name
                        }))}
                        placeholder="Select sizes..."
                        isClearable
                      />
                    </div>
                  </div>

                                   {/* Product Details */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Details (Rich Text)
                    </label>
                    <div className="border border-gray-300 rounded-md">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="meta:product_details"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<strong>' + selected + '</strong>' + after;
                            setFormData(prev => ({ ...prev, "meta:product_details": newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Bold"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="meta:product_details"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<em>' + selected + '</em>' + after;
                            setFormData(prev => ({ ...prev, "meta:product_details": newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Italic"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="meta:product_details"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<a href="#">' + selected + '</a>' + after;
                            setFormData(prev => ({ ...prev, "meta:product_details": newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Link"
                        >
                          Link
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const textarea = document.querySelector('textarea[name="meta:product_details"]');
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const before = text.substring(0, start);
                            const selected = text.substring(start, end);
                            const after = text.substring(end);
                            const newText = before + '<br>' + selected + after;
                            setFormData(prev => ({ ...prev, "meta:product_details": newText }));
                          }}
                          className="px-2 py-1 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
                          title="Line Break"
                        >
                          BR
                        </button>
                      </div>
                      <textarea
                        rows={6}
                        name="meta:product_details"
                        value={formData["meta:product_details"]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-0"
                        placeholder="Enter HTML content for product details..."
                      />
                    </div>
                  </div>

                                   {/* Files */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PDF Document
                      </label>
                      <MediaSelector
                        value={formData.pdf_url}
                        onChange={(url) => {
                          setFormData(prev => ({
                            ...prev,
                            pdf_url: url,
                            pdf_preview: url
                          }));
                        }}
                        type="single"
                        accept="documents"
                        placeholder="Select PDF document..."
                        className="w-full"
                      />
                      {/* PDF Preview */}
                      {formData.pdf_url && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="mt-2">
                            <a 
                              href={formData.pdf_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View PDF
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      <MediaSelector
                        value={formData.featured_image}
                        onChange={(url) => {
                          setFormData(prev => ({
                            ...prev,
                            featured_image: url,
                            featured_preview: url
                          }));
                        }}
                        type="single"
                        accept="images"
                        placeholder="Select featured image..."
                        className="w-full"
                      />
                      {/* Featured Image Preview */}
                      {formData.featured_image && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700">Featured Image</span>
                          </div>
                          <div className="relative">
                            <img
                              src={formData.featured_image}
                              alt="Featured preview"
                              className="w-full h-32 object-cover rounded-md border"
                              onError={(e) => {
                                e.target.src = "/images/product_ph.png";
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gallery Images
                    </label>
                    <MediaSelector
                      value={formData.gallery_images ? formData.gallery_images.split(', ') : []}
                      onChange={(urls) => {
                        setFormData(prev => ({
                          ...prev,
                          gallery_images: urls.join(', '),
                          gallery_previews: urls
                        }));
                      }}
                      type="multiple"
                      accept="images"
                      placeholder="Select gallery images..."
                      className="w-full"
                    />
                    {/* Gallery Images Preview */}
                    {/* {formData.gallery_images && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                          </svg>
                          <span className="text-sm text-gray-700">Gallery Images</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
                          {formData.gallery_images.split(', ').map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={image.trim()}
                                alt={`Gallery ${index + 1}`}
                                className="w-full h-12 object-cover rounded border"
                                onError={(e) => {
                                  e.target.src = "/images/product_ph.png";
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )} */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    YouTube Video URL
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_video_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, youtube_video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.youtube_video_url && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center space-x-2 mb-2">
                        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span className="text-sm text-gray-700">YouTube Video Preview</span>
                      </div>
                      <div className="aspect-video bg-gray-200 rounded-md overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${extractYouTubeId(formData.youtube_video_url)}`}
                          title="YouTube video preview"
                          className="w-full h-full"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Promo
                  </label>
                  <Select
                    name="promo"
                    isMulti
                    value={formData.promo.map(promo => ({
                      value: promo,
                      label: promo
                    }))}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
                      setFormData(prev => ({
                        ...prev,
                        promo: values
                      }));
                    }}
                    options={promos.map(promo => ({
                      value: promo.name,
                      label: promo.name
                    }))}
                    placeholder="Select promos..."
                    isClearable
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                       cleanupBlobUrls();
                       setShowAddModal(false);
                       setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  {editingProduct && formData.slug && (
                    <button
                      type="button"
                      onClick={() => {
                        const productUrl = `${window.location.origin}/product/${formData.slug}`;
                        window.open(productUrl, '_blank');
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View Product
                    </button>
                  )}
                  <button
                    type="submit"
                     disabled={submitting}
                     className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {submitting
                       ? "Saving..."
                       : editingProduct
                       ? "Update Product"
                       : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Brand Selection Modal for CSV Download */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Brands to Download
              </h3>
              <button
                onClick={() => setShowDownloadModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Choose which brands you want to include in the CSV download:
                </p>
                
                {/* Select All / Deselect All buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setSelectedBrandsForDownload(brands.map(brand => brand.name))}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedBrandsForDownload([])}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Deselect All
                  </button>
                </div>
                
                {/* Brand checkboxes */}
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-3">
                  {brands.map((brand) => (
                    <label key={brand.id} className="flex items-center space-x-2 py-1 hover:bg-gray-50 rounded px-2">
                      <input
                        type="checkbox"
                        checked={selectedBrandsForDownload.includes(brand.name)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBrandsForDownload([...selectedBrandsForDownload, brand.name]);
                          } else {
                            setSelectedBrandsForDownload(selectedBrandsForDownload.filter(b => b !== brand.name));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{brand.name}</span>
                    </label>
                  ))}
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  {selectedBrandsForDownload.length} of {brands.length} brands selected
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDownloadModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={downloadProductsCSV}
                  disabled={selectedBrandsForDownload.length === 0 || loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download CSV
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Excel Instructions Modal */}
      {showExcelInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                How to Open CSV in Excel
              </h3>
              <button
                onClick={() => setShowExcelInstructions(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Your CSV file uses tildes (~) as separators to handle commas and semicolons in your data. 
                  To open it correctly in Excel:
                </p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
                    <div>
                      <p className="font-medium text-gray-900">Open Excel</p>
                      <p className="text-gray-600">Start Microsoft Excel</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
                    <div>
                      <p className="font-medium text-gray-900">Go to Data Tab</p>
                      <p className="text-gray-600">Click on the "Data" tab in the ribbon</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
                    <div>
                      <p className="font-medium text-gray-900">Click "From Text/CSV"</p>
                      <p className="text-gray-600">In the "Get Data" section, click "From Text/CSV"</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">4</span>
                    <div>
                      <p className="font-medium text-gray-900">Select Your File</p>
                      <p className="text-gray-600">Browse and select the downloaded CSV file</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">5</span>
                    <div>
                      <p className="font-medium text-gray-900">Set Delimiter</p>
                      <p className="text-gray-600">In the preview window, set the delimiter to <span className="font-mono bg-gray-100 px-1 rounded">~</span> (tilde)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">6</span>
                    <div>
                      <p className="font-medium text-gray-900">Load Data</p>
                      <p className="text-gray-600">Click "Load" to import the data into Excel</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Important:</strong> Don't just double-click the file to open it. Use the "From Text/CSV" method above to ensure proper formatting.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800">
                        <strong>Excel Save Options:</strong> Try File → Save As → "Unicode Text" or "Text (MS-DOS)" → Change extension to .csv. If these don't work, use the text editor method below.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        <strong>Recommended Method:</strong> Use a text editor like Notepad++ or VS Code to edit the CSV file directly. This preserves the tilde separators perfectly.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-md">
                  <div className="flex">
                    <svg className="w-5 h-5 text-purple-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm text-purple-800">
                        <strong>Step-by-Step Text Editor Method:</strong><br/>
                        1. Download the CSV file<br/>
                        2. Open with Notepad++ or VS Code<br/>
                        3. Make your edits directly in the text editor<br/>
                        4. Save the file (Ctrl+S)<br/>
                        5. Upload the modified file
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowExcelInstructions(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Got it!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;