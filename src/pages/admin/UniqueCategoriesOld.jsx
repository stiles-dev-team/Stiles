import React, { useState, useEffect } from 'react'

const AdminUniqueCategoriesOld = () => {
  const [categories, setCategories] = useState([])
  const [filteredCategories, setFilteredCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    category: ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredCategories(filtered)
    } else {
      setFilteredCategories(categories)
    }
  }, [categories, searchTerm])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://staging.stiles.co.za/api/admin-unique-categories.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.categories) {
        setCategories(data.categories)
      } else {
        console.error('Error fetching categories:', data.error || 'Unknown error')
        setCategories([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch('https://staging.stiles.co.za/api/admin-unique-categories.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingCategory.id,
            category: formData.category
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Category updated successfully')
          fetchCategories()
          setShowAddModal(false)
          setEditingCategory(null)
          setFormData({ category: '' })
        } else {
          alert('Error updating category: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Create new category
        const response = await fetch('https://staging.stiles.co.za/api/admin-unique-categories.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            category: formData.category
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Category created successfully')
          fetchCategories()
          setShowAddModal(false)
          setFormData({ category: '' })
        } else {
          alert('Error creating category: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving category:', error)
      alert('Error saving category')
    }
  }

  const handleEditCategory = (category) => {
    setEditingCategory(category)
    setFormData({
      category: category.category || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteCategory = async (category) => {
    if (window.confirm(`Are you sure you want to delete the category "${category.category}"?`)) {
      try {
        const response = await fetch('https://staging.stiles.co.za/api/admin-unique-categories.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: category.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Category deleted successfully')
          fetchCategories()
        } else {
          alert('Error deleting category: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting category:', error)
        alert('Error deleting category')
      }
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-0 pt-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Unique Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product categories for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Category
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Category List</h3>
        </div>
        
        {filteredCategories.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {category.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category)}
                          className="text-red-600 hover:text-red-900"
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
      </div>

      {/* Add/Edit Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingCategory(null)
                  setFormData({ category: '' })
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter category name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingCategory(null)
                      setFormData({ category: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingCategory ? 'Update Category' : 'Add Category'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUniqueCategoriesOld
