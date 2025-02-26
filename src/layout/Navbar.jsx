import { useEffect, useState } from "react";
import { FaUser, FaHeart, FaCartShopping } from "react-icons/fa6";
import { IoMenu, IoClose, IoSearch } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

function Icon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${id === open ? "-rotate-0" : "-rotate-90"} size-3 transition-transform`}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

const Navbar = () => {

  const [showMenu, setShowMenu] = useState(false);
  const [showTiles, setShowTiles] = useState(false);
  const [showSanware, setShowSanware] = useState(false);
  const [showFlooring, setShowFlooring] = useState(false);
  const [subMenu, setSubMenu] = useState("");
  const [slug, setSlug] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");

  const [data, setData] = useState([]);

  const [open, setOpen] = useState(0);

  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  useEffect(() => {
    fetch('/data/categories.json')
      .then(response => response.json())
      .then(data => {
        setData(data);
      });

  }, []);

  return (
    <>
    {
      showSearch &&
      <div className="w-full fixed h-screen top-0 z-[999] flex flex-col justify-center items-center gap-5 px-4 py-3">
        <div className="bg-dark/80  w-full h-full absolute top-0 left-0 z-0" onClick={() => setShowSearch(false)}></div>
        <input type="search" className="w-11/12 max-w-3xl border border-gray-300 p-4 text-sm rounded-full relative z-10" placeholder="Search for products" />
      </div>

    }
    <nav className='w-full absolute top-0 left-0 py-3 lg:py-5 z-50'>
      <div className="container mx-auto px-4 flex flex-row justify-between items-center gap-5">
        <a href='/'><img src="/images/logo_white.png" alt="" className='h-12 lg:h-16' /></a>
        <div className='lg:flex flex-row justify-end items-center lg:gap-5 xl:gap-7 hidden'>
          <a href="/shop" className='text-white font-medium'>Brands</a>
          <div className="relative"  onMouseLeave={() => {
              setShowTiles(false);
              setSubMenu("");
            }}>
            <a href="/product-category/tiles" onMouseEnter={() => setShowTiles(true)} className='text-white font-medium'>Tiles</a>
            <div className={`absolute top-6 left-0 bg-white p-5 flex-col justify-start items-start gap-3 w-52 ${showTiles ? "flex" : "hidden"}`}>
              {
                data?.filter(item => item.parent === 1262)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item, index) => (
                  <div key={item.term_id} className="w-full flex flex-row justify-between items-center gap-2 relative group" onMouseEnter={() => {
                      setSubMenu(item.term_id);
                      setSlug(item.slug);
                    }}>
                    <a href={"/product-category/tiles/" + item.slug} className="text-sm font-medium text-gray-400 group-hover:text-dark">{item.name}</a>
                    {
                      !item.no_children
                      &&
                      <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
                    }
                  </div>
                ))
              }
            </div>
            <div className={`absolute top-6 left-52 flex-col justify-start items-start gap-3 w-52 ${subMenu !== "" && showTiles && data?.filter(item => item.parent === subMenu).length > 0 ? "flex bg-white p-5" : "hidden"}`}>
              {
                data?.filter(item => item.parent === subMenu)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item, index) => (
                  <div key={item.term_id} className="w-full flex flex-row justify-between items-center gap-2 relative group">
                    <a href={"/product-category/tiles/" + slug + "/" + item.slug} className="text-sm font-medium text-gray-400 group-hover:text-dark">{item.name}</a>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="relative"  onMouseLeave={() => {
              setShowSanware(false);
              setSubMenu("");
            }}>
            <a href="/product-category/sanitary-ware/" onMouseEnter={() => setShowSanware(true)} className='text-white font-medium'>Sanware</a>
            <div className={`absolute top-6 left-0 bg-white p-5 flex-col justify-start items-start gap-3 w-52 ${showSanware ? "flex" : "hidden"}`}>
              {
                data?.filter(item => item.parent === 1091)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item, index) => (
                  <div key={item.term_id} className="w-full flex flex-row justify-between items-center gap-2 relative group" onMouseEnter={() => {
                      setSubMenu(item.term_id);
                      setSlug(item.slug);
                    }}>
                    <a href={"/product-category/sanitary-ware/" + item.slug} className="text-sm font-medium text-gray-400 group-hover:text-dark">{item.name}</a>
                    {
                      !item.no_children
                      &&
                      <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" />
                    }
                  </div>
                ))
              }
            </div>
            <div className={`absolute top-6 left-52 flex-col justify-start items-start gap-3 w-52 ${subMenu !== "" && showSanware && data?.filter(item => item.parent === subMenu).length > 0 ? "flex bg-white p-5" : "hidden"}`}>
              {
                data?.filter(item => item.parent === subMenu)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item, index) => (
                  <div key={item.term_id} className="w-full flex flex-row justify-between items-center gap-2 relative group">
                    <a href={"/product-category/sanitary-ware/" + slug + "/" + item.slug} className="text-sm font-medium text-gray-400 group-hover:text-dark">{item.name}</a>
                  </div>
                ))
              }
            </div>
          </div>
          <div className="relative"  onMouseLeave={() => {
              setShowFlooring(false);
              setSubMenu("");
            }}>
            <a href="/product-category/flooring" onMouseEnter={() => setShowFlooring(true)} className='text-white font-medium'>Flooring</a>
            <div className={`absolute top-6 left-0 bg-white p-5 flex-col justify-start items-start gap-3 w-52 ${showFlooring ? "flex" : "hidden"}`}>
              {
                data?.filter(item => item.parent === 1562)
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item, index) => (
                  <div key={item.term_id} className="w-full flex flex-row justify-between items-center gap-2 relative group" onMouseEnter={() => {
                      setSubMenu(item.term_id);
                      setSlug(item.slug);
                    }}>
                    <a href={"/product-category/flooring/" + item.slug} className="text-sm font-medium text-gray-400 group-hover:text-dark">{item.name}</a>
                    {/* <IoChevronDown className="-rotate-90 stroke-gray-400 group-hover:stroke-dark" /> */}
                  </div>
                ))
              }
            </div>
            {/* <div className={`absolute top-6 left-52 bg-white p-5 flex-col justify-start items-start gap-3 w-52 ${subMenu !== "" && showFlooring ? "flex" : "hidden"}`}>
              {
                data?.filter(item => item.parent === subMenu)
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item, index) => (
                  <div key={item.term_id} className="w-full flex flex-row justify-between items-center gap-2 relative group">
                    <a href={"/product-category/" + slug + "/" + item.slug} className="text-sm font-medium text-gray-400 group-hover:text-dark">{item.name}</a>
                  </div>
                ))
              }
            </div> */}
          </div>
          <a href="/calore-kamado-jan/" className='text-white font-medium'>Fireplaces</a>
          <a href="/promos" className='text-white font-medium'>Promos</a>
          <a href="/shop" className='text-white font-medium'>Contact Us</a>
          <a href="#"><FaUser fill="white" /></a>
          <a href="/wishlist"><FaHeart fill="white" /></a>
          <a href="/cart"><FaCartShopping fill="white" /></a>
          <div className="cursor-pointer" onClick={() => setShowSearch(true)}><IoSearch fill="white" size={20} /></div>
        </div>
        <IoMenu className='lg:hidden' stroke="white" size={30} onClick={() => setShowMenu(true)} />
      </div>
    </nav>
    <div className={`w-10/12 h-lvh bg-white fixed top-0 z-[90] lg:hidden flex flex-col justify-start items-start max-h-lvh overflow-y-auto transition-all ${showMenu ? "right-0" : "-right-full"}`}>
      <div className='w-full py-5 z-50 flex justify-end items-center px-4'>
        <IoClose stroke="black" size={30} onClick={() => setShowMenu(false)} />
      </div>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/" className="text-sm font-bold">Home</a>
      </div>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
          Promos
          {/* <IoChevronDown className="-rotate-90" /> */}
        </p>
      </div>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 1} icon={<Icon id={1} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5" onClick={() => handleOpen(1)}>Tiles</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {
            data?.filter(item => item.parent === 1262)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => (
              <a key={item.term_id} href={"/product-category/" + item.slug} className="w-full relative h-10 flex flex-row justify-between items-center gap-2">
                <p className="text-sm w-full flex flex-row justify-between items-center gap-2">
                  {item.name}
                </p>
                {/* <IoChevronDown className="-rotate-90" /> */}
              </a>
            ))
          }
        </AccordionBody>
      </Accordion>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 2} icon={<Icon id={2} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5" onClick={() => handleOpen(2)}>Sanity Ware</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {
            data?.filter(item => item.parent === 1091)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => (
              <a key={item.term_id} href={"/product-category/" + item.slug} className="w-full relative h-10 flex flex-row justify-between items-center gap-2">
                <p className="text-sm w-full flex flex-row justify-between items-center gap-2">
                  {item.name}
                </p>
                {/* <IoChevronDown className="-rotate-90" /> */}
              </a>
            ))
          }
        </AccordionBody>
      </Accordion>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 3} icon={<Icon id={3} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5" onClick={() => handleOpen(3)}>Flooring</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {
            data?.filter(item => item.parent === 1562)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => (
              <a key={item.term_id} href={"/product-category/" + item.slug} className="w-full relative h-10 flex flex-row justify-between items-center gap-2">
                <p className="text-sm w-full flex flex-row justify-between items-center gap-2">
                  {item.name}
                </p>
                {/* <IoChevronDown className="-rotate-90" /> */}
              </a>
            ))
          }
        </AccordionBody>
      </Accordion>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
          Fireplaces
        </p>
      </div>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <p className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2">
          Shop By Brand
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
        <a href="/wishlist"><FaHeart className="fill-dark" size={20} /></a>
        <a href="#"><FaCartShopping className="fill-dark" size={20} /></a>
      </div>
      <input type="search" className="w-11/12 mx-auto border border-opaque p-3 text-sm rounded-full" placeholder="Search for products" />
    </div>
    </>
  )
}

export default Navbar