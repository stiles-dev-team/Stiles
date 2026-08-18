import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import BlogSidebar from '../components/BlogSidebar';
import { Helmet } from 'react-helmet-async';
import { Skeleton } from '../components/ui/skeleton';
import { sanitizePostDates } from '../utils/dateUtils';
function blogCategorySlug(label) {
  return label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const BlogPost = () => {
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
  const [currentPost, setCurrentPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [prevPost, setPrevPost] = useState(null);
  const [nextPost, setNextPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    website: '',
    comment: ''
  });

  useEffect(() => {
    setIsLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/get-blogs.php`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    })
    .then(data => {
      // Handle both array response and object with blogs property
      const blogs = Array.isArray(data) ? data : (data.blogs || []);
      
      // Sort posts by date in descending order (newest first)
      const sortedPosts = blogs.sort((a, b) => {
        const dateA = new Date(a.post_date);
        const dateB = new Date(b.post_date);
        return dateB - dateA;
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

      // Find the current post
      const post = sortedPosts.find(post => post.slug === slug);
      setCurrentPost(post);
      
      if (post && post.categories) {
        // Find related posts (same category)
        const postCategories = post.categories.split(',').map(cat => cat.trim().toUpperCase());
        const related = sortedPosts
          .filter(p => {
            if (!p.categories) return false;
            const pCategories = p.categories.split(',').map(cat => cat.trim().toUpperCase());
            return pCategories.some(cat => postCategories.includes(cat)) && p.slug !== post.slug;
          })
          .slice(0, 3);
        setRelatedPosts(related);
        
        // Find previous and next posts
        const currentIndex = sortedPosts.findIndex(p => p.slug === slug);
        if (currentIndex > 0) {
          setPrevPost(sortedPosts[currentIndex - 1]);
        }
        if (currentIndex < sortedPosts.length - 1) {
          setNextPost(sortedPosts[currentIndex + 1]);
        }
      }
    })
    .catch(err => {
      console.error('Error fetching blogs:', err);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [slug]);

  useEffect(() => {
    // Scroll to top when post changes
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [currentPost]);

  const handleCommentChange = (e) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    console.log('Comment submitted:', commentForm);
    alert('Thank you for your comment! It will be reviewed before publication.');
    setCommentForm({
      name: '',
      email: '',
      website: '',
      comment: ''
    });
  };

  const getShareUrl = () => {
    return `https://stiles.co.za/stiles-blog/${currentPost.slug}`;
  };

  const getShareTitle = () => {
    return currentPost.post_title;
  };

  const getMetaDescription = () => {
    const description = currentPost.metadescription?.trim();
    if (description && description !== 'NULL') {
      return description;
    }
    const excerpt = currentPost.post_excerpt?.trim();
    if (excerpt && excerpt !== 'NULL') {
      return excerpt;
    }
    return '';
  };

  const getShareImage = () => {
    return currentPost.featured_image?.replace(/^http:\/\//i, 'https://') || '';
  };

  const getMetaTitle = () => `${currentPost.post_title} | Stiles`;

  const handleShareFacebook = (e) => {
    e.preventDefault();
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`;
    window.open(url, 'facebook-share-dialog', 'width=626,height=436');
  };

  const handleShareTwitter = (e) => {
    e.preventDefault();
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareTitle())}`;
    window.open(url, 'twitter-share-dialog', 'width=626,height=436');
  };

  // const handleShareInstagram = (e) => {
  //   e.preventDefault();
  //   // Instagram doesn't support direct URL sharing, so we'll copy the link
  //   handleCopyLink(e);
  // };

  const handleCopyLink = (e) => {
    e.preventDefault();
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="w-full h-[60vh]"></Skeleton>
        <Skeleton className="container mx-auto my-5 h-10"></Skeleton>
        <Skeleton className="container mx-auto my-5 h-10"></Skeleton> 
        <Skeleton className="container mx-auto my-5 h-10"></Skeleton>
        <Skeleton className="container mx-auto my-5 h-10"></Skeleton>
      </Layout>
    );
  }

  if (!currentPost) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="mb-6">The blog post you're looking for doesn't exist or has been moved.</p>
          <Link to="/stiles-blog" className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
            Return to Blog
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{getMetaTitle()}</title>
        <meta name="description" content={getMetaDescription()} />
        <meta property="og:title" content={getMetaTitle()} />
        <meta property="og:description" content={getMetaDescription()} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={getShareUrl()} />
        <meta property="og:site_name" content="Stiles" />
        <meta property="og:locale" content="en_ZA" />
        <meta property="og:image" content={getShareImage()} />
        <meta property="og:image:alt" content={currentPost.post_title} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={getMetaTitle()} />
        <meta name="twitter:description" content={getMetaDescription()} />
        <meta name="twitter:image" content={getShareImage()} />
        <link rel="canonical" href={getShareUrl()} />
      </Helmet>
      {/* Hero Section */}
      <section className='w-full h-[60vh] relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0'>
          <img 
            src={currentPost.featured_image} 
            alt={currentPost.post_title} 
            className='w-full h-full object-cover'
          />
          <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/50'></div>
        </div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-4'>
          <div className="bg-black text-white py-2 px-4 rounded-full text-sm uppercase">
            {currentPost.categories}
          </div>
          <h1 className='text-white font-bold text-4xl md:text-5xl text-center max-w-4xl'>
            {currentPost.post_title}
          </h1>
          <div className="flex items-center gap-4 text-white">
            <span>Stiles Blogs</span>
            <span>•</span>
            <span>{sanitizePostDates(currentPost.post_date)}</span>
          </div>
        </div>
      </section>
      
      {/* Content Section */}
      <section className='container mx-auto px-4 py-10'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Main content */}
          <div className='lg:w-2/3'>
            <div className='prose prose-lg max-w-none'>
              <div className='blogpost-content flex flex-col justify-start items-start gap-4 [&_a]:text-blue-600 [&_a]:hover:text-blue-700' dangerouslySetInnerHTML={{ __html: currentPost.post_content }} />
            </div>            
            {/* Share and Navigation */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-2">Share this article</h3>
                  <div className="flex gap-3">
                    <button 
                      onClick={handleShareFacebook}
                      className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                      </svg>
                    </button>
                    <button 
                      onClick={handleShareTwitter}
                      className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500 transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                      </svg>
                    </button>
                    {/* <button 
                      onClick={handleShareInstagram}
                      className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                      aria-label="Copy link (Instagram)"
                      title="Copy link to share on Instagram"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.11-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.274-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                      </svg>
                    </button> */}
                    <button 
                      onClick={handleCopyLink}
                      className="bg-gray-600 text-white p-2 rounded-full hover:bg-gray-700 transition-colors"
                      aria-label="Copy link"
                      title="Copy article link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                        <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                      </svg>
                    </button>
                  </div>
                </div>
                <Link 
                  to={`/stiles-blog/category/${blogCategorySlug(currentPost.categories.split(',')[0])}`}
                  className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  More in {currentPost.categories.split(',')[0].trim()}
                </Link>
              </div>
            </div>
            
            {/* Post Navigation */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {prevPost ? (
                  <Link 
                    to={`/stiles-blog/${prevPost.slug}`}
                    className="flex items-center gap-2 group"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="transform group-hover:-translate-x-1 transition-transform">
                      <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                    <div>
                      <span className="text-sm text-gray-500">Previous Post</span>
                      <p className="font-medium group-hover:text-dark transition-colors">{prevPost.post_title}</p>
                    </div>
                  </Link>
                ) : (
                  <div></div>
                )}
                
                {nextPost ? (
                  <Link 
                    to={`/stiles-blog/${nextPost.slug}`}
                    className="flex items-center gap-2 group text-right"
                  >
                    <div>
                      <span className="text-sm text-gray-500">Next Post</span>
                      <p className="font-medium group-hover:text-dark transition-colors">{nextPost.post_title}</p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="transform group-hover:translate-x-1 transition-transform">
                      <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </Link>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
            
            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-bold mb-6">Related Posts</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((post, index) => (
                    <Link 
                      key={index}
                      to={`/stiles-blog/${post.slug}`}
                      className="group"
                    >
                      <div className="relative overflow-hidden rounded-lg mb-3">
                        <img 
                          src={post.featured_image} 
                          alt={post.post_title} 
                          className="w-full aspect-[4/3] object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-3 left-3 bg-black text-white text-xs py-1 px-2 rounded-full">
                          {post.categories.split(',')[0].trim()}
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2 group-hover:text-dark transition-colors">
                        {post.post_title}
                      </h3>
                      <p className="text-sm text-gray-500">{sanitizePostDates(post.post_date)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Comments Section */}
            {/* <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Leave a Reply</h2>
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={commentForm.name}
                      onChange={handleCommentChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={commentForm.email}
                      onChange={handleCommentChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={commentForm.website}
                    onChange={handleCommentChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    Comment <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="comment"
                    name="comment"
                    value={commentForm.comment}
                    onChange={handleCommentChange}
                    required
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dark focus:border-transparent"
                  ></textarea>
                </div>
                <div>
                  <button
                    type="submit"
                    className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div> */}
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

export default BlogPost; 