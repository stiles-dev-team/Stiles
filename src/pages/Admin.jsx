import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import Layout from '../layout/Layout'
import { Helmet } from 'react-helmet'

const Admin = () => {
    const { isAuthenticated, isAdmin, user, token } = useAuth()
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [showModal, setShowModal] = useState(false)
  
    useEffect(() => {
      if (!isAuthenticated || !isAdmin) {
        navigate('/login')
      } else {
        fetchAllOrders()
      }
    }, [isAuthenticated, isAdmin, navigate])

    const fetchAllOrders = async () => {
      try {
        const response = await fetch(`https://stiles.co.za/api/orders_admin.php`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const data = await response.json();
        console.log('Admin orders response:', data);

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch orders');
        }

        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-ZA', {
        style: 'currency',
        currency: 'ZAR'
      }).format(value)
    }

    const getStatusColor = (status) => {
      switch (status.toLowerCase()) {
        case 'completed':
          return 'bg-green-100 text-green-800'
        case 'processing':
          return 'bg-blue-100 text-blue-800'
        case 'cancelled':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-yellow-200 text-gray-800'
      }
    }

    const openOrderModal = (order) => {
      setSelectedOrder(order)
      setShowModal(true)
    }

    const closeOrderModal = () => {
      setSelectedOrder(null)
      setShowModal(false)
    }

  return (
    <Layout>
      <Helmet>
        <title>Admin | Stiles</title>
        <meta name="description" content="Admin dashboard for Stiles" />
      </Helmet>
      <section className='w-full bg-dark relative flex flex-col justify-center items-center pt-20 h-[40vh]'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
          <h1 className='text-white font-bold text-5xl text-center drop-shadow-md'>Admin Dashboard</h1>
        </div>
      </section>

      <div className="container mx-auto px-4 py-20">
        {error && (
          <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">All Orders ({orders.length})</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order?.shipping_first_name + ' ' + order?.shipping_last_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order?.shipping_email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 uppercase py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <button
                          onClick={() => openOrderModal(order)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
                        >
                          View Items
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Items Modal */}
        {showModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Order #{selectedOrder.id} - Items
                </h3>
                <button
                  onClick={closeOrderModal}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                {/* Order Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                    <div className="text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.shipping_email}</p>
                      <p><strong>Phone:</strong> {selectedOrder.shipping_phone || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600">
                      <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                      <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                      <p>{selectedOrder.shippingAddress?.postalCode}</p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Order Items ({selectedOrder.items?.length || 0})</h4>
                  {selectedOrder.items && selectedOrder.items.length > 0 ? (
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center space-x-4">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                                onError={(e) => {
                                  e.target.src = '/images/product_ph.png'
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">{item.name}</h5>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              <p className="text-sm text-gray-600">Price: {formatCurrency(item.price)}</p>
                              <p className="text-sm font-medium text-gray-900">
                                Subtotal: {formatCurrency(item.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No items found for this order.</p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">{formatCurrency(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default Admin