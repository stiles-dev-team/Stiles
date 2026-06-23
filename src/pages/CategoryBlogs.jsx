import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../layout/Layout';
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import { CircularPagination } from '../components/CircularPagination';
const CategoryBlogs = () => {
  const ITEMS_PER_PAGE = 6;
  const { slug } = useParams();
  
  // Categories state matching Blogs.jsx
  const [categories, setCategories] = useState([
    { name: 'DÉCOR INSPIRATION', slug: 'decor-inspiration', count: 0 },
    // { name: 'UNCATEGORIZED', slug: 'uncategorized', count: 0 },
    { name: 'PRODUCT NEWS', slug: 'product-news', count: 0 },
    { name: 'STILES NEWS', slug: 'stiles-news', count: 0 },
    { name: 'STILES PROJECTS', slug: 'stiles-projects', count: 0 },
    { name: 'ABOUT STILES', slug: 'about-stiles', count: 0 },
  ]);

  const [blogPosts, setBlogPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/get-blogs.php`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    })
    .then(data => {
      // Handle both array response and object with blogs property
      const blogs = Array.isArray(data) ? data : (data.blogs || []);
      
      // Sort posts by ID in descending order (newest first)
      const sortedPosts = blogs.sort((a, b) => {
        return b.ID - a.ID;
      });

      setRecentPosts(sortedPosts.slice(0, 3));
      setFeaturedPosts(
        sortedPosts
          .filter((post) => [1, 2, 3].includes(Number(post.featured_position)))
          .sort((a, b) => Number(a.featured_position) - Number(b.featured_position))
      );
      setBlogPosts(sortedPosts);

      // Calculate category counts
      const categoryCounts = {};
      blogs.forEach(post => {
        if (post.categories) {
          const postCategories = post.categories.split(',').map(cat => cat.trim().toUpperCase());
          postCategories.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        }
      });

      // Define category structure for lookup
      const categoryStructure = [
        { name: 'DÉCOR INSPIRATION', slug: 'decor-inspiration' },
        // { name: 'UNCATEGORIZED', slug: 'uncategorized' },
        { name: 'PRODUCT NEWS', slug: 'product-news' },
        { name: 'STILES NEWS', slug: 'stiles-news' },
        { name: 'STILES PROJECTS', slug: 'stiles-projects' },
        { name: 'ABOUT STILES', slug: 'about-stiles' },
      ];
      
      // Update categories with counts
      setCategories(prevCategories => {
        return prevCategories.map(category => {
          const count = categoryCounts[category.name] || 0;
          return {
            ...category,
            count: count
          };
        });
      });
      
      // Find the current category
      const category = categoryStructure.find(cat => cat.slug === slug);
      if (category) {
        const categoryWithCount = {
          ...category,
          count: categoryCounts[category.name] || 0
        };
        setCurrentCategory(categoryWithCount);
        
        // Filter posts by category
        const filtered = sortedPosts.filter(post => {
          if (!post.categories) return false;
          const postCategories = post.categories.split(',').map(cat => 
            cat.trim().toUpperCase()
          );
          return postCategories.includes(category.name);
        });
        setFilteredPosts(filtered);
      } else {
        setCurrentCategory(null);
        setFilteredPosts([]);
      }
    })
    .catch(err => {
      console.error('Error fetching blogs:', err);
    });
  }, [slug]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredPosts.length]);

  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <Layout>
      <section className='w-full h-[60vh] bg-[url("/images/bannerhome.png")] relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
          <h1 className='text-white font-bold text-5xl text-center'>
            {currentCategory ? currentCategory.name : 'Category'}
          </h1>
          <p className='text-white text-xl text-center max-w-2xl'>
            Explore our collection of articles about {currentCategory ? currentCategory.name.toLowerCase() : 'this category'}
          </p>
        </div>
      </section>
      
      <section className='container mx-auto px-4 py-10'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Main content */}
          <div className='lg:w-2/3'>
            {filteredPosts.length > 0 ? (
              <>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {paginatedPosts.map((post, index) => (
                  <BlogCard 
                    key={index}
                    title={post.post_title}
                    cat={post.categories}
                    img={post.featured_image}
                    desc={post.metadescription}
                    slug={post.slug}
                  />
                ))}
              </div>
              {filteredPosts.length > ITEMS_PER_PAGE && (
                <CircularPagination
                  totalItems={filteredPosts.length}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              )}
              </>
            ) : (
              <div className='text-center py-10'>
                <h2 className='text-2xl font-bold mb-4'>No posts found</h2>
                <p className='text-gray-600'>There are no blog posts in this category yet.</p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className='lg:w-1/3'>
            <BlogSidebar categories={categories} recentPosts={recentPosts} featuredPosts={featuredPosts} />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryBlogs; 