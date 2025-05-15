import React from 'react'
import NavbarDark from './NavbarDark'
import Footer from './Footer'
import { Toaster } from 'sonner';

const Layout = ({ children }) => {
  return (
    <>
        <Toaster richColors position='bottom-center' />
        <NavbarDark />
        {children}
        <Footer />
    </>
  )
}

export default Layout