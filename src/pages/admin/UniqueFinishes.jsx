import React, { useState, useEffect } from 'react'

const AdminUniqueFinishes = () => {
  const [finishes, setFinishes] = useState([])
  const [filteredFinishes, setFilteredFinishes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingFinish, setEditingFinish] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    finish: ''
  })

  useEffect(() => {
    fetchFinishes()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = finishes.filter(finish =>
        finish.finish.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredFinishes(filtered)
    } else {
      setFilteredFinishes(finishes)
    }
  }, [finishes, searchTerm])

  const fetchFinishes = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://stiles.co.za/api/admin-unique-finishes.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.finishes) {
        setFinishes(data.finishes)
      } else {
        console.error('Error fetching finishes:', data.error || 'Unknown error')
        setFinishes([])
      }
    } catch (error) {
      console.error('Error fetching finishes:', error)
      setFinishes([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingFinish) {
        // Update existing finish
        const response = await fetch('https://stiles.co.za/api/admin-unique-finishes.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingFinish.id,
            finish: formData.finish
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Finish updated successfully')
          fetchFinishes()
          setShowAddModal(false)
          setEditingFinish(null)
          setFormData({ finish: '' })
        } else {
          alert('Error updating finish: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Create new finish
        const response = await fetch('https://stiles.co.za/api/admin-unique-finishes.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            finish: formData.finish
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Finish created successfully')
          fetchFinishes()
          setShowAddModal(false)
          setFormData({ finish: '' })
        } else {
          alert('Error creating finish: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving finish:', error)
      alert('Error saving finish')
    }
  }

  const handleEditFinish = (finish) => {
    setEditingFinish(finish)
    setFormData({
      finish: finish.finish || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteFinish = async (finish) => {
    if (window.confirm(`Are you sure you want to delete the finish "${finish.finish}"?`)) {
      try {
        const response = await fetch('https://stiles.co.za/api/admin-unique-finishes.php', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: finish.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Finish deleted successfully')
          fetchFinishes()
        } else {
          alert('Error deleting finish: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting finish:', error)
        alert('Error deleting finish')
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
          <h1 className="text-2xl font-bold text-gray-900">Unique Finishes</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product finishes for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Finish
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search finishes..."
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

      {/* Finishes Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Finish List</h3>
        </div>
        
        {filteredFinishes.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No finishes found matching your search.' : 'No finishes found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Finish Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFinishes.map((finish) => (
                  <tr key={finish.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {finish.finish}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditFinish(finish)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteFinish(finish)}
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

      {/* Add/Edit Finish Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingFinish ? 'Edit Finish' : 'Add New Finish'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingFinish(null)
                  setFormData({ finish: '' })
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
                    Finish Name *
                  </label>
                  <input
                    type="text"
                    name="finish"
                    value={formData.finish}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter finish name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingFinish(null)
                      setFormData({ finish: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingFinish ? 'Update Finish' : 'Add Finish'}
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

export default AdminUniqueFinishes
