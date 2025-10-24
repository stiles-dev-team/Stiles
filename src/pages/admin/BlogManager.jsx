import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import EditorJS from '@editorjs/editorjs'
import Header from '@editorjs/header'
import List from '@editorjs/list'
import Paragraph from '@editorjs/paragraph'
import Quote from '@editorjs/quote'
import Delimiter from '@editorjs/delimiter'
import Table from '@editorjs/table'
import Warning from '@editorjs/warning'
import Code from '@editorjs/code'
import LinkTool from '@editorjs/link'
import Raw from '@editorjs/raw'
import Marker from '@editorjs/marker'
import InlineCode from '@editorjs/inline-code'
import axios from 'axios'

const BlogManager = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingBlog, setEditingBlog] = useState(null)
  const [formData, setFormData] = useState({
    post_title: '',
    slug: '',
    post_content: '',
    post_excerpt: '',
    post_status: 'publish',
    categories: '',
    tags: '',
    featured_image: '',
    metadescription: ''
  })
  
  const editorRef = useRef(null)
  const editorInstance = useRef(null)

  // Initialize Editor.js
  useEffect(() => {
    if (showForm && editorRef.current && !editorInstance.current) {
      editorInstance.current = new EditorJS({
        holder: editorRef.current,
        tools: {
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2
            }
          },
          list: {
            class: List,
            inlineToolbar: true,
            config: {
              defaultStyle: 'unordered'
            }
          },
          paragraph: {
            class: Paragraph,
            inlineToolbar: true
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+O',
            config: {
              quotePlaceholder: 'Enter a quote',
              captionPlaceholder: 'Quote\'s author'
            }
          },
          delimiter: Delimiter,
          table: {
            class: Table,
            inlineToolbar: true,
            config: {
              rows: 2,
              cols: 3
            }
          },
          warning: {
            class: Warning,
            inlineToolbar: true,
            shortcut: 'CMD+SHIFT+W',
            config: {
              titlePlaceholder: 'Title',
              messagePlaceholder: 'Message'
            }
          },
          code: Code,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link'
            }
          },
          raw: Raw,
          marker: {
            class: Marker,
            shortcut: 'CMD+SHIFT+M'
          },
          inlineCode: {
            class: InlineCode,
            shortcut: 'CMD+SHIFT+C'
          }
        },
        data: editingBlog ? JSON.parse(editingBlog.post_content || '{}') : {}
      })
    }
  }, [showForm, editingBlog])

  // Fetch blogs
  const fetchBlogs = async () => {
    try {
      const response = await axios.get('/api/admin-blogs.php')
      if (response.data.success) {
        setBlogs(response.data.blogs)
      }
    } catch (error) {
      console.error('Error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogs()
  }, [])

  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Get editor data
      const editorData = await editorInstance.current.save()
      
      const blogData = {
        ...formData,
        post_content: JSON.stringify(editorData),
        slug: formData.slug || generateSlug(formData.post_title)
      }

      const response = await axios.post('/api/admin-blogs.php', blogData)
      
      if (response.data.success) {
        setShowForm(false)
        setEditingBlog(null)
        setFormData({
          post_title: '',
          slug: '',
          post_content: '',
          post_excerpt: '',
          post_status: 'publish',
          categories: '',
          tags: '',
          featured_image: '',
          metadescription: ''
        })
        
        // Clear editor
        if (editorInstance.current) {
          editorInstance.current.destroy()
          editorInstance.current = null
        }
        
        fetchBlogs()
      }
    } catch (error) {
      console.error('Error saving blog:', error)
    }
  }

  // Handle edit
  const handleEdit = (blog) => {
    setEditingBlog(blog)
    setFormData({
      post_title: blog.post_title,
      slug: blog.slug,
      post_content: blog.post_content,
      post_excerpt: blog.post_excerpt,
      post_status: blog.post_status,
      categories: blog.categories,
      tags: blog.tags,
      featured_image: blog.featured_image,
      metadescription: blog.metadescription
    })
    setShowForm(true)
  }

  // Handle delete
  const handleDelete = async (blogId) => {
    if (window.confirm('Are you sure you want to delete this blog post?')) {
      try {
        await axios.delete('/api/admin-blogs.php', {
          data: { ID: blogId }
        })
        fetchBlogs()
      } catch (error) {
        console.error('Error deleting blog:', error)
      }
    }
  }

  // Handle new blog
  const handleNewBlog = () => {
    setEditingBlog(null)
    setFormData({
      post_title: '',
      slug: '',
      post_content: '',
      post_excerpt: '',
      post_status: 'publish',
      categories: '',
      tags: '',
      featured_image: '',
      metadescription: ''
    })
    setShowForm(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Blog Manager | Stiles Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-600 mt-1">Manage your blog posts</p>
        </div>
        <button
          onClick={handleNewBlog}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Blog Post
        </button>
      </div>

      {/* Blog Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingBlog ? 'Edit Blog Post' : 'New Blog Post'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.post_title}
                    onChange={(e) => setFormData({...formData, post_title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="auto-generated from title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.post_status}
                    onChange={(e) => setFormData({...formData, post_status: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="publish">Publish</option>
                    <option value="draft">Draft</option>
                    <option value="private">Private</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.featured_image}
                    onChange={(e) => setFormData({...formData, featured_image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categories
                  </label>
                  <input
                    type="text"
                    value={formData.categories}
                    onChange={(e) => setFormData({...formData, categories: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="comma-separated"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="comma-separated"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  value={formData.post_excerpt}
                  onChange={(e) => setFormData({...formData, post_excerpt: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of the blog post"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.metadescription}
                  onChange={(e) => setFormData({...formData, metadescription: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SEO meta description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <div 
                  ref={editorRef}
                  className="border border-gray-300 rounded-md min-h-[400px]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  {editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blogs List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">All Blog Posts</h3>
        </div>
        
        {blogs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No blog posts found. Create your first blog post!
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {blogs.map((blog) => (
              <div key={blog.ID} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {blog.post_title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {blog.post_excerpt || 'No excerpt available'}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>Status: {blog.post_status}</span>
                      <span>•</span>
                      <span>Created: {new Date(blog.created_at).toLocaleDateString()}</span>
                      {blog.categories && (
                        <>
                          <span>•</span>
                          <span>Categories: {blog.categories}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(blog)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(blog.ID)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BlogManager
