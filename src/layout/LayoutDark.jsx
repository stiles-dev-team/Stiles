import React from 'react'
import NavbarDark from './NavbarDark'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <>
        <NavbarDark />
        {children}
        <Footer />
    </>
  )
}

export default Layout