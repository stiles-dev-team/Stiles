import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";

const AdminLocations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    region: "",
    phone: "",
    phone_after_hours: "",
    address: "",
    email: "",
    google_iframe: "",
    google_maps: "",
    hours: ["", "", ""]
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://staging.stiles.co.za/api/admin-locations.php', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      
      if (response.ok) {
        setLocations(data.locations || []);
      } else {
        setError(data.error || 'Failed to fetch locations');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleHoursChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours.map((hour, i) => i === index ? value : hour)
    }));
  };

  const addHoursField = () => {
    setFormData(prev => ({
      ...prev,
      hours: [...prev.hours, ""]
    }));
  };

  const removeHoursField = (index) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours.filter((_, i) => i !== index)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      region: "",
      phone: "",
      phone_after_hours: "",
      address: "",
      email: "",
      google_iframe: "",
      google_maps: "",
      hours: ["", "", ""]
    });
    setEditingIndex(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (!formData.title || !formData.region || !formData.phone || !formData.address || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }

    // Filter out empty hours
    const filteredHours = formData.hours.filter(hour => hour.trim() !== "");

    const locationData = {
      ...formData,
      hours: filteredHours,
      google_iframe: formData.google_iframe || null,
      phone_after_hours: formData.phone_after_hours || ""
    };

    try {
      const url = 'https://staging.stiles.co.za/api/admin-locations.php';
      const method = editingIndex !== null ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          index: editingIndex,
          location: locationData
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        fetchLocations();
        setShowAddModal(false);
        resetForm();
      } else {
        setError(data.error || 'Failed to save location');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const handleEdit = (index) => {
    const location = locations[index];
    setFormData({
      title: location.title || "",
      region: location.region || "",
      phone: location.phone || "",
      phone_after_hours: location.phone_after_hours || "",
      address: location.address || "",
      email: location.email || "",
      google_iframe: location.google_iframe || "",
      google_maps: location.google_maps || "",
      hours: location.hours || [""]
    });
    setEditingIndex(index);
    setShowAddModal(true);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this location?')) {
      return;
    }

    try {
      const response = await fetch('https://staging.stiles.co.za/api/admin-locations.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ index })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        fetchLocations();
      } else {
        setError(data.error || 'Failed to delete location');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    }
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Helmet>
        <title>Manage Locations | Admin | Stiles</title>
        <meta name="description" content="Manage Stiles store locations" />
      </Helmet>

      <div className="mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Store Locations</h1>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add New Location
          </button>
        </div>
        <p className="text-gray-600 mt-2">Manage Stiles store locations and contact information</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Locations List */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">All Locations ({locations.length})</h2>
        </div>
        
        {locations.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No locations found. Add your first location to get started.
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {locations.map((location, index) => (
              <div key={index} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{location.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{location.region}</p>
                    <div className="mt-3 space-y-1 text-sm text-gray-600">
                      <p><strong>Phone:</strong> {location.phone}</p>
                      {location.phone_after_hours && (
                        <p><strong>After Hours:</strong> {location.phone_after_hours}</p>
                      )}
                      <p><strong>Address:</strong> {location.address}</p>
                      <p><strong>Email:</strong> {location.email}</p>
                      {location.google_maps && (
                        <p><strong>Google Maps:</strong> 
                          <a href={location.google_maps} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline ml-1">
                            View on Maps
                          </a>
                        </p>
                      )}
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700">Hours:</p>
                      <ul className="text-sm text-gray-600 mt-1">
                        {location.hours.map((hour, hourIndex) => (
                          <li key={hourIndex}>{hour}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingIndex !== null ? 'Edit Location' : 'Add New Location'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region *
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone *
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone After Hours
                    </label>
                    <input
                      type="text"
                      name="phone_after_hours"
                      value={formData.phone_after_hours}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps URL
                  </label>
                  <input
                    type="url"
                    name="google_maps"
                    value={formData.google_maps}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://g.co/kgs/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Iframe (Optional)
                  </label>
                  <textarea
                    name="google_iframe"
                    value={formData.google_iframe}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Paste iframe code here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hours *
                  </label>
                  {formData.hours.map((hour, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={hour}
                        onChange={(e) => handleHoursChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Mon – Thurs 8AM – 5PM"
                        required
                      />
                      {formData.hours.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeHoursField(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHoursField}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    + Add Hours Line
                  </button>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    {editingIndex !== null ? 'Update Location' : 'Add Location'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLocations;
