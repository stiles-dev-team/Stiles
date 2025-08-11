import React, { useState, useEffect } from "react";

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colours, setColours] = useState([]);
  const [finishes, setFinishes] = useState([]);
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
    product_category: "",
    product_tag: "",
    "attribute:pa_brands": "",
    "attribute:pa_colour": "",
    "attribute:pa_finish": "",
    "attribute:pa_size": "",
    "meta:product_details": "",
    pdf_url: "",
    pdf_preview: "",
    featured_image: "",
    featured_preview: "",
    gallery_images: "",
    gallery_previews: [],
    promo: "",
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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts(1, searchTerm, selectedCategory);
    fetchCategories();
    fetchBrands();
    fetchColours();
    fetchFinishes();
  }, []);

  const fetchProducts = async (page = 1, search = "", category = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });

      if (search) params.append("search", search);
      if (category && category !== "all") params.append("brand", category);

      const response = await fetch(
        `https://stiles.co.za/api/admin-products.php?${params}`,
        {
          headers: { Accept: "application/json" },
        }
      );
      const data = await response.json();
      console.log(data);

      if (data.status === "success") {
        setProducts(data.products || []);
        setPagination(
          data.pagination || {
            current_page: 1,
            total_pages: 1,
            total_products: 0,
            products_per_page: 20,
            has_next_page: false,
            has_prev_page: false,
          }
        );
      } else {
        console.error("Error fetching products:", data.message);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/categories.php", {
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
      const response = await fetch("https://stiles.co.za/api/admin-products.php?limit=1000", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      
      if (data.status === "success" && data.products) {
        // Extract unique colours from products
        const uniqueColours = [...new Set(
          data.products
            .map(product => product['attribute:pa_colour'])
            .filter(colour => colour && colour !== 'N/A' && colour !== '')
        )].sort();
        
        setColours(uniqueColours.map(colour => ({ name: colour, id: colour })));
      }
    } catch (error) {
      console.error("Error fetching colours:", error);
    }
  };

  const fetchFinishes = async () => {
    try {
      const response = await fetch("https://stiles.co.za/api/admin-products.php?limit=1000", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      
      if (data.status === "success" && data.products) {
        // Extract unique finishes from products
        const uniqueFinishes = [...new Set(
          data.products
            .map(product => product['attribute:pa_finish'])
            .filter(finish => finish && finish !== 'N/A' && finish !== '')
        )].sort();
        
        setFinishes(uniqueFinishes.map(finish => ({ name: finish, id: finish })));
      }
    } catch (error) {
      console.error("Error fetching finishes:", error);
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

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(value);
  };

  // Server-side filtering is now handled by the API
  const filteredProducts = products;

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowAddModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await fetch(
          "https://stiles.co.za/api/admin-products.php",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({ id: productId }),
          }
        );

        const result = await response.json();

        if (result.status === "success") {
          alert("Product deleted successfully");
          fetchProducts(currentPage, searchTerm, selectedCategory);
        } else {
          alert("Error deleting product: " + result.message);
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Error deleting product");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = "https://stiles.co.za/api/admin-products.php";
      const method = editingProduct ? "PUT" : "POST";
      const body = editingProduct
        ? { ...formData, id: editingProduct.ID || editingProduct.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.status === "success") {
        alert(
          editingProduct
            ? "Product updated successfully"
            : "Product created successfully"
        );
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
           product_category: "",
           product_tag: "",
           "attribute:pa_brands": "",
           "attribute:pa_colour": "",
           "attribute:pa_finish": "",
           "attribute:pa_size": "",
           "meta:product_details": "",
           pdf_url: "",
           pdf_preview: "",
           featured_image: "",
           featured_preview: "",
           gallery_images: "",
           gallery_previews: [],
           promo: "",
         });
        fetchProducts(currentPage, searchTerm, selectedCategory);
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error saving product");
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

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  const openAddModal = async () => {
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
      product_category: "",
      product_tag: "",
      "attribute:pa_brands": "",
      "attribute:pa_colour": "",
      "attribute:pa_finish": "",
      "attribute:pa_size": "",
      "meta:product_details": "",
      pdf_url: "",
      pdf_preview: "",
      featured_image: "",
      featured_preview: "",
      gallery_images: "",
      gallery_previews: [],
      promo: "",
    });
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    console.log("Product data:", product);
    console.log("Product ID:", product.id);
    console.log("Product ID (uppercase):", product.ID);
    setEditingProduct(product);
    setFormData({
      id: product.ID || product.id || "",
      title: product.title || "",
      slug: product.slug || "",
      description: product.description || "",
      status: product.status || "publish",
      post_date: product.post_date ? product.post_date.split(' ')[0] : new Date().toISOString().split('T')[0],
      sku: product.sku || "",
      stock: 0,
      regular_price: 0,
      sale_price: 0,
      metadesc: product.metadesc || "",
      product_category: product.product_category || "",
      product_tag: product.product_tag || "",
      "attribute:pa_brands": product["attribute:pa_brands"] || "",
      "attribute:pa_colour": product["attribute:pa_colour"] || "",
      "attribute:pa_finish": product["attribute:pa_finish"] || "",
      "attribute:pa_size": product["attribute:pa_size"] || "",
      "meta:product_details": product["meta:product_details"] || "",
      pdf_url: product.pdf_url || "",
      pdf_preview: "",
      featured_image: product.featured_image || "",
      featured_preview: "",
      gallery_images: product.gallery_images || "",
      gallery_previews: [],
      promo: product.promo || "",
    });
    setShowAddModal(true);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    fetchProducts(1, value, selectedCategory);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
    setCurrentPage(1);
    fetchProducts(1, searchTerm, value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchProducts(page, searchTerm, selectedCategory);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your product catalog and inventory.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
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
              onChange={(e) => setSearchTerm(e.target.value)}
                 onBlur={() => handleSearch(searchTerm)}
                 onKeyPress={(e) => {
                   if (e.key === 'Enter') {
                     handleSearch(searchTerm);
                   }
                 }}
                 className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
               />
               <button
                 onClick={() => handleSearch(searchTerm)}
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
          <div className="flex items-end ml-auto">
            <span className="text-sm text-gray-600">
              Showing {products.length} of {pagination.total_products} products
            </span>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Product List</h3>
        </div>
        
        {filteredProducts.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No products found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="hidden md:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colour
                  </th>
                  <th className="hidden sm:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finish
                  </th>
                  <th className="hidden lg:table-cell px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.ID || product.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                            src={
                              product.featured_image || "/images/product_ph.png"
                            }
                            alt={product.title}
                            onError={(e) => {
                              e.target.src = "/images/product_ph.png";
                            }}
                          />
                        </div>
                        <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {product.title}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden md:table-cell px-3 py-4 text-sm text-gray-900">
                      {product["attribute:pa_brands"] || "N/A"}
                    </td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      {product["attribute:pa_colour"] || "N/A"}
                    </td>
                    <td className="hidden sm:table-cell px-3 py-4 text-sm text-gray-900">
                      {product["attribute:pa_finish"] || "N/A"}
                    </td>
                    <td className="hidden lg:table-cell px-3 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "publish"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {product.status === "publish" ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-sm font-medium">
                      <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.ID || product.id)}
                          className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                        >
                          Delete
                        </button>
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
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => {
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product ID
                      </label>
                      <input
                        type="text"
                        name="id"
                        value={formData.id}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={(e) => {
                          handleInputChange(e);
                          // Auto-generate slug from title
                          setFormData(prev => ({
                            ...prev,
                            slug: generateSlug(e.target.value)
                          }));
                        }}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug
                    </label>
                    <input
                      type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                     <textarea
                       rows={2}
                       name="product_category"
                       value={formData.product_category}
                       onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      <input
                        type="text"
                        name="attribute:pa_colour"
                        value={formData["attribute:pa_colour"]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter colour name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Finish
                      </label>
                      <input
                        type="text"
                        name="attribute:pa_finish"
                        value={formData["attribute:pa_finish"]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter finish type"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Size
                      </label>
                      <input
                        type="text"
                        name="attribute:pa_size"
                        value={formData["attribute:pa_size"]}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 1200 x 1200"
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
                        PDF URL
                      </label>
                      <input
                        type="file"
                        accept=".pdf"
                        name="pdf_url"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData(prev => ({
                              ...prev,
                              pdf_url: file.name,
                              pdf_preview: URL.createObjectURL(file)
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {/* PDF Preview */}
                      {(formData.pdf_preview || (editingProduct && editingProduct.pdf_url)) && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700">
                              {formData.pdf_url || editingProduct?.pdf_url}
                            </span>
                          </div>
                          {formData.pdf_preview && (
                            <div className="mt-2">
                              <a 
                                href={formData.pdf_preview} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                Preview PDF
                              </a>
                            </div>
                          )}
                          {editingProduct && editingProduct.pdf_url && !formData.pdf_preview && (
                            <div className="mt-2">
                              <a 
                                href={editingProduct.pdf_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm"
                              >
                                View Current PDF
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Featured Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        name="featured_image"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData(prev => ({
                              ...prev,
                              featured_image: file.name,
                              featured_preview: URL.createObjectURL(file)
                            }));
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {/* Featured Image Preview */}
                      {(formData.featured_preview || (editingProduct && editingProduct.featured_image)) && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm text-gray-700">Featured Image</span>
                          </div>
                          <div className="relative">
                            <img
                              src={formData.featured_preview || editingProduct?.featured_image}
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
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      name="gallery_images"
                      onChange={(e) => {
                        const files = Array.from(e.target.files);
                        if (files.length > 0) {
                          const previews = files.map(file => URL.createObjectURL(file));
                          setFormData(prev => ({
                            ...prev,
                            gallery_images: files.map(f => f.name).join(', '),
                            gallery_previews: previews
                          }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {/* Gallery Images Preview */}
                    {(formData.gallery_previews || (editingProduct && editingProduct.gallery_images)) && (
                      <div className="mt-2 p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-2 mb-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                          </svg>
                          <span className="text-sm text-gray-700">Gallery Images</span>
                        </div>
                                                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1">
                           {formData.gallery_previews ? (
                             formData.gallery_previews.map((preview, index) => (
                               <div key={index} className="relative">
                                 <img
                                   src={preview}
                                   alt={`Gallery ${index + 1}`}
                                   className="w-full h-12 object-cover rounded border"
                                 />
                               </div>
                             ))
                           ) : editingProduct && editingProduct.gallery_images ? (
                             editingProduct.gallery_images.split(', ').map((image, index) => (
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
                             ))
                           ) : null}
                         </div>
                      </div>
                    )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Promo
                  </label>
                  <input
                     type="text"
                     name="promo"
                     value={formData.promo}
                     onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                       setShowAddModal(false);
                       setEditingProduct(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
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
    </div>
  );
};

export default AdminProducts;
