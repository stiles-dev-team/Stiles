import React from 'react';
import { Link } from 'react-router-dom';
import { sanitizePostDates } from '../utils/dateUtils';

const SidebarPostList = ({ title, posts }) => (
  <div>
    <h3 className="text-xl font-bold mb-4 uppercase">{title}</h3>
    <ul className="space-y-4">
      {posts.map((post, index) => (
        <li key={post.ID ?? index} className="flex gap-3">
          <div className="w-16 h-16 flex-shrink-0">
            <img
              src={post.featured_image}
              alt={post.post_title}
              className="w-full h-full object-cover rounded"
            />
          </div>
          <div>
            <Link
              to={`/stiles-blog/${post.slug}`}
              className="font-medium hover:text-dark transition-colors line-clamp-2"
            >
              {post.post_title}
            </Link>
            <p className="text-xs text-gray-500 mt-1">{sanitizePostDates(post.post_date)}</p>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

const BlogSidebar = ({ categories, recentPosts, featuredPosts = [] }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Categories Section */}
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4 uppercase">Categories</h3>
        <ul className="space-y-2">
          {categories.map((category, index) => (
            <li key={index}>
              <Link 
                to={`/stiles-blog/category/${category.slug}`} 
                className="text-gray-700 hover:text-dark transition-colors flex justify-between items-center"
              >
                <span>{category.name}</span>
                <span className="bg-gray-100 text-gray-600 rounded-full px-2 py-1 text-xs">
                  {category.count}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <SidebarPostList title="Recent Posts" posts={recentPosts} />

      {featuredPosts.length > 0 && (
        <div className="mt-8">
          <SidebarPostList title="Featured Posts" posts={featuredPosts} />
        </div>
      )}
    </div>
  );
};

export default BlogSidebar; 