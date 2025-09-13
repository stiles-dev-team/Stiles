import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch orders for stats
      const ordersResponse = await fetch('https://stiles.co.za/api/orders_admin.php', {
        headers: { 'Accept': 'application/json' }
      })
      const ordersData = await ordersResponse.json()
      
      // Fetch products count
      const productsResponse = await fetch('https://stiles.co.za/api/get-total-products.php', {
        headers: { 'Accept': 'application/json' }
      })
      const productsData = await productsResponse.json()

      // Fetch users count
      const usersResponse = await fetch('https://stiles.co.za/api/get-total-users.php', {
        headers: { 'Accept': 'application/json' }
      })
      const usersData = await usersResponse.json()

      // Calculate stats
      const orders = ordersData.orders || []
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total) || 0), 0)
      const recentOrders = orders.slice(0, 5) // Get 5 most recent orders

      setStats({
        totalOrders: orders.length,
        totalRevenue,
        totalProducts: productsData.data?.total_products || 0,
        totalUsers: usersData.data?.total_users || 0,
        recentOrders
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(value)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-ZA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
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

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Implement status update API call here
      console.log('Updating order status:', orderId, newStatus)
      // Refresh orders after update
      fetchDashboardData()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const openOrderModal = (order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setSelectedOrder(null)
    setShowOrderModal(false)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Overview of your store's performance and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">🛒</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(stats.totalRevenue)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">📦</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-hidden">
          {stats.recentOrders.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {stats.recentOrders.map((order) => (
                <li key={order.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-600 text-sm">#{order.id}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {order.shipping_first_name} {order.shipping_last_name}
                        </div>
                        <div className="text-sm text-gray-500">{order.shipping_email}</div>
                      </div>
                    </div>
                                         <div className="flex items-center space-x-4">
                       <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                         {order.status}
                       </span>
                       <div className="text-right">
                         <div className="text-sm font-medium text-gray-900">
                           {formatCurrency(order.total)}
                         </div>
                         <div className="text-sm text-gray-500">
                           {formatDate(order.created_at)}
                         </div>
                       </div>
                       <button
                         onClick={() => openOrderModal(order)}
                         className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                       >
                         View Details
                       </button>
                     </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">No recent orders found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => navigate('/admin/products')} className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">➕</span>
              Add New Product
            </button>
            <button onClick={() => navigate('/admin/analytics')} className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">📊</span>
              View Analytics
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
              <span className="mr-2">⚙️</span>
              Change Content
            </button>
          </div>
                 </div>
       </div>

       {/* Order Details Modal */}
       {showOrderModal && selectedOrder && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
             <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
               <h3 className="text-lg font-semibold text-gray-900">
                 Order #{selectedOrder.id} - Details
               </h3>
               <button
                 onClick={closeOrderModal}
                 className="text-gray-400 hover:text-gray-600 text-xl font-bold"
               >
                 ×
               </button>
             </div>
             
             <div className="p-6">
               {/* Order Summary */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div>
                   <h4 className="font-semibold text-gray-900 mb-2">Customer Information</h4>
                   <div className="text-sm text-gray-600 space-y-1">
                     <p><strong>Name:</strong> {selectedOrder.shipping_first_name} {selectedOrder.shipping_last_name}</p>
                     <p><strong>Email:</strong> {selectedOrder.shipping_email}</p>
                     <p><strong>Phone:</strong> {selectedOrder.shipping_phone || 'N/A'}</p>
                     <p><strong>Order Date:</strong> {formatDate(selectedOrder.created_at)}</p>
                   </div>
                 </div>
                 <div>
                   <h4 className="font-semibold text-gray-900 mb-2">Order Summary</h4>
                   <div className="text-sm text-gray-600 space-y-1">
                     <p><strong>Status:</strong> 
                       <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                         {selectedOrder.status}
                       </span>
                     </p>
                     <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                     <p><strong>Payment Method:</strong> {selectedOrder.payment_method || 'N/A'}</p>
                   </div>
                 </div>
               </div>

               {/* Shipping Address */}
               <div className="mb-6">
                 <h4 className="font-semibold text-gray-900 mb-2">Shipping Address</h4>
                 <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                   <p>{selectedOrder.shippingAddress?.street || 'N/A'}</p>
                   <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}</p>
                   <p>{selectedOrder.shippingAddress?.postalCode}</p>
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

               {/* Order Actions */}
               <div className="mt-6 pt-4 border-t border-gray-200">
                 <div className="flex justify-between items-center">
                   <div className="flex space-x-3">
                     <button
                       onClick={() => handleStatusUpdate(selectedOrder.id, 'processing')}
                       className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                     >
                       Mark as Processing
                     </button>
                     <button
                       onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                       className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                     >
                       Mark as Completed
                     </button>
                     <button
                       onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                       className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                     >
                       Cancel Order
                     </button>
                   </div>
                   <div className="text-right">
                     <div className="text-lg font-semibold text-gray-900">
                       Total: {formatCurrency(selectedOrder.total)}
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           </div>
         </div>
       )}
     </div>
   )
 }

export default AdminDashboard 