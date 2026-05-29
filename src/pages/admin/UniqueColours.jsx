import React, { useState, useEffect } from 'react'

const AdminUniqueColours = () => {
  const [colours, setColours] = useState([])
  const [filteredColours, setFilteredColours] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingColour, setEditingColour] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    colour: ''
  })

  useEffect(() => {
    fetchColours()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = colours.filter(colour =>
        colour.colour.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredColours(filtered)
    } else {
      setFilteredColours(colours)
    }
  }, [colours, searchTerm])

  const fetchColours = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://staging.stiles.co.za/api/admin-unique-colours.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.colours) {
        setColours(data.colours)
      } else {
        console.error('Error fetching colours:', data.error || 'Unknown error')
        setColours([])
      }
    } catch (error) {
      console.error('Error fetching colours:', error)
      setColours([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingColour) {
        // Update existing colour
        const response = await fetch('https://staging.stiles.co.za/api/admin-unique-colours.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingColour.id,
            colour: formData.colour
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Colour updated successfully')
          fetchColours()
          setShowAddModal(false)
          setEditingColour(null)
          setFormData({ colour: '' })
        } else {
          alert('Error updating colour: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Create new colour
        const response = await fetch('https://staging.stiles.co.za/api/admin-unique-colours.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            colour: formData.colour
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Colour created successfully')
          fetchColours()
          setShowAddModal(false)
          setFormData({ colour: '' })
        } else {
          alert('Error creating colour: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving colour:', error)
      alert('Error saving colour')
    }
  }

  const handleEditColour = (colour) => {
    setEditingColour(colour)
    setFormData({
      colour: colour.colour || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteColour = async (colour) => {
    if (window.confirm(`Are you sure you want to delete the colour "${colour.colour}"?`)) {
      try {
        const response = await fetch('https://staging.stiles.co.za/api/admin-unique-colours.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: colour.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Colour deleted successfully')
          fetchColours()
        } else {
          alert('Error deleting colour: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting colour:', error)
        alert('Error deleting colour')
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
          <h1 className="text-2xl font-bold text-gray-900">Unique Colours</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product colours for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Colour
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search colours..."
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

      {/* Colours Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Colour List</h3>
        </div>
        
        {filteredColours.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No colours found matching your search.' : 'No colours found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Colour Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredColours.map((colour) => (
                  <tr key={colour.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {colour.colour}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditColour(colour)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteColour(colour)}
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

      {/* Add/Edit Colour Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingColour ? 'Edit Colour' : 'Add New Colour'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingColour(null)
                  setFormData({ colour: '' })
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
                    Colour Name *
                  </label>
                  <input
                    type="text"
                    name="colour"
                    value={formData.colour}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter colour name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingColour(null)
                      setFormData({ colour: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingColour ? 'Update Colour' : 'Add Colour'}
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

export default AdminUniqueColours
