import React, { useState, useEffect } from 'react'

const AdminUniqueSpaces = () => {
  const [spaces, setSpaces] = useState([])
  const [filteredSpaces, setFilteredSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSpace, setEditingSpace] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    space: ''
  })

  useEffect(() => {
    fetchSpaces()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = spaces.filter(space =>
        space.space.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredSpaces(filtered)
    } else {
      setFilteredSpaces(spaces)
    }
  }, [spaces, searchTerm])

  const fetchSpaces = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-spaces.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.spaces) {
        setSpaces(data.spaces)
      } else {
        console.error('Error fetching spaces:', data.error || 'Unknown error')
        setSpaces([])
      }
    } catch (error) {
      console.error('Error fetching spaces:', error)
      setSpaces([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSpace) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-spaces.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingSpace.id,
            space: formData.space
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Space updated successfully')
          fetchSpaces()
          setShowAddModal(false)
          setEditingSpace(null)
          setFormData({ space: '' })
        } else {
          alert('Error updating space: ' + (result.error || 'Unknown error'))
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-spaces.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            space: formData.space
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Space created successfully')
          fetchSpaces()
          setShowAddModal(false)
          setFormData({ space: '' })
        } else {
          alert('Error creating space: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving space:', error)
      alert('Error saving space')
    }
  }

  const handleEditSpace = (space) => {
    setEditingSpace(space)
    setFormData({
      space: space.space || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteSpace = async (space) => {
    if (window.confirm(`Are you sure you want to delete the space "${space.space}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-spaces.php`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: space.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Space deleted successfully')
          fetchSpaces()
        } else {
          alert('Error deleting space: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting space:', error)
        alert('Error deleting space')
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
          <h1 className="text-2xl font-bold text-gray-900">Unique Spaces</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product spaces for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Space
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search spaces..."
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

      {/* Spaces Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Space List</h3>
        </div>
        
        {filteredSpaces.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No spaces found matching your search.' : 'No spaces found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Space Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSpaces.map((space) => (
                  <tr key={space.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {space.space}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSpace(space)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSpace(space)}
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

      {/* Add/Edit Space Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSpace ? 'Edit Space' : 'Add New Space'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingSpace(null)
                  setFormData({ space: '' })
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
                    Space Name *
                  </label>
                  <input
                    type="text"
                    name="space"
                    value={formData.space}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter space name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingSpace(null)
                      setFormData({ space: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingSpace ? 'Update Space' : 'Add Space'}
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

export default AdminUniqueSpaces
