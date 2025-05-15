import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../layout/Layout';
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';

const CategoryBlogs = () => {
  const { slug } = useParams();
  
  // Categories state matching Blogs.jsx
  const [categories, setCategories] = useState([
    { name: 'DÉCOR INSPIRATION', slug: 'decor-inspiration', count: 0 },
    { name: 'UNCATEGORIZED', slug: 'uncategorized', count: 0 },
    { name: 'PRODUCT NEWS', slug: 'product-news', count: 0 },
    { name: 'STILES NEWS', slug: 'stiles-news', count: 0 },
    { name: 'STILES PROJECTS', slug: 'stiles-projects', count: 0 },
    { name: 'ABOUT STILES', slug: 'about-stiles', count: 0 },
  ]);

  const [blogPosts, setBlogPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);

  useEffect(() => {
    fetch(`/data/blogs.json`)
    .then(res => res.json())
    .then(data => {
      // Sort posts by date in descending order (newest first)
      const sortedPosts = data.sort((a, b) => {
        const dateA = new Date(a.post_date);
        const dateB = new Date(b.post_date);
        return dateB - dateA;
      });

      setRecentPosts(sortedPosts.slice(0, 3));
      setBlogPosts(sortedPosts);

      // Calculate category counts
      const categoryCounts = {};
      data.forEach(post => {
        const postCategories = post.categories.split(',').map(cat => cat.trim().toUpperCase());
        postCategories.forEach(category => {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
      });

      // Update categories with counts
      setCategories(prevCategories => {
        const updatedCategories = prevCategories.map(category => {
          const count = categoryCounts[category.name] || 0;
          return {
            ...category,
            count: count
          };
        });
        return updatedCategories;
      });

      // Find the current category
      const category = categories.find(cat => cat.slug === slug);
      setCurrentCategory(category);
      
      // Filter posts by category
      const filtered = sortedPosts.filter(post => {
        const postCategories = post.categories.split(',').map(cat => 
          cat.trim().toUpperCase()
        );
        return postCategories.includes(category?.name);
      });
      setFilteredPosts(filtered);

      console.log('Current slug:', slug);
      console.log('Current category:', category);
      console.log('Filtered posts:', filtered);
    })
    .catch(err => {
      console.log(err);
    });
  }, [slug, categories]);

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
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {filteredPosts.map((post, index) => (
                  <BlogCard 
                    key={index}
                    title={post.post_title}
                    cat={post.categories}
                    img={post.featured_image}
                    desc={post.desc}
                    slug={post.slug}
                  />
                ))}
              </div>
            ) : (
              <div className='text-center py-10'>
                <h2 className='text-2xl font-bold mb-4'>No posts found</h2>
                <p className='text-gray-600'>There are no blog posts in this category yet.</p>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className='lg:w-1/3'>
            <BlogSidebar categories={categories} recentPosts={recentPosts} />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CategoryBlogs; 