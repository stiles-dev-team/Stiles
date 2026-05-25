import React, { useState, useEffect } from 'react'
import { decodeHtmlEntities } from '../../utils/pricingUtils'

const AdminBrands = () => {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    image: '',
    pdf_url: ''
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://stiles.co.za/api/admin-brands.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.brands) {
        setBrands(data.brands)
      } else {
        console.error('Error fetching brands:', data.error || 'Unknown error')
        setBrands([])
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBrand) {
        // Update existing brand
        const response = await fetch('https://stiles.co.za/api/admin-brands.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingBrand.id,
            name: formData.name,
            old_name: editingBrand.name,
            new_name: formData.name,
            description: formData.description,
            slug: formData.slug,
            image: formData.image,
            pdf_url: formData.pdf_url
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Brand updated successfully')
          fetchBrands()
          setShowAddModal(false)
          setEditingBrand(null)
          setFormData({ name: '', description: '', slug: '', image: '', pdf_url: '' })
        } else {
          alert('Error updating brand: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Create new brand
        const response = await fetch('https://stiles.co.za/api/admin-brands.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            slug: formData.slug,
            image: formData.image,
            pdf_url: formData.pdf_url
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Brand created successfully')
          fetchBrands()
          setShowAddModal(false)
          setFormData({ name: '', description: '', slug: '', image: '', pdf_url: '' })
        } else {
          alert('Error creating brand: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving brand:', error)
      alert('Error saving brand')
    }
  }

  const handleEditBrand = (brand) => {
    setEditingBrand(brand)
    setFormData({
      name: decodeHtmlEntities(brand.name) || '',
      description: decodeHtmlEntities(brand.description) || '',
      slug: decodeHtmlEntities(brand.slug) || '',
      image: brand.image || '',
      pdf_url: brand.pdf_url || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteBrand = async (brand) => {
    if (window.confirm(`Are you sure you want to delete the brand "${decodeHtmlEntities(brand.name)}"? This will remove the brand from all products.`)) {
      try {
        const response = await fetch('https://stiles.co.za/api/admin-brands.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: brand.id,
            name: brand.name
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Brand deleted successfully')
          fetchBrands()
        } else {
          alert('Error deleting brand: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting brand:', error)
        alert('Error deleting brand')
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
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product brands. Editing or deleting a brand will update all products with that brand.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Brand
        </button>
      </div>

      {/* Brands Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Brand List</h3>
        </div>
        
        {brands.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">No brands found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Brand Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {brand.image && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={brand.image}
                              alt={brand.name}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {decodeHtmlEntities(brand.name)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decodeHtmlEntities(brand.description) || 'No description'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {decodeHtmlEntities(brand.slug) || 'No slug'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.product_count} products
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditBrand(brand)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand)}
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

      {/* Add/Edit Brand Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingBrand ? 'Edit Brand' : 'Add New Brand'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingBrand(null)
                  setFormData({ name: '', description: '', slug: '', image: '', pdf_url: '' })
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
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter brand description"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="brand-slug"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    PDF URL
                  </label>
                  <input
                    type="url"
                    name="pdf_url"
                    value={formData.pdf_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/document.pdf"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.pdf_url && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <a
                        href={formData.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View PDF
                      </a>
                    </div>
                  )}
                </div>
                
                {editingBrand && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Note:</strong> Changing this brand name will update all products that currently use "{decodeHtmlEntities(editingBrand.name)}".
                    </p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingBrand(null)
                      setFormData({ name: '', description: '', slug: '', image: '', pdf_url: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingBrand ? 'Update Brand' : 'Add Brand'}
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

export default AdminBrands 