import React, { useState, useEffect } from 'react'

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    revenue: {
      total: 0,
      monthly: [],
      growth: 0
    },
    orders: {
      total: 0,
      monthly: [],
      growth: 0
    },
    products: {
      total: 0,
      brands: [],
      colours: [],
      finishes: [],
      sizes: []
    },
    customers: {
      total: 0,
      new: 0,
      growth: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://stiles.co.za/api/admin-analytics.php?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })

      const data = await response.json()

      if (data.success && data.analytics) {
        setAnalytics(data.analytics)
      } else {
        console.error('Error fetching analytics:', data.error || 'Unknown error')
        // Set default values if API fails
        setAnalytics({
          revenue: { total: 0, monthly: [], growth: 0 },
          orders: { total: 0, monthly: [], growth: 0 },
          products: { total: 0, brands: [], colours: [], finishes: [], sizes: [] },
          customers: { total: 0, new: 0, growth: 0 }
        })
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Set default values if API fails
      setAnalytics({
        revenue: { total: 0, monthly: [], growth: 0 },
        orders: { total: 0, monthly: [], growth: 0 },
        products: { total: 0, brands: [], colours: [], finishes: [], sizes: [] },
        customers: { total: 0, new: 0, growth: 0 }
      })
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

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-ZA').format(value)
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
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your store's performance and insights.
          </p>
        </div>
        <div>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <dd className="text-lg font-medium text-gray-900">{formatCurrency(analytics.revenue.total)}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

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
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics.orders.total)}</dd>
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
                  <span className="text-white text-lg">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Customers</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics.customers.total)}</dd>
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
                  <span className="text-white text-lg">📦</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{formatNumber(analytics.products.total)}</dd>
                  <dd className="text-sm text-gray-600">Active products</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Revenue Trend</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.revenue.monthly.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center space-x-2">
                                         <div className="w-32 bg-gray-200 rounded-full h-2">
                       <div 
                         className="bg-green-500 h-2 rounded-full" 
                         style={{ width: `${(item.value / Math.max(...analytics.revenue.monthly.map(r => r.value))) * 100}%` }}
                       ></div>
                     </div>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Chart */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Orders Trend</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.orders.monthly.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{item.month}</span>
                  <div className="flex items-center space-x-2">
                                         <div className="w-32 bg-gray-200 rounded-full h-2">
                       <div 
                         className="bg-blue-500 h-2 rounded-full" 
                         style={{ width: `${(item.value / Math.max(...analytics.orders.monthly.map(o => o.value))) * 100}%` }}
                       ></div>
                     </div>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Brands */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Products by Brand</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.products.brands.map((brand, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{brand.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(brand.count / Math.max(...analytics.products.brands.map(b => b.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{brand.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Colours */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Products by Colour</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.products.colours.map((colour, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{colour.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(colour.count / Math.max(...analytics.products.colours.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{colour.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Finishes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Products by Finish</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.products.finishes.map((finish, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{finish.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(finish.count / Math.max(...analytics.products.finishes.map(f => f.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{finish.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Products by Size</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.products.sizes.map((size, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{size.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${(size.count / Math.max(...analytics.products.sizes.map(s => s.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{size.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics.recentActivity ? (
              analytics.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-2 h-2 ${activity.color} rounded-full`}></div>
                  <span className="text-sm text-gray-600">{activity.message}</span>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500">
                <p>No recent activity to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminAnalytics 