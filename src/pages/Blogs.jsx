import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import BlogCard from '../components/BlogCard';
import BlogSidebar from '../components/BlogSidebar';
import { Helmet } from 'react-helmet-async';
import {CircularPagination} from "../components/CircularPagination";

const Blogs = () => {
  const ITEMS_PER_PAGE = 10;

  // Sample data for categories and recent posts
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
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(`https://stiles.co.za/api/get-blogs.php`)
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

      // Calculate category counts
      const categoryCounts = {};
      blogs.forEach(post => {
        // Handle both single category and multiple categories
        if (post.categories) {
          const postCategories = post.categories.split(',').map(cat => cat.trim().toUpperCase());
          postCategories.forEach(category => {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          });
        }
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

      setBlogPosts(sortedPosts);
    })
    .catch(err => {
      console.error('Error fetching blogs:', err);
    });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [blogPosts.length])

  const paginatedPosts = blogPosts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  // const [recentPosts] = useState([
  //   {
  //     title: "The Rise of Green Tiles in South Africa: A Trend Reimagined",
  //     slug: "rise-of-green-tiles-south-africa",
  //     img: "https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/10/Keradom-Home-Brick-Forest-Gloss-60x250mm_Stiles_Lifestyle_Image-1080x1080.webp?resize=1080%2C1080&ssl=1",
  //     date: "October 15, 2024"
  //   },
  //   {
  //     title: "Artful Living, design inspiration for your walls.",
  //     slug: "artful-living-design-inspiration",
  //     img: "https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/08/Stevie-Joubert-scaled-1-1080x1080.jpg?resize=1080%2C1080&ssl=1",
  //     date: "August 20, 2024"
  //   },
  //   {
  //     title: "Elevate Your Home Décor with Matiz: A Guide to Using Pastel Colour Decor Tiles",
  //     slug: "elevate-home-decor-with-matiz",
  //     img: "https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/01/Portinari-Matiz-BL-Lux-80x250mm_Stiles_Lifestyle_Image-1080x1080.png?resize=1080%2C1080&ssl=1",
  //     date: "January 10, 2024"
  //   }
  // ]);

  // // Sample blog posts data
  // const [blogPosts] = useState([
  //   {
  //     title: "The Rise of Green Tiles in South Africa: A Trend Reimagined",
  //     cat: "DÉCOR INSPIRATION",
  //     img: "https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/10/Keradom-Home-Brick-Forest-Gloss-60x250mm_Stiles_Lifestyle_Image-1080x1080.webp?resize=1080%2C1080&ssl=1",
  //     desc: 'Gone are the days of the bland beige bathroom. With a tombstone that reads, "Here lies Beige, the inoffensive one...',
  //     slug: "rise-of-green-tiles-south-africa"
  //   },
  //   {
  //     title: "Artful Living, design inspiration for your walls.",
  //     cat: "UNCATEGORIZED",
  //     img: "https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/08/Stevie-Joubert-scaled-1-1080x1080.jpg?resize=1080%2C1080&ssl=1",
  //     desc: "It's not about a tile. It's about a lifestyle, says Stevie Joubert, CEO of tile retailer, Stiles.",
  //     slug: "artful-living-design-inspiration"
  //   },
  //   {
  //     title: "Elevate Your Home Décor with Matiz: A Guide to Using Pastel Colour Decor Tiles with Stiles Tiles",
  //     cat: "DÉCOR INSPIRATION",
  //     img: "https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/01/Portinari-Matiz-BL-Lux-80x250mm_Stiles_Lifestyle_Image-1080x1080.png?resize=1080%2C1080&ssl=1",
  //     desc: 'Are you looking to breathe new life into yo...',
  //     slug: "elevate-home-decor-with-matiz"
  //   }
  // ]);

  return (
    <Layout>
      <Helmet>
        <title>Stiles Blog | Find The Best Deals On Tiles | Stiles</title>
        <meta name="description" content="Stiles Blog is a top tile retailer in South Africa that adheres to high industry standards in both quality & trends. We sell tiles & sanitaryware." />
        <meta name="keywords" content="stiles blog, tiles, bathroom tiles, kitchen tiles, floor tiles, wall tiles, Stiles, South Africa" />
        <meta property="og:title" content="Stiles Blog | Find The Best Deals On Tiles | Stiles" />
        <meta property="og:description" content="Stiles Blog is a top tile retailer in South Africa that adheres to high industry standards in both quality & trends. We sell tiles & sanitaryware." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://stiles.co.za/stiles-blog" />
        <meta property="og:site_name" content="Stiles" />
        <meta property="og:locale" content="en_ZA" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Stiles Blog | Find The Best Deals On Tiles | Stiles" />
        <meta name="twitter:description" content="Stiles Blog is a top tile retailer in South Africa that adheres to high industry standards in both quality & trends. We sell tiles & sanitaryware." />
        <link rel="canonical" href="https://stiles.co.za/stiles-blog" />
      </Helmet>
        <section id='heroHome' className='w-full h-[60vh] bg-[url("/images/bannerhome.png")] relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>Stiles Blog</h1>
        </div>
      </section>
      <section className='container mx-auto px-4 py-10'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Main content */}
          <div className='lg:w-2/3'>
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
            {blogPosts.length > ITEMS_PER_PAGE && (<CircularPagination 
                 totalItems={blogPosts.length}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={currentPage}
                onPageChange={setCurrentPage} />)}
          </div>
          
          {/* Sidebar */}
          <div className='lg:w-1/3'>
            <BlogSidebar categories={categories} recentPosts={recentPosts} />
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default Blogs