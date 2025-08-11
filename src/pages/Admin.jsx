import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom'
import Layout from '../layout/LayoutDark'
import { Helmet } from 'react-helmet'

// Admin Components
import AdminDashboard from './admin/Dashboard'
import AdminProducts from './admin/Products'
import AdminOrders from './admin/Orders'
import AdminUsers from './admin/Users'
import AdminBrands from './admin/Categories'
import AdminAnalytics from './admin/Analytics'
import AdminContent from './admin/Content'
import AdminSettings from './admin/Settings'

const Admin = () => {
    const { isAuthenticated, isAdmin, user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
      if (!isAuthenticated || !isAdmin) {
        navigate('/login')
      }
    }, [isAuthenticated, isAdmin, navigate])

    const navigation = [
      { name: 'Dashboard', href: '/admin', icon: '📊' },
      { name: 'Products', href: '/admin/products', icon: '📦' },
      { name: 'Orders', href: '/admin/orders', icon: '🛒' },
      { name: 'Users', href: '/admin/users', icon: '👥' },
      { name: 'Brands', href: '/admin/brands', icon: '🏷️' },
      { name: 'Analytics', href: '/admin/analytics', icon: '📈' },
      { name: 'Content', href: '/admin/content', icon: '📝' },
      // { name: 'Settings', href: '/admin/settings', icon: '⚙️' },
    ]

    if (!isAuthenticated || !isAdmin) {
      return null
    }

    return (
      <Layout>
        <Helmet>
          <title>Admin Dashboard | Stiles</title>
          <meta name="description" content="Admin dashboard for Stiles" />
        </Helmet>
        
        <div className="min-h-screen pt-20">

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex gap-8">
              {/* Sidebar Navigation */}
              <div className="w-64 flex-shrink-0">
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`${
                          isActive
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors`}
                      >
                        <span className="mr-3 text-lg">{item.icon}</span>
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/products" element={<AdminProducts />} />
                  <Route path="/orders" element={<AdminOrders />} />
                  <Route path="/users" element={<AdminUsers />} />
                  <Route path="/brands" element={<AdminBrands />} />
                  <Route path="/analytics" element={<AdminAnalytics />} />
                  <Route path="/content" element={<AdminContent />} />
                  <Route path="/settings" element={<AdminSettings />} />
                </Routes>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    )
}

export default Admin