import React, { useState, useEffect } from 'react'
import MediaSelector from '../../components/MediaSelector';

const AdminUniquePromos = () => {
  const [promos, setPromos] = useState([])
  const [filteredPromos, setFilteredPromos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    promo: '',
    page_title: '',
    slug: '',
    banner_url: '',
    has_page: false,
    show_badge: true
  })

  useEffect(() => {
    fetchPromos()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = promos.filter(promo =>
        promo.promo.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPromos(filtered)
    } else {
      setFilteredPromos(promos)
    }
  }, [promos, searchTerm])

  const fetchPromos = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-promos.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.promos) {
        setPromos(data.promos)
      } else {
        console.error('Error fetching promos:', data.error || 'Unknown error')
        setPromos([])
      }
    } catch (error) {
      console.error('Error fetching promos:', error)
      setPromos([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingPromo) {
        // Update existing promo
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-promos.php`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: editingPromo.id,
            promo: formData.promo,
            page_title: formData.page_title,
            slug: formData.slug,
            banner_url: formData.banner_url,
            has_page: formData.has_page ? 1 : 0,
            show_badge: formData.show_badge ? 1 : 0
          }),
        })

        const result = await response.json()

        if (result.success) {
          alert('Promo updated successfully')
          fetchPromos()
          setShowAddModal(false)
          setEditingPromo(null)
          setFormData({
            promo: '',
            page_title: '',
            slug: '',
            banner_url: '',
            has_page: false,
            show_badge: true
          })
        } else {
          alert('Error updating promo: ' + (result.error || 'Unknown error'))
        }
      } else {
        // Create new promo
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-promos.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            promo: formData.promo,
            page_title: formData.page_title,
            slug: formData.slug,
            banner_url: formData.banner_url,
            has_page: formData.has_page ? 1 : 0,
            show_badge: formData.show_badge ? 1 : 0
          }),
        })

        const result = await response.json()

        if (result.success) {
          alert('Promo created successfully')
          fetchPromos()
          setShowAddModal(false)
          setFormData({
            promo: '',
            page_title: '',
            slug: '',
            banner_url: '',
            has_page: false,
            show_badge: true
          })
        } else {
          alert('Error creating promo: ' + (result.error || 'Unknown error'))
        }
      }
    } catch (error) {
      console.error('Error saving promo:', error)
      alert('Error saving promo')
    }
  }

  const handleEditPromo = (promo) => {
    setEditingPromo(promo)
    setFormData({
      promo: promo.promo || '',
      page_title: promo.page_title || '',
      slug: promo.slug || '',
      banner_url: promo.banner_url || '',
      has_page: promo.has_page === 1 || promo.has_page === '1' || promo.has_page === true,
      show_badge: promo.show_badge === 1 || promo.show_badge === '1' || promo.show_badge === true || promo.show_badge === undefined || promo.show_badge === null
    })
    setShowAddModal(true)
  }

  const handleDeletePromo = async (promo) => {
    if (window.confirm(`Are you sure you want to delete the promo "${promo.promo}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-promos.php`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            id: promo.id
          })
        })

        const result = await response.json()

        if (result.success) {
          alert('Promo deleted successfully')
          fetchPromos()
        } else {
          alert('Error deleting promo: ' + (result.error || 'Unknown error'))
        }
      } catch (error) {
        console.error('Error deleting promo:', error)
        alert('Error deleting promo')
      }
    }
  }

  const handleToggleShowBadge = async (promo) => {
    const current = promo.show_badge === 1 || promo.show_badge === '1' || promo.show_badge === true || promo.show_badge === undefined || promo.show_badge === null
    const nextShowBadge = !current

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-unique-promos.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          id: promo.id,
          promo: promo.promo,
          page_title: promo.page_title ?? '',
          slug: promo.slug ?? '',
          banner_url: promo.banner_url ?? '',
          has_page: promo.has_page === 1 || promo.has_page === '1' || promo.has_page === true ? 1 : 0,
          show_badge: nextShowBadge ? 1 : 0
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPromos(prev =>
          prev.map(p => (p.id === promo.id ? { ...p, show_badge: nextShowBadge ? 1 : 0 } : p))
        )
      } else {
        alert('Error updating promo: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error updating promo:', error)
      alert('Error updating promo')
    }
  }

  const handleInputChange = (e) => {
    const { name, type, checked, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
          <h1 className="text-2xl font-bold text-gray-900">Unique Promos</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage unique product promos for filtering and organization.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Add Promo
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search promos..."
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

      {/* Promos Grid */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Promo List</h3>
        </div>
        
        {filteredPromos.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No promos found matching your search.' : 'No promos found.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promo Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromos.map((promo) => (
                  <tr key={promo.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {promo.promo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {promo.slug || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {promo.has_page === 1 || promo.has_page === '1' || promo.has_page === true ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          Page enabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          No page
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-3 justify-center">
                        <button
                          onClick={() => handleEditPromo(promo)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePromo(promo)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>

                        <div className="flex items-center gap-2 justify-center">
                          <span className="text-xs text-gray-500">Show</span>
                          <button
                            type="button"
                            onClick={() => handleToggleShowBadge(promo)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              promo.show_badge === 1 || promo.show_badge === '1' || promo.show_badge === true || promo.show_badge === undefined || promo.show_badge === null
                                ? 'bg-green-600'
                                : 'bg-gray-300'
                            }`}
                            aria-pressed={promo.show_badge === 1 || promo.show_badge === '1' || promo.show_badge === true || promo.show_badge === undefined || promo.show_badge === null}
                            aria-label={`Toggle promo ${promo.promo}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                promo.show_badge === 1 || promo.show_badge === '1' || promo.show_badge === true || promo.show_badge === undefined || promo.show_badge === null
                                  ? 'translate-x-6'
                                  : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Promo Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPromo ? 'Edit Promo' : 'Add New Promo'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setEditingPromo(null)
                  setFormData({
                    promo: '',
                    page_title: '',
                    slug: '',
                    banner_url: '',
                    has_page: false,
                    show_badge: true
                  })
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
                    Promo Name *
                  </label>
                  <input
                    type="text"
                    name="promo"
                    value={formData.promo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter promo name (used on products)"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="has_page"
                    type="checkbox"
                    name="has_page"
                    checked={formData.has_page}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="has_page" className="text-sm font-medium text-gray-700">
                    Create promo page
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    id="show_badge"
                    type="checkbox"
                    name="show_badge"
                    checked={formData.show_badge}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="show_badge" className="text-sm font-medium text-gray-700">
                    Show badge on products
                  </label>
                </div>
                {formData.has_page && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Title *
                      </label>
                      <input
                        type="text"
                        name="page_title"
                        value={formData.page_title}
                        onChange={handleInputChange}
                        required={formData.has_page}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter page title (for hero and SEO)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required={formData.has_page}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. black-november-promo"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        This will be used in the URL: <span className="font-mono">/promo/&lt;slug&gt;</span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hero Banner Image
                      </label>
                      <MediaSelector
                        value={formData.banner_url}
                        onChange={(url) => {
                          setFormData(prev => ({
                            ...prev,
                            banner_url: url
                          }))
                        }}
                        type="single"
                        accept="images"
                        placeholder="Select hero banner image..."
                        className="w-full"
                      />
                      {formData.banner_url && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <div className="relative">
                            <img
                              src={formData.banner_url}
                              alt="Promo banner preview"
                              className="w-full h-32 object-cover rounded-md border"
                              onError={(e) => {
                                e.target.src = "/images/product_ph.png"
                              }}
                            />
                          </div>
                        </div>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Optional. If empty, the promo page will use the default banner.
                      </p>
                    </div>
                  </>
                )}
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setEditingPromo(null)
                      setFormData({ promo: '', page_title: '', slug: '', banner_url: '', has_page: false, show_badge: true })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    {editingPromo ? 'Update Promo' : 'Add Promo'}
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

export default AdminUniquePromos
