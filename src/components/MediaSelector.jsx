import React, { useState, useEffect } from 'react';

const MediaSelector = ({ 
  value, 
  onChange, 
  type = 'single', // 'single' for PDF/featured image, 'multiple' for gallery
  accept = 'all', // 'images', 'documents', 'all'
  placeholder = 'Select media...',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNext: false,
    hasPrev: false
  });

  // Fetch media files
  const fetchMediaFiles = async (page = 1, search = '', filter = 'all') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        search: search,
        type: filter
      });

      const response = await fetch(`https://stiles.co.za/api/admin-media.php?${params}`);
      const data = await response.json();

      if (data.success) {
        console.log('Media files from API:', data.files);
        setMediaFiles(data.files || []);
        setPagination(data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalCount: 0,
          limit: 20,
          hasNext: false,
          hasPrev: false
        });
      }
    } catch (error) {
      console.error('Error fetching media files:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize selected files from value
  useEffect(() => {
    console.log('MediaSelector value changed:', { value, type });
    if (value) {
      if (type === 'multiple' && Array.isArray(value)) {
        console.log('Setting multiple files:', value);
        // Convert array of URLs to array of file objects
        const fileObjects = value.map(url => ({
          url: url,
          filename: url.split('/').pop(),
          alt: '',
          id: url // Use URL as unique identifier
        }));
        setSelectedFiles(fileObjects);
      } else if (type === 'single' && typeof value === 'string') {
        console.log('Setting single file:', value);
        setSelectedFiles([{ 
          url: value, 
          filename: value.split('/').pop(),
          alt: '',
          id: value
        }]);
      }
    }
  }, [value, type]);

  // Fetch media on component mount and when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchMediaFiles(1, searchTerm, filterType);
    }
  }, [isOpen, searchTerm, filterType]);

  const handleFileSelect = (file) => {
    if (type === 'single') {
      setSelectedFiles([file]);
      onChange(file.url);
      setIsOpen(false);
    } else {
      const isSelected = selectedFiles.some(f => f.id === file.id);
      if (isSelected) {
        setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
      } else {
        setSelectedFiles([...selectedFiles, file]);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (type === 'multiple') {
      const urls = selectedFiles.map(file => file.url);
      onChange(urls);
    }
    setIsOpen(false);
  };

  const handleRemoveFile = (fileToRemove) => {
    if (type === 'single') {
      setSelectedFiles([]);
      onChange('');
    } else {
      setSelectedFiles(selectedFiles.filter(f => f.id !== fileToRemove.id));
      const urls = selectedFiles.filter(f => f.id !== fileToRemove.id).map(f => f.url);
      onChange(urls);
    }
  };

  // Drag and drop handlers for reordering gallery images
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Set opacity on the draggable element
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e) => {
    // Reset opacity on the draggable element
    if (e.currentTarget) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const newFiles = [...selectedFiles];
    const draggedFile = newFiles[draggedIndex];
    
    // Remove the dragged item from its original position
    newFiles.splice(draggedIndex, 1);
    
    // Insert it at the new position
    newFiles.splice(dropIndex, 0, draggedFile);
    
    setSelectedFiles(newFiles);
    
    // Update the parent component with the new order
    const urls = newFiles.map(file => file.url);
    onChange(urls);
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSearch = () => {
    fetchMediaFiles(1, searchTerm, filterType);
  };

  const handlePageChange = (newPage) => {
    fetchMediaFiles(newPage, searchTerm, filterType);
  };

  const isImageFile = (filename) => {
    if (!filename || typeof filename !== 'string') {
      return false;
    }
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
  };

  const getFileIcon = (filename) => {
    if (!filename || typeof filename !== 'string') {
      return '📁';
    }
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
      return '🖼️';
    } else if (['pdf'].includes(ext)) {
      return '📄';
    } else if (['doc', 'docx'].includes(ext)) {
      return '📝';
    } else {
      return '📁';
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    if (!file.filename || typeof file.filename !== 'string') {
      return false;
    }
    if (accept === 'images') {
      const ext = file.filename.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
    } else if (accept === 'documents') {
      const ext = file.filename.split('.').pop().toLowerCase();
      return ['pdf', 'doc', 'docx'].includes(ext);
    }
    return true;
  });

  return (
    <div className={`relative ${className}`}>
      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <div className="mb-2">
          {type === 'multiple' ? (
            // Gallery images - show as draggable small squares
            <div className="space-y-2">
              <p className="text-xs text-gray-500 mb-2">Drag images to reorder</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={file.id || index}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative group cursor-move ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${
                      dragOverIndex === index ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded border overflow-hidden relative">
                      <img
                        src={file.url || file.file_path}
                        alt={file.alt || file.alt_text || file.filename}
                        className="w-full h-full object-cover pointer-events-none"
                        onError={(e) => {
                          console.log('Image failed to load:', file);
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', file.url || file.file_path);
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: 'none' }}>
                        {getFileIcon(file.filename)}
                      </div>
                      {/* Drag handle indicator */}
                      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8h16M4 16h16"
                          />
                        </svg>
                      </div>
                      {/* Position number */}
                      <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1.5 py-0.5 rounded">
                        {index + 1}
                      </div>
                    </div>
                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(file);
                      }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // Single file - show as list item
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={file.id || index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={file.url}
                        alt={file.alt || file.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    </div>
                    {/* <span className="text-sm text-gray-700 truncate">{file.filename}</span> */}
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 w-full text-center">View File</a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        {selectedFiles.length > 0 
          ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected`
          : placeholder
        }
      </button>

      {/* Media Selection Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Select {type === 'single' ? 'Media File' : 'Media Files'}
              </h3>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Search and Filter */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🔍 Search
                  </button>
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="image">Images</option>
                    <option value="document">Documents</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  No media files found
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredFiles.map((file) => {
                    const isSelected = selectedFiles.some(f => f.id === file.id);
                    return (
                      <div
                        key={file.id}
                        onClick={() => handleFileSelect(file)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-full h-20 mb-2 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={file.url}
                      alt={file.alt || file.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                            <div className="w-full h-full flex items-center justify-center text-gray-400" style={{ display: 'none' }}>
                              {getFileIcon(file.filename)}
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 truncate" title={file.filename}>
                            {file.filename}
                          </div>
                          {file.alt && (
                            <div className="text-xs text-gray-500 mt-1 truncate" title={file.alt}>
                              {file.alt}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            {type === 'multiple' && (
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Select {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaSelector;
