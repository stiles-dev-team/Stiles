import React from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer'
import { Toaster } from 'sonner';

const Layout = ({ children }) => {
  return (
    <>
        <Toaster richColors position='bottom-center' />
        <Navbar />
        {children}
        <Footer />
    </>
  )
}

export default Layout