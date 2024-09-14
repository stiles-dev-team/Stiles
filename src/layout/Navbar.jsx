import { useState } from "react";
import { FaUser, FaHeart, FaCartShopping } from "react-icons/fa6";
import { IoMenu, IoClose, IoSearch } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";

const Navbar = () => {

  const [showMenu, setShowMenu] = useState(false);
  const [showTiles, setShowTiles] = useState(false);

  return (
    <nav className='w-full absolute top-0 left-0 py-3 lg:py-5 z-50'>
      <div className="container mx-auto px-4 flex flex-row justify-between items-center gap-5">
        <a href='/'><img src="/images/logo_white.png" alt="" className='h-12 lg:h-16' /></a>
        <div className='lg:flex flex-row justify-end items-center lg:gap-5 xl:gap-7 hidden'>
          <a href="#" className='text-white font-medium'>Brands</a>
          <div className="relative">
            <a href="#" onMouseEnter={() => setShowTiles(true)} className='text-white font-medium'>Tiles</a>
            <div onMouseLeave={() => setShowTiles(false)} className={`absolute top-8 left-0 bg-white p-5 flex-col justify-start items-start gap-3 w-52 ${showTiles ? "flex" : "hidden"}`}>
              <div className="w-full flex flex-row justify-between items-center gap-2 relative group">
                <a href="#" className="text-sm font-medium text-gray-400 group-hover:text-dark">Floor Tiles</a>
                <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
              </div>
              <div className="w-full flex flex-row justify-between items-center gap-2 relative group">
                <a href="#" className="text-sm font-medium text-gray-400 group-hover:text-dark">Wall Tiles</a>
                <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
              </div>
              <div className="w-full flex flex-row justify-between items-center gap-2 relative group">
                <a href="#" className="text-sm font-medium text-gray-400 group-hover:text-dark">Large Slabs</a>
                <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
              </div>
              <div className="w-full flex flex-row justify-between items-center gap-2 relative group">
                <a href="#" className="text-sm font-medium text-gray-400 group-hover:text-dark">Mosaics</a>
                <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
              </div>
              <div className="w-full flex flex-row justify-between items-center gap-2 relative group">
                <a href="#" className="text-sm font-medium text-gray-400 group-hover:text-dark">2cm Pavers</a>
                <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
              </div>
              <div className="w-full flex flex-row justify-between items-center gap-2 relative group">
                <a href="#" className="text-sm font-medium text-gray-400 group-hover:text-dark">Accessories</a>
                <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
              </div>
            </div>
          </div>
          <a href="#" className='text-white font-medium'>Sanitaryware</a>
          <a href="#" className='text-white font-medium'>Flooring</a>
          <a href="#" className='text-white font-medium'>Fireplaces</a>
          <a href="#" className='text-white font-medium'>Promos</a>
          <a href="#" className='text-white font-medium'>Contact Us</a>
          <a href="#"><FaUser fill="white" /></a>
          <a href="#"><FaHeart fill="white" /></a>
          <a href="#"><FaCartShopping fill="white" /></a>
          <a href="#"><IoSearch fill="white" size={20} /></a>
        </div>
        <IoMenu className='lg:hidden' stroke="white" size={30} onClick={() => setShowMenu(true)} />
        <div className={`w-10/12 h-lvh bg-white absolute top-0 z-[90] lg:hidden flex flex-col justify-start items-start max-h-lvh overflow-y-auto transition-all ${showMenu ? "right-0" : "-right-full"}`}>
          <div className='w-full py-5 z-50 flex justify-end items-center px-4'>
            <IoClose stroke="black" size={30} onClick={() => setShowMenu(false)} />
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <a href="/" className="text-sm font-bold">Home</a>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
              Promos
              <IoChevronDown className="-rotate-90" />
            </p>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
              Tiles
              <IoChevronDown className="-rotate-90" />
            </p>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
              Sanity Ware
              <IoChevronDown className="-rotate-90" />
            </p>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
              Flooring
              <IoChevronDown className="-rotate-90" />
            </p>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
              Fireplaces
              <IoChevronDown className="-rotate-90" />
            </p>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
              Shop By Brand
              <IoChevronDown className="-rotate-90" />
            </p>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <a href="/" className="text-sm font-bold">Tile Visualizer</a>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <a href="/" className="text-sm font-bold">Contact Us</a>
          </div>
          <div className="w-full flex justify-center items-center gap-8 px-5 py-5">
            <a href="#"><FaUser className="fill-dark" size={20} /></a>
            <a href="#"><FaHeart className="fill-dark" size={20} /></a>
            <a href="#"><FaCartShopping className="fill-dark" size={20} /></a>
          </div>
          <input type="search" className="w-11/12 mx-auto border border-opaque p-3 text-sm rounded-full" placeholder="Search for products" />
        </div>
      </div>
    </nav>
  )
}

export default Navbar