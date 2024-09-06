import { FaUser, FaHeart, FaCartShopping } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";

const Navbar = () => {
  return (
    <nav className='w-full absolute top-0 left-0 py-3 lg:py-5 z-50'>
      <div className="container mx-auto px-4 flex flex-row justify-between items-center gap-5">
        <a href='/'><img src="/images/logo_white.png" alt="" className='h-12 lg:h-16' /></a>
        <div className='lg:flex flex-row justify-end items-center gap-7 hidden'>
          <a href="#" className='text-white font-medium'>Brands</a>
          <a href="#" className='text-white font-medium'>Tiles</a>
          <a href="#" className='text-white font-medium'>Sanitaryware</a>
          <a href="#" className='text-white font-medium'>Flooring</a>
          <a href="#" className='text-white font-medium'>Fireplaces</a>
          <a href="#" className='text-white font-medium'>Promos</a>
          <a href="#" className='text-white font-medium'>Contact Us</a>
          <a href="#"><FaUser fill="white" /></a>
          <a href="#"><FaHeart fill="white" /></a>
          <a href="#"><FaCartShopping fill="white" /></a>
        </div>
        <IoMenu className='lg:hidden' stroke="white" size={30} />
      </div>
    </nav>
  )
}

export default Navbar