import React, { useState, useEffect } from 'react'

const AdminUniqueSizes = () => {
  const [sizes, setSizes] = useState([])
  const [filteredSizes, setFilteredSizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSize, setEditingSize] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    size: ''
  })

  useEffect(() => {
    fetchSizes()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = sizes.filter(size =>
        size.size.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSizes(filtered)
    } else {
      setFilteredSizes(sizes)
    }
  }, [sizes, searchTerm])

  const fetchSizes = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://stiles.co.za/api/admin-unique-sizes.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.sizes) {
        setSizes(data.sizes)
      } else {
        console.error('Error fetching sizes:', data.error || 'Unknown error')
        setSizes([])
      }
    } catch (error) {
      console.error('Error fetching sizes:', error)
      setSizes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSize) {
        // Update existing size
        const response = await fetch('https://stiles.co.za/api/admin-unique-sizes.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingSize.id,
            size: formData.size
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Size updated successfully')
          fetchSizes()
          setShowAddModal(false)
          setEditingSize(null)
          setFormData({ size: '' })
        } else {
          alert('Error updating size: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Create new size
        const response = await fetch('https://stiles.co.za/api/admin-unique-sizes.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            size: formData.size
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Size created successfully')
          fetchSizes()
          setShowAddModal(false)
          setFormData({ size: '' })
        } else {
          alert('Error creating size: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving size:', error)
      alert('Error saving size')
    }
  }

  const handleEditSize = (size) => {
    setEditingSize(size)
    setFormData({
      size: size.size || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteSize = async (size) => {
    if (window.confirm(`Are you sure you want to delete the size "${size.size}"?`)) {
      try {
        const response = await fetch('https://stiles.co.za/api/admin-unique-sizes.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: size.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Size deleted successfully')
          fetchSizes()
        } else {
          alert('Error deleting size: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting size:', error)
        alert('Error deleting size')
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
          <h1 className="text-2xl font-bold text-gray-900">Unique Sizes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product sizes for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Size
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search sizes..."
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

      {/* Sizes Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Size List</h3>
        </div>
        
        {filteredSizes.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No sizes found matching your search.' : 'No sizes found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSizes.map((size) => (
                  <tr key={size.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {size.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSize(size)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSize(size)}
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

      {/* Add/Edit Size Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSize ? 'Edit Size' : 'Add New Size'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSize(null)
                  setFormData({ size: '' })
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
                    Size Name *
                  </label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter size name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingSize(null)
                      setFormData({ size: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingSize ? 'Update Size' : 'Add Size'}
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

export default AdminUniqueSizes
