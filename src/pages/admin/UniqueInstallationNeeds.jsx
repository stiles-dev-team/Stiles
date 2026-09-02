import React, { useState, useEffect } from 'react'

const AdminUniqueInstallationNeeds = () => {
  const [installationNeeds, setInstallationNeeds] = useState([])
  const [filteredInstallationNeeds, setFilteredInstallationNeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingInstallationNeed, setEditingInstallationNeed] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    installation_need: ''
  })

  useEffect(() => {
    fetchInstallationNeeds()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = installationNeeds.filter(installationNeed =>
        installationNeed.installation_need.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredInstallationNeeds(filtered)
    } else {
      setFilteredInstallationNeeds(installationNeeds)
    }
  }, [installationNeeds, searchTerm])

  const fetchInstallationNeeds = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-installation-needs.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.installation_needs) {
        setInstallationNeeds(data.installation_needs)
      } else {
        console.error('Error fetching installation needs:', data.error || 'Unknown error')
        setInstallationNeeds([])
      }
    } catch (error) {
      console.error('Error fetching installation needs:', error)
      setInstallationNeeds([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingInstallationNeed) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-installation-needs.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingInstallationNeed.id,
            installation_need: formData.installation_need
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Installation need updated successfully')
          fetchInstallationNeeds()
          setShowAddModal(false)
          setEditingInstallationNeed(null)
          setFormData({ installation_need: '' })
        } else {
          alert('Error updating installation need: ' + (result.error || 'Unknown error'))
        }
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-installation-needs.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            installation_need: formData.installation_need
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Installation need created successfully')
          fetchInstallationNeeds()
          setShowAddModal(false)
          setFormData({ installation_need: '' })
        } else {
          alert('Error creating installation need: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving installation need:', error)
      alert('Error saving installation need')
    }
  }

  const handleEditInstallationNeed = (installationNeed) => {
    setEditingInstallationNeed(installationNeed)
    setFormData({
      installation_need: installationNeed.installation_need || ''
    })
    setShowAddModal(true)
  }

  const handleDeleteInstallationNeed = async (installationNeed) => {
    if (window.confirm(`Are you sure you want to delete the installation need "${installationNeed.installation_need}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-installation-needs.php`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: installationNeed.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Installation need deleted successfully')
          fetchInstallationNeeds()
        } else {
          alert('Error deleting installation need: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting installation need:', error)
        alert('Error deleting installation need')
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
          <h1 className="text-2xl font-bold text-gray-900">Unique Installation Needs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product installation needs for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Installation Need
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search installation needs..."
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

      {/* Installation Needs Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Installation Need List</h3>
        </div>
        
        {filteredInstallationNeeds.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No installation needs found matching your search.' : 'No installation needs found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Installation Need Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInstallationNeeds.map((installationNeed) => (
                  <tr key={installationNeed.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {installationNeed.installation_need}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditInstallationNeed(installationNeed)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInstallationNeed(installationNeed)}
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

      {/* Add/Edit Installation Need Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingInstallationNeed ? 'Edit Installation Need' : 'Add New Installation Need'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingInstallationNeed(null)
                  setFormData({ installation_need: '' })
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
                    Installation Need Name *
                  </label>
                  <input
                    type="text"
                    name="installation_need"
                    value={formData.installation_need}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter installation need name"
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingInstallationNeed(null)
                      setFormData({ installation_need: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingInstallationNeed ? 'Update Installation Need' : 'Add Installation Need'}
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

export default AdminUniqueInstallationNeeds
