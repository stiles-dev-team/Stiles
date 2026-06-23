import React, { useState, useEffect } from 'react'

const MediaManager = () => {
  const [mediaFiles, setMediaFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [uploading, setUploading] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 30,
    hasNext: false,
    hasPrev: false
  })
  const [editForm, setEditForm] = useState({
    alt: '',
    description: '',
    filename: ''
  })
  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileMetadata, setFileMetadata] = useState({})

  // Mock data for demonstration - in real implementation, this would come from API
  const mockFiles = [
    {
      id: 1,
      filename: 'logo.png',
      url: '/images/logo.png',
      type: 'image',
      size: '15.2 KB',
      alt: 'Stiles Logo',
      description: 'Main company logo',
      uploadedAt: '2024-01-15',
      category: 'branding'
    },
    {
      id: 2,
      filename: 'hero.png',
      url: '/images/hero.png',
      type: 'image',
      size: '245.8 KB',
      alt: 'Hero banner image',
      description: 'Main hero banner for homepage',
      uploadedAt: '2024-01-14',
      category: 'banners'
    },
    {
      id: 3,
      filename: 'bathrooms.jpg',
      url: '/images/bathrooms.jpg',
      type: 'image',
      size: '189.3 KB',
      alt: 'Bathroom tiles showcase',
      description: 'Bathroom tile installation examples',
      uploadedAt: '2024-01-13',
      category: 'products'
    },
    {
      id: 4,
      filename: 'floor_tiles.webp',
      url: '/images/floor_tiles.webp',
      type: 'image',
      size: '156.7 KB',
      alt: 'Floor tiles collection',
      description: 'Various floor tile options',
      uploadedAt: '2024-01-12',
      category: 'products'
    },
    {
      id: 5,
      filename: 'placeholder.pdf',
      url: '/pdf/placeholder.pdf',
      type: 'document',
      size: '2.1 MB',
      alt: 'Product catalog PDF',
      description: 'Complete product catalog',
      uploadedAt: '2024-01-11',
      category: 'documents'
    }
  ]

  useEffect(() => {
    fetchMediaFiles()
  }, [pagination.currentPage, searchTerm, filterType])

  const fetchMediaFiles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchTerm,
        type: filterType
      })
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-media.php?${params}`, {
        headers: { 'Accept': 'application/json' }
      })
      const data = await response.json()
      
      console.log('API Response:', data) // Debug log
      
      if (data.success) {
        console.log('Files fetched:', data.files) // Debug log
        setMediaFiles(data.files)
        setPagination(data.pagination)
      } else {
        console.error('Error fetching media files:', data.message)
        // Fallback to mock data if API fails
        setMediaFiles(mockFiles)
      }
    } catch (error) {
      console.error('Error fetching media files:', error)
      // Fallback to mock data if API fails
      setMediaFiles(mockFiles)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    
    // Warn if too many files selected (typical PHP default is 20)
    if (files.length > 20) {
      const proceed = window.confirm(
        `You have selected ${files.length} files. PHP typically limits uploads to 20 files at once.\n\n` +
        `If the upload fails, try uploading in smaller batches of 20 or fewer files.\n\n` +
        `Do you want to continue?`
      )
      if (!proceed) {
        event.target.value = '' // Clear the selection
        return
      }
    }
    
    setSelectedFiles(files)
    
    // Initialize metadata for each file
    const initialMetadata = {}
    files.forEach((file, index) => {
      initialMetadata[index] = {
        alt: '',
        description: '',
      }
    })
    setFileMetadata(initialMetadata)
  }

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0) return
    
    setUploading(true)

    try {
      const formData = new FormData()
      
      // Add files
      selectedFiles.forEach(file => {
        formData.append('files[]', file)
      })
      
      // Add metadata for each file
      selectedFiles.forEach((file, index) => {
        const metadata = fileMetadata[index] || { alt: '', description: '' }
        formData.append('alt[]', metadata.alt)
        formData.append('description[]', metadata.description)
      })

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/upload-media.php`, {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      console.log('Upload response:', data) // Debug log
      
      if (data.success) {
        // Refresh the current page to show new files
        fetchMediaFiles()
        
        // Show success message
        if (data.errors && data.errors.length > 0) {
          console.warn('Some files had errors:', data.errors)
          alert(`Upload completed with some errors:\n\n${data.errors.join('\n')}`)
        } else {
          alert(`Successfully uploaded ${data.files?.length || selectedFiles.length} file(s)!`)
        }
      } else {
        console.error('Error uploading files:', data.message)
        // Build detailed error message
        let errorMsg = data.message || 'Unknown error occurred'
        
        if (data.php_limits) {
          errorMsg += `\n\nPHP Upload Limits:\n`
          errorMsg += `- Max files per upload: ${data.php_limits.max_file_uploads}\n`
          errorMsg += `- Max post size: ${data.php_limits.post_max_size}\n`
          errorMsg += `- Max file size: ${data.php_limits.upload_max_filesize}`
        }
        
        if (data.attempted_count && data.max_allowed) {
          errorMsg += `\n\nYou attempted to upload ${data.attempted_count} files, but the limit is ${data.max_allowed}.`
          errorMsg += `\nPlease upload in batches of ${data.max_allowed} or fewer.`
        }
        
        alert('Error uploading files:\n\n' + errorMsg)
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files: ' + error.message)
    } finally {
      setUploading(false)
      setShowUploadModal(false)
      setSelectedFiles([])
      setFileMetadata({})
    }
  }

  const handleViewFile = (file) => {
    window.open(file.url, '_blank')
  }


  const updateFileMetadata = (fileIndex, field, value) => {
    setFileMetadata(prev => ({
      ...prev,
      [fileIndex]: {
        ...prev[fileIndex],
        [field]: value
      }
    }))
  }

  const handleEditFile = (file) => {
    setSelectedFile(file)
    setEditForm({
      alt: file.alt || '',
      description: file.description || '',
      filename: file.filename
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-media.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedFile.id,
          alt: editForm.alt,
          description: editForm.description,
          filename: editForm.filename
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the current page to show updated file
        fetchMediaFiles()
        setShowEditModal(false)
        setSelectedFile(null)
      } else {
        console.error('Error updating file:', data.message)
        alert('Error updating file: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating file:', error)
      alert('Error updating file: ' + error.message)
    }
  }

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-media.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        // Refresh the current page to show updated list
        fetchMediaFiles()
      } else {
        console.error('Error deleting file:', data.message)
        alert('Error deleting file: ' + data.message)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error deleting file: ' + error.message)
    }
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo(0, 0)
  }

  const handleSearchInputChange = (value) => {
    setSearchInput(value)
  }

  const handleSearch = () => {
    setSearchTerm(searchInput)
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page on search
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchTerm('')
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page
  }

  const handleFilterChange = (value) => {
    setFilterType(value)
    setPagination(prev => ({ ...prev, currentPage: 1 })) // Reset to first page on filter
  }


  const getFileIcon = (type, filename) => {
    if (type === 'image') {
      return '🖼️'
    } else if (filename.endsWith('.pdf')) {
      return '📄'
    } else if (filename.endsWith('.doc') || filename.endsWith('.docx')) {
      return '📝'
    } else {
      return '📁'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your media files, images, and documents.
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          📤 Upload Files
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Search files..."
              value={searchInput}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              🔍 Search
            </button>
            {searchTerm && (
              <button
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                ✕ Clear
              </button>
            )}
          </div>
          <div>
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
            </select>
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Searching for: <span className="font-medium">"{searchTerm}"</span>
          </div>
        )}
      </div>

      {/* Results Info */}
      <div className="bg-white p-4 rounded-lg shadow">
        <p className="text-sm text-gray-600">
          Showing {mediaFiles.length} of {pagination.totalCount} files 
          (Page {pagination.currentPage} of {pagination.totalPages})
        </p>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaFiles.map((file) => (
          <div key={file.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-4">
              {/* File Preview */}
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                {file.type === 'image' ? (
                  <img
                    src={file.url}
                    alt={file.alt}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div className={`${file.type === 'image' ? 'hidden' : 'flex'} flex-col items-center justify-center text-gray-400`}>
                  <span className="text-4xl mb-2">{getFileIcon(file.type, file.filename)}</span>
                  <span className="text-sm">{file.type}</span>
                </div>
              </div>

              {/* File Info */}
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900 truncate" title={file.filename}>
                  {file.filename}
                </h3>
                <p className="text-sm text-gray-600">{file.size}</p>
                {file.alt && (
                  <p className="text-xs text-gray-500 truncate" title={file.alt}>
                    Alt: {file.alt}
                  </p>
                )}
                {file.description && (
                  <p className="text-xs text-gray-500 truncate" title={file.description}>
                    {file.description}
                  </p>
                )}
                <p className="text-xs text-gray-400">{formatDate(file.uploadedAt)}</p>
              </div>

              {/* Actions */}
              <div className="mt-3 flex space-x-1">
                <button
                  onClick={() => handleViewFile(file)}
                  className="flex-1 bg-green-100 text-green-700 px-2 py-1 rounded text-sm hover:bg-green-200 transition-colors"
                  title="View file"
                >
                View
                </button>
                <button
                  onClick={() => handleEditFile(file)}
                  className="flex-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200 transition-colors"
                  title="Edit file details"
                >
                Edit
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  className="flex-1 bg-red-100 text-red-700 px-2 py-1 rounded text-sm hover:bg-red-200 transition-colors"
                  title="Delete file"
                >
                Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {mediaFiles.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📁</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
          <p className="text-gray-600">
            {searchTerm || filterType !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : 'Upload your first file to get started.'
            }
          </p>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                First
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-md ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={!pagination.hasNext}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Upload Files</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFiles([])
                  setFileMetadata({})
                }}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              {/* File Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Files
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer block"
                  >
                    <div className="text-gray-400 text-4xl mb-2">📤</div>
                    <p className="text-gray-600 mb-2">Click to select files</p>
                    <p className="text-sm text-gray-500">Images, PDFs, and documents supported</p>
                  </label>
                </div>
                
                {/* Selected Files Preview */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Selected Files ({selectedFiles.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                          <span>{getFileIcon(file.type.startsWith('image/') ? 'image' : 'document', file.name)}</span>
                          <span className="truncate">{file.name}</span>
                          <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Individual File Metadata Forms */}
              {selectedFiles.length > 0 && (
                <div className="space-y-6 mb-6">
                  <h4 className="text-sm font-medium text-gray-700">File Metadata</h4>
                  
                  {selectedFiles.map((file, index) => {
                    const metadata = fileMetadata[index] || { alt: '', description: '' }
                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center space-x-2 mb-3">
                          <span className="text-lg">{getFileIcon(file.type.startsWith('image/') ? 'image' : 'document', file.name)}</span>
                          <div>
                            <h5 className="font-medium text-gray-900 truncate">{file.name}</h5>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Alt Text
                            </label>
                            <input
                              type="text"
                              value={metadata.alt}
                              onChange={(e) => updateFileMetadata(index, 'alt', e.target.value)}
                              placeholder="Describe the image for accessibility"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={metadata.description}
                            onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                            placeholder="Optional description of the file"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Upload Button */}
              {selectedFiles.length > 0 && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowUploadModal(false)
                      setSelectedFiles([])
                      setFileMetadata({})
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFileUpload}
                    disabled={uploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}

              {uploading && (
                <div className="mt-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Uploading files...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Edit File Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filename
                </label>
                <input
                  type="text"
                  value={editForm.filename}
                  onChange={(e) => setEditForm(prev => ({ ...prev, filename: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={editForm.alt}
                  onChange={(e) => setEditForm(prev => ({ ...prev, alt: e.target.value }))}
                  placeholder="Describe the image for accessibility"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of the file"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MediaManager
