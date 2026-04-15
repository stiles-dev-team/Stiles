import React, { useState, useEffect } from "react";
import MediaSelector from "../../components/MediaSelector";

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [homeContent, setHomeContent] = useState({
    hero: {
      slides: [
        {
          id: 1,
          title: "Quality and Style Specially Handpicked for You",
          subtitle: "",
          background_image: "/images/Website_Banners.jpg",
          button_text: "Know More",
          button_link: "#whoweareHome"
        },
        {
          id: 2,
          title: "Quality and Style Specially Handpicked for You",
          subtitle: "",
          background_image: "/images/Website_Banners2.jpg",
          button_text: "Know More",
          button_link: "#whoweareHome"
        },
        {
          id: 3,
          title: "Quality and Style Specially Handpicked for You",
          subtitle: "",
          background_image: "/images/Website_Banners3.jpg",
          button_text: "Know More",
          button_link: "#whoweareHome"
        },
        {
          id: 4,
          title: "Quality and Style Specially Handpicked for You",
          subtitle: "",
          background_image: "/images/Website_Banners4.jpg",
          button_text: "Know More",
          button_link: "#whoweareHome"
        }
      ]
    },
    whoWeAre: {
      title: "WE ARE STILES",
      paragraph1: "At Stiles, we're all about keeping things stylish, in your home, your office, your restaurant, and any space you can imagine! Our goal at Stiles is to be exclusive and unique, offering only the best quality tiles and sanitaryware in South Africa. Quality and style will always outweigh price when we select products.",
      paragraph2: "Along with importing products from top tile and sanitaryware factories across the globe, we pride ourselves in being a community-driven South African company. Stiles supports local industry, artisans and artists from South Africa. We believe in the tiles and sanitaryware we market, and employ creative people with an enthusiasm to keep all things stylish, making us leaders in service, technical advice, creative ability and innovative ideas."
    },
    ourProducts: {
      title: "Our Products",
      subtitle: "Discover our curated collection",
      featured_products: [],
      category: "Tiles"
    },
    subscribeBanner: {
      title: "Subscribe to our newsletter",
      subtitle: "Get the latest updates and exclusive offers",
      placeholder: "Enter your email"
    },
    shopCategory: {
      title: "Shop by category",
      subtitle: "Find what you're looking for",
      categories: [
        {
          id: 1,
          name: "Floor Tiles",
          image: "/images/floor_tiles.webp",
          link: "/product-category/tiles/floor-tiles",
          position: "row-span-2"
        },
        {
          id: 2,
          name: "Bathrooms",
          image: "/images/bathrooms.jpg",
          link: "/product-category/sanitary-ware/bathroom-accessories",
          position: "default"
        },
        {
          id: 3,
          name: "Kitchen Sinks",
          image: "/images/kitchen_sinks.jpg",
          link: "/product-category/sanitary-ware/kitchen-sinks",
          position: "col-start-2 row-start-2"
        },
        {
          id: 4,
          name: "Mosaics",
          image: "/images/mosaics.png",
          link: "/product-category/tiles/mosaics",
          position: "row-span-2 col-start-3 row-start-1"
        }
      ]
    },
    weWorkWithTheBest: {
      title: "We Work With The Best",
      subtitle: "Partnering with leading brands"
    },
    blog: {
      title: "Latest from our blog",
      subtitle: "Stay updated with the latest trends"
    }
  });

  useEffect(() => {
    fetchHomeContent();
    fetchBlogs();
  }, []);

  const fetchHomeContent = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://stiles.co.za/api/admin-content.php?page=home", {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      
      if (data.success) {
        setHomeContent(data.content);
      } else {
        console.error("Error fetching content:", data.message);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setHomeContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (page) => {
    setSaving(true);
    try {
      const response = await fetch("https://stiles.co.za/api/admin-content.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          page: page,
          content: page === "home" ? homeContent : {}
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Content saved successfully!");
      } else {
        alert("Error saving content: " + result.message);
      }
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Error saving content");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (section, field, e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll just store the filename
      // In a real implementation, you'd upload to server and get URL
      handleInputChange(section, field, file.name);
    }
  };

  const handleCategoryChange = (index, field, value) => {
    setHomeContent(prev => ({
      ...prev,
      shopCategory: {
        ...prev.shopCategory,
        categories: prev.shopCategory.categories.map((category, i) => 
          i === index ? { ...category, [field]: value } : category
        )
      }
    }));
  };

  const handleCategoryImageUpload = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll just store the filename
      // In a real implementation, you'd upload to server and get URL
      handleCategoryChange(index, "image", `/images/${file.name}`);
    }
  };

  const handleSlideChange = (slideIndex, field, value) => {
    setHomeContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: prev.hero.slides.map((slide, i) => 
          i === slideIndex ? { ...slide, [field]: value } : slide
        )
      }
    }));
  };

  const handleSlideImageUpload = (slideIndex, e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll just store the filename
      // In a real implementation, you'd upload to server and get URL
      handleSlideChange(slideIndex, "background_image", `/images/${file.name}`);
    }
  };

  const addSlide = () => {
    const newSlideId = Math.max(...homeContent.hero.slides.map(slide => slide.id)) + 1;
    const newSlide = {
      id: newSlideId,
      title: "New Slide Title",
      subtitle: "",
      background_image: "/images/placeholder.jpg",
      button_text: "Learn More",
      button_link: "#"
    };
    
    setHomeContent(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        slides: [...prev.hero.slides, newSlide]
      }
    }));
  };

  const removeSlide = (slideIndex) => {
    if (homeContent.hero.slides.length > 1) {
      setHomeContent(prev => ({
        ...prev,
        hero: {
          ...prev.hero,
          slides: prev.hero.slides.filter((_, i) => i !== slideIndex)
        }
      }));
    }
  };

  // Blog management functions
  const fetchBlogs = async () => {
    try {
      const response = await fetch('https://stiles.co.za/api/admin-blogs.php');
      const data = await response.json();
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        console.error('Failed to fetch blogs:', data.error);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
    }
  };

  const handleSaveBlog = async (blogData) => {
    setSaving(true);
    try {
      const response = await fetch('https://stiles.co.za/api/admin-blogs.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(blogData)
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchBlogs();
        setShowBlogForm(false);
        setSelectedBlog(null);
      } else {
        console.error('Failed to save blog:', data.error);
      }
    } catch (error) {
      console.error('Error saving blog:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        const response = await fetch('https://stiles.co.za/api/admin-blogs.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ID: blogId })
        });
        
        const data = await response.json();
        if (data.success) {
          await fetchBlogs();
        } else {
          console.error('Failed to delete blog:', data.error);
        }
      } catch (error) {
        console.error('Error deleting blog:', error);
      }
    }
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setShowBlogForm(true);
  };

  const handleNewBlog = () => {
    setSelectedBlog({
      post_title: '',
      slug: '',
      post_content: '',
      post_excerpt: '',
      post_status: 'publish',
      categories: '',
      tags: '',
      featured_image: '',
      content_images: [],
      metadescription: ''
    });
    setShowBlogForm(true);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  };

  if (loading) {
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
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage content for your website pages.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("home")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "home"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Home Page
            </button>
            <button
              onClick={() => setActiveTab("about")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "about"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              About Page
            </button>
            <button
              onClick={() => setActiveTab("contact")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "contact"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Contact Page
            </button>
            <button
              onClick={() => setActiveTab("blogs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "blogs"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Blogs
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "home" && (
            <div className="space-y-8">
              {/* Hero Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Hero Section</h3>
                  <button
                    onClick={addSlide}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Add Slide
                  </button>
                </div>
                
                {homeContent.hero.slides.map((slide, slideIndex) => (
                  <div key={slide.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-white">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">Slide {slideIndex + 1}</h4>
                      {homeContent.hero.slides.length > 1 && (
                        <button
                          onClick={() => removeSlide(slideIndex)}
                          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Slide Title
                        </label>
                        <input
                          type="text"
                          value={slide.title}
                          onChange={(e) => handleSlideChange(slideIndex, "title", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtitle (Optional)
                        </label>
                        <input
                          type="text"
                          value={slide.subtitle}
                          onChange={(e) => handleSlideChange(slideIndex, "subtitle", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Text
                        </label>
                        <input
                          type="text"
                          value={slide.button_text}
                          onChange={(e) => handleSlideChange(slideIndex, "button_text", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Button Link
                        </label>
                        <input
                          type="text"
                          value={slide.button_link}
                          onChange={(e) => handleSlideChange(slideIndex, "button_link", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Background Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSlideImageUpload(slideIndex, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {slide.background_image && (
                          <p className="text-sm text-gray-600 mt-1">
                            Current: {slide.background_image}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Who We Are Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Who We Are Section</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={homeContent.whoWeAre.title}
                      onChange={(e) => handleInputChange("whoWeAre", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Paragraph
                    </label>
                    <textarea
                      rows={3}
                      value={homeContent.whoWeAre.paragraph1}
                      onChange={(e) => handleInputChange("whoWeAre", "paragraph1", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Second Paragraph
                    </label>
                    <textarea
                      rows={4}
                      value={homeContent.whoWeAre.paragraph2}
                      onChange={(e) => handleInputChange("whoWeAre", "paragraph2", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Our Products Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Our Products Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={homeContent.ourProducts.title}
                      onChange={(e) => handleInputChange("ourProducts", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={homeContent.ourProducts.subtitle}
                      onChange={(e) => handleInputChange("ourProducts", "subtitle", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Category
                    </label>
                    <select
                      value={homeContent.ourProducts.category}
                      onChange={(e) => handleInputChange("ourProducts", "category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Tiles">Tiles</option>
                      <option value="Sanitaryware">Sanitaryware</option>
                      <option value="Kitchen Sinks">Kitchen Sinks</option>
                      <option value="Bathrooms">Bathrooms</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Subscribe Banner Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscribe Banner</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={homeContent.subscribeBanner.title}
                      onChange={(e) => handleInputChange("subscribeBanner", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={homeContent.subscribeBanner.subtitle}
                      onChange={(e) => handleInputChange("subscribeBanner", "subtitle", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={homeContent.subscribeBanner.placeholder}
                      onChange={(e) => handleInputChange("subscribeBanner", "placeholder", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Shop Category Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Shop Category Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={homeContent.shopCategory.title}
                      onChange={(e) => handleInputChange("shopCategory", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={homeContent.shopCategory.subtitle}
                      onChange={(e) => handleInputChange("shopCategory", "subtitle", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                {/* Categories Management */}
                <div className="space-y-0 pt-6">
                  <h4 className="text-md font-semibold text-gray-800">Categories</h4>
                  {homeContent.shopCategory.categories.map((category, index) => (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="text-sm font-medium text-gray-700">Category {index + 1}</h5>
                        <span className="text-xs text-gray-500">ID: {category.id}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name
                          </label>
                          <input
                            type="text"
                            value={category.name}
                            onChange={(e) => handleCategoryChange(index, "name", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link URL
                          </label>
                          <input
                            type="text"
                            value={category.link}
                            onChange={(e) => handleCategoryChange(index, "link", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Position Class
                          </label>
                          <select
                            value={category.position}
                            onChange={(e) => handleCategoryChange(index, "position", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="default">Default</option>
                            <option value="row-span-2">Row Span 2</option>
                            <option value="col-start-2 row-start-2">Column Start 2, Row Start 2</option>
                            <option value="row-span-2 col-start-3 row-start-1">Row Span 2, Column Start 3, Row Start 1</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCategoryImageUpload(index, e)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {category.image && (
                            <p className="text-sm text-gray-600 mt-1">
                              Current: {category.image}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* We Work With The Best Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">We Work With The Best Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={homeContent.weWorkWithTheBest.title}
                      onChange={(e) => handleInputChange("weWorkWithTheBest", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={homeContent.weWorkWithTheBest.subtitle}
                      onChange={(e) => handleInputChange("weWorkWithTheBest", "subtitle", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Blog Section */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Section</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={homeContent.blog.title}
                      onChange={(e) => handleInputChange("blog", "title", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={homeContent.blog.subtitle}
                      onChange={(e) => handleInputChange("blog", "subtitle", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => handleSave("home")}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Saving..." : "Save Home Content"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="text-center py-8">
              <p className="text-gray-500">About page content management coming soon...</p>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="text-center py-8">
              <p className="text-gray-500">Contact page content management coming soon...</p>
            </div>
          )}

          {activeTab === "blogs" && (
            <div className="space-y-0 pt-6">
              {/* Blog Management Header */}
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Blog Management</h3>
                  <p className="text-sm text-gray-600">Manage your blog posts</p>
                </div>
                <button
                  onClick={handleNewBlog}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add New Blog
                </button>
              </div>

              {/* Blog List */}
              {!showBlogForm && (
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h4 className="text-md font-medium text-gray-900">All Blog Posts</h4>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {blogs.map((blog) => (
                      <div key={blog.ID} className="px-6 py-4 flex justify-between items-center">
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">{blog.post_title}</h5>
                          <p className="text-sm text-gray-500">
                            Status: {blog.post_status} | Date: {new Date(blog.post_date).toLocaleDateString()}
                          </p>
                          {blog.categories && (
                            <p className="text-xs text-gray-400">Category: {blog.categories}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditBlog(blog)}
                            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.ID)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                    {blogs.length === 0 && (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No blog posts found. Create your first blog post!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Blog Form */}
              {showBlogForm && (
                <BlogForm
                  blog={selectedBlog}
                  onSave={handleSaveBlog}
                  onCancel={() => {
                    setShowBlogForm(false);
                    setSelectedBlog(null);
                  }}
                  saving={saving}
                  generateSlug={generateSlug}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Blog Form Component
const BlogForm = ({ blog, onSave, onCancel, saving, generateSlug }) => {
  const [formData, setFormData] = useState({
    ID: blog?.ID || '',
    post_title: blog?.post_title || '',
    slug: blog?.slug || '',
    post_date: blog?.post_date,
    post_content: blog?.post_content || '',
    post_excerpt: blog?.post_excerpt || '',
    post_status: blog?.post_status || 'publish',
    categories: blog?.categories || '',
    tags: blog?.tags || '',
    featured_image: blog?.featured_image || '',
    content_images: blog?.content_images || [],
    metadescription: blog?.metadescription || ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from title
    if (field === 'post_title') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h4 className="text-md font-medium text-gray-900">
          {blog?.ID ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.post_title}
              onChange={(e) => handleInputChange('post_title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleInputChange('slug', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.post_status}
              onChange={(e) => handleInputChange('post_status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categories
            </label>
            <input
              type="text"
              value={formData.categories}
              onChange={(e) => handleInputChange('categories', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Décor Inspiration, Product News"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Interior Design, Tiles, Cape Town"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image
            </label>
            <MediaSelector
              value={formData.featured_image}
              onChange={(value) => handleInputChange('featured_image', value)}
              type="single"
              accept="images"
              placeholder="Select featured image..."
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">
              Publish Date
          </label>
            <input
              type="date"
              value={formData.post_date}
              onChange={(e) => handleInputChange('post_date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt
          </label>
          <textarea
            value={formData.post_excerpt}
            onChange={(e) => handleInputChange('post_excerpt', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Brief summary of the blog post..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
          </label>
          <textarea
            value={formData.metadescription}
            onChange={(e) => handleInputChange('metadescription', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO meta description..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content *
          </label>
          <textarea
            value={formData.post_content}
            onChange={(e) => handleInputChange('post_content', e.target.value)}
            rows={15}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your blog post content here..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Content Images
          </label>
          <MediaSelector
            value={formData.content_images || []}
            onChange={(value) => handleInputChange('content_images', value)}
            type="multiple"
            accept="images"
            placeholder="Select images for your blog content..."
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">
            Select images to include in your blog post. You can reference them in your content using their URLs.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : (blog?.ID ? 'Update Blog' : 'Create Blog')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminContent;
