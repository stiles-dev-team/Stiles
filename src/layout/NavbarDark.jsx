import { useEffect, useState } from "react";
import { FaUser, FaHeart, FaCartShopping } from "react-icons/fa6";
import { IoMenu, IoClose, IoSearch } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Badge
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { decodeHtmlEntities } from "../utils/pricingUtils";
import useIsTouchDevice from "../utils/useIsTouchDevice";

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

const NavbarDark = () => {
  const navigate = useNavigate();
  const isTouchDevice = useIsTouchDevice();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showTiles, setShowTiles] = useState(false);
  const [showSanware, setShowSanware] = useState(false);
  const [showFlooring, setShowFlooring] = useState(false);
  const [showBrands, setShowBrands] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [subMenu, setSubMenu] = useState("");
  const [slug, setSlug] = useState("");

  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const [data, setData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(0);
  const [openBrandSection, setOpenBrandSection] = useState(null);
  const [openTilesSection, setOpenTilesSection] = useState(null);
  const [openSanwareSection, setOpenSanwareSection] = useState(null);
  const [openFlooringSection, setOpenFlooringSection] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);

  const categorizedBrands = {
    'A-C': brands.filter(brand => /^[A-C]/i.test(brand)),
    'D-G': brands.filter(brand => /^[D-G]/i.test(brand)),
    'H-M': brands.filter(brand => /^[H-M]/i.test(brand)),
    'N-R': brands.filter(brand => /^[N-R]/i.test(brand)),
    'S-Z': brands.filter(brand => /^[S-Z]/i.test(brand))
  };

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const handleBrandSectionOpen = (value) => setOpenBrandSection(openBrandSection === value ? null : value);
  const handleTilesSectionOpen = (value) => setOpenTilesSection(openTilesSection === value ? null : value);
  const handleSanwareSectionOpen = (value) => setOpenSanwareSection(openSanwareSection === value ? null : value);
  const handleFlooringSectionOpen = (value) => setOpenFlooringSection(openFlooringSection === value ? null : value);

  useEffect(() => {
    // Fetch categories
    fetch('/data/navbar-categories.json')
      .then(response => response.json())
      .then(data => {
        setData(data);
        // Extract parent categories (those with parent = 0)
        const parents = data.filter(category => category.parent === 0);
        setParentCategories(parents);
      });

    // Fetch brands from API
    fetch("https://staging.stiles.co.za/api/admin-brands.php")
      .then((response) => response.json())
      .then((data) => {
        if (data.success && Array.isArray(data.brands)) {
          const brandNames = data.brands.map(brand => brand.name);
          setBrands(brandNames);
        }
      })
      .catch((error) => {
        console.error("Error fetching brands:", error);
      });

    // Fetch locations
    fetch('/data/stiles-locations.json')
      .then(response => response.json())
      .then(data => {
        setLocations(data.locations);
      });

    const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
    const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
    setCartCount(totalQuantity);

  }, []);

  useEffect(() => {
    if (search.trim()) {
      setIsSearchLoading(true);
      const fetchSearchResults = async () => {
        try {
          const response = await fetch(`https://staging.stiles.co.za/api/search.php?q=${encodeURIComponent(search.trim())}&limit=4`);
          if (!response.ok) {
            throw new Error('Failed to fetch search results');
          }
          const data = await response.json();
          if (data.status === 'success' && Array.isArray(data.data)) {
            setSearchResults(data.data);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error('Error fetching search results:', error);
          setSearchResults([]);
        } finally {
          setIsSearchLoading(false);
        }
      };

      // Add debounce to prevent too many API calls
      const timeoutId = setTimeout(fetchSearchResults, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value || 0);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && search.trim()) {
      setShowSearch(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Add click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      const tilesDropdown = document.querySelector('.tiles-dropdown');
      const tilesButton = event.target.closest('.tiles-button');
      
      if (showTiles && !tilesDropdown?.contains(event.target) && !tilesButton) {
        setShowTiles(false);
      }

      const sanwareDropdown = document.querySelector('.sanware-dropdown');
      const sanwareButton = event.target.closest('.sanware-button');
      
      if (showSanware && !sanwareDropdown?.contains(event.target) && !sanwareButton) {
        setShowSanware(false);
      }

      const flooringDropdown = document.querySelector('.flooring-dropdown');
      const flooringButton = event.target.closest('.flooring-button');
      
      if (showFlooring && !flooringDropdown?.contains(event.target) && !flooringButton) {
        setShowFlooring(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTiles, showSanware, showFlooring]);

  return (
    <>
    {
      showSearch &&
      <div className="w-full fixed h-screen top-0 z-[999] flex flex-col justify-center items-center gap-5 px-4 py-3">
        <div className="bg-black/80 w-full h-full absolute top-0 left-0 z-0" onClick={() => setShowSearch(false)}></div>
        <div className="w-11/12 max-w-3xl relative z-10">
          <input 
            type="search" 
            className="w-full border border-gray-300 p-4 text-sm rounded-full" 
            placeholder="Search for products" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchSubmit}
          />
          {isSearchLoading ? (
            <div className="w-full bg-white mt-2 rounded-lg shadow-lg p-4 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="w-full bg-white mt-2 rounded-lg shadow-lg overflow-hidden">
              {searchResults.map((product) => (
                <a 
                  key={product.id} 
                  href={`/product/${product.slug}`}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b last:border-b-0"
                >
                  <div className="w-16 h-16 flex-shrink-0">
                    <img 
                      src={product.image || ''}
                      alt={product.title} 
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                    <p className="text-sm text-gray-500">{product.brands || ''}</p>
                    {/* <p className="text-sm font-medium text-gray-900">
                      {product.price.sale ? (
                        <>
                          <span className="text-red-600">{formatCurrency(product.price.sale)}</span>
                          <span className="ml-2 line-through text-gray-400">{formatCurrency(product.price.regular)}</span>
                        </>
                      ) : (
                        formatCurrency(product.price.regular)
                      )}
                    </p> */}
                  </div>
                </a>
              ))}
              {searchResults.length > 0 && (
                <button
                  onClick={() => {
                    setShowSearch(false);
                    navigate(`/search?q=${encodeURIComponent(search.trim())}`);
                  }}
                  className="w-full p-4 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors border-t border-gray-200"
                >
                  View All Results
                </button>
              )}
            </div>
          ) : search.trim() ? (
            <div className="w-full bg-white mt-2 rounded-lg shadow-lg p-4 text-center">
              <p className="text-gray-500">No products found</p>
            </div>
          ) : null}
        </div>
      </div>
    }
    <nav className='w-full absolute top-0 left-0 py-3 lg:py-5 z-50'>
      <div className="container mx-auto px-4 flex flex-row justify-between items-center gap-5">
        <a href='/'><img src="/images/logo.png" alt="" className='h-12 lg:h-16' /></a>
        <div className='lg:flex flex-row justify-end items-center lg:gap-5 xl:gap-7 hidden'>
          <div className="relative" onMouseLeave={() => {
            setShowBrands(false);
            setOpenBrandSection(null);
          }}>
            <a onMouseEnter={() => setShowBrands(true)} className='text-dark font-medium'>Brands</a>
            <div className={`absolute top-6 left-0 bg-white p-5 flex-col justify-start items-start gap-3 w-72 drop-shadow-lg ${showBrands ? "flex" : "hidden"}`}>
              {Object.entries(categorizedBrands).map(([range, brandList]) => (
                brandList.length > 0 && (
                  <Accordion 
                    key={range} 
                    open={openBrandSection === range}
                    className="w-full border-b border-b-gray-200"
                    icon={<Icon id={range} open={openBrandSection} />}
                  >
                    <AccordionHeader 
                      onClick={() => handleBrandSectionOpen(range)}
                      className="text-xs py-2 font-bold border-none flex justify-between items-center"
                    >
                      Brands {range}
                    </AccordionHeader>
                    <AccordionBody className="py-1">
                      <div className="flex flex-col gap-1">
                        {brandList.map(brand => (
                          <a 
                            key={brand} 
                            href={`/product-category/brands/${brand}`} 
                            className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                          >
                            {decodeHtmlEntities(brand)}
                          </a>
                        ))}
                      </div>
                    </AccordionBody>
                  </Accordion>
                )
              ))}
            </div>
          </div>
          <div className="relative" onMouseLeave={() => {
              setShowTiles(false);
              setOpenTilesSection(null);
            }}>
            <p onMouseEnter={() => setShowTiles(true)} onClick={() => isTouchDevice ? setShowTiles(!showTiles) : window.location.href = "/product-category/tiles"} className='text-dark font-medium cursor-pointer tiles-button'>Tiles</p>
            <div className={`absolute top-6 left-0 bg-white p-5 pb-2 flex-col justify-start items-start gap-3 w-72 shadow-lg z-[999] tiles-dropdown ${showTiles ? "flex" : "hidden"}`}>
              {
                data?.filter(item => {
                  const tilesParent = parentCategories.find(p => p.name.toLowerCase().includes('tile'));
                  return tilesParent ? item.parent === tilesParent.term_id : false;
                })
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((item, index) => {
                  // Check if the item has subcategories
                  const hasSubcategories = data?.some(subItem => subItem.parent === item.term_id);
                  
                  if (hasSubcategories) {
                    return (
                      <Accordion 
                        key={item.term_id} 
                        open={openTilesSection === item.term_id}
                        className="w-full border-b border-b-gray-200"
                        icon={<Icon id={item.term_id} open={openTilesSection} />}
                      >
                        <AccordionHeader 
                          onClick={() => handleTilesSectionOpen(item.term_id)}
                          className="text-xs py-2 font-bold border-none flex justify-between items-center text-dark"
                        >
                          {item.name}
                        </AccordionHeader>
                        <AccordionBody className="py-1">
                          <div className="flex flex-col gap-1">
                            {data?.filter(subItem => subItem.parent === item.term_id)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((subItem) => (
                                <a 
                                  key={subItem.term_id} 
                                  href={`/product-category/tiles/${item.slug}/${subItem.slug}`} 
                                  className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                                >
                                  {subItem.name}
                                </a>
                              ))}
                            <a 
                              href={`/product-category/tiles/${item.slug}`} 
                                className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                            >
                              See all {item.name}
                            </a>
                          </div>
                        </AccordionBody>
                      </Accordion>
                    );
                  } else {
                    return (
                      <a 
                        key={item.term_id} 
                        href={`/product-category/tiles/${item.slug}`} 
                        className="text-xs py-2 font-bold text-dark w-full border-b border-b-gray-200"
                      >
                        {item.name}
                      </a>
                    );
                  }
                })
              }
              <a
                href={`/product-category/tiles`} 
                className="text-xs py-2 font-bold text-dark w-full"
              >
                See all Tiles
              </a>
            </div>
          </div>
          <div className="relative" onMouseLeave={() => {
              setShowSanware(false);
              setOpenSanwareSection(null);
            }}>
            <p onMouseEnter={() => setShowSanware(true)} onClick={() => isTouchDevice ? setShowSanware(!showSanware) : window.location.href = "/product-category/sanitary-ware"} className='text-dark font-medium cursor-pointer sanware-button'>Sanware</p>
            <div className={`absolute top-6 left-0 bg-white p-5 pb-2 flex-col justify-start items-start gap-3 w-72 shadow-lg z-[999] sanware-dropdown ${showSanware ? "flex" : "hidden"}`}>
              {
                data?.filter(item => {
                  const sanwareParent = parentCategories.find(p => p.name.toLowerCase().includes('sanitary'));
                  return sanwareParent ? item.parent === sanwareParent.term_id : false;
                })
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item, index) => {
                    // Check if the item has subcategories
                    const hasSubcategories = data?.some(subItem => subItem.parent === item.term_id);
                    
                    if (hasSubcategories) {
                      return (
                        <Accordion 
                          key={item.term_id} 
                          open={openSanwareSection === item.term_id}
                          className="w-full border-b border-b-gray-200"
                          icon={<Icon id={item.term_id} open={openSanwareSection} />}
                        >
                          <AccordionHeader 
                            onClick={() => handleSanwareSectionOpen(item.term_id)}
                            className="text-xs py-2 font-bold border-none text-dark flex justify-between items-center"
                          >
                            {item.name}
                          </AccordionHeader>
                          <AccordionBody className="py-1">
                            <div className="flex flex-col gap-1">
                              {data?.filter(subItem => subItem.parent === item.term_id)
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((subItem) => (
                                  <a 
                                    key={subItem.term_id} 
                                    href={`/product-category/sanitary-ware/${item.slug}/${subItem.slug}`} 
                                    className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                                  >
                                    {subItem.name}
                                  </a>
                                ))}
                              <a 
                                href={`/product-category/sanitary-ware/${item.slug}`} 
                                className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                              >
                                See all {item.name}
                              </a>
                            </div>
                          </AccordionBody>
                        </Accordion>
                      );
                    } else {
                      return (
                        <a 
                          key={item.term_id} 
                          href={`/product-category/sanitary-ware/${item.slug}`} 
                          className="text-xs py-2 font-bold text-dark w-full border-b border-b-gray-200"
                        >
                          {item.name}
                        </a>
                      );
                    }
                  })
              }
              <a
                href={`/product-category/sanitary-ware`} 
                className="text-xs py-2 font-bold text-dark w-full"
              >
                See all Sanware
              </a>
            </div>
          </div>
          <div className="relative" onMouseLeave={() => {
              setShowFlooring(false);
              setOpenFlooringSection(null);
            }}>
            <p onMouseEnter={() => setShowFlooring(true)} onClick={() => isTouchDevice ? setShowFlooring(!showFlooring) : window.location.href = "/product-category/flooring"} className='text-dark font-medium cursor-pointer flooring-button'>Flooring</p>
            <div className={`absolute top-6 left-0 bg-white p-5 pb-2 flex-col justify-start items-start gap-3 w-72 shadow-lg z-[999] flooring-dropdown ${showFlooring ? "flex" : "hidden"}`}>
              {
                data?.filter(item => {
                  const flooringParent = parentCategories.find(p => p.name.toLowerCase().includes('flooring'));
                  return flooringParent ? item.parent === flooringParent.term_id : false;
                })
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item, index) => {
                    // Check if the item has subcategories
                    const hasSubcategories = data?.some(subItem => subItem.parent === item.term_id);
                    
                    if (hasSubcategories) {
                      return (
                        <Accordion 
                          key={item.term_id} 
                          open={openFlooringSection === item.term_id}
                          className="w-full border-b border-b-gray-200"
                          icon={<Icon id={item.term_id} open={openFlooringSection} />}
                        >
                          <AccordionHeader 
                            onClick={() => handleFlooringSectionOpen(item.term_id)}
                            className="text-xs py-2 font-bold text-dark border-none flex justify-between items-center"
                          >
                            {item.name}
                          </AccordionHeader>
                          <AccordionBody className="py-1">
                            <div className="flex flex-col gap-1">
                              {data?.filter(subItem => subItem.parent === item.term_id)
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map((subItem) => (
                                  <a 
                                    key={subItem.term_id} 
                                    href={`/product-category/flooring/${item.slug}/${subItem.slug}`} 
                                    className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                                  >
                                    {subItem.name}
                                  </a>
                                ))}
                              <a 
                                href={`/product-category/flooring/${item.slug}`} 
                                className="text-xs font-medium text-gray-400 hover:text-dark py-1"
                              >
                                See all {item.name}
                              </a>
                            </div>
                          </AccordionBody>
                        </Accordion>
                      );
                    } else {
                      return (
                        <a 
                          key={item.term_id} 
                          href={`/product-category/flooring/${item.slug}`} 
                          className="text-xs py-2 font-bold text-dark w-full border-b border-b-gray-200"
                        >
                          {item.name}
                        </a>
                      );
                    }
                  })
              }
              <a
                href={`/product-category/flooring`} 
                className="text-xs py-2 font-bold text-dark w-full"
              >
                See all Flooring
              </a>
            </div>
          </div>
          <a href="/calore-kamado-jan/" className='text-dark font-medium'>Fireplaces</a>
          {/* <a href="/promos" className='text-dark font-medium'>Promos</a> */}
          <div className="relative" onMouseLeave={() => setShowContact(false)}>
            <a href="/contact-us" className='text-dark font-medium cursor-pointer' onMouseEnter={() => setShowContact(true)}>Contact Us</a>
            <div className={`absolute top-6 right-0 bg-white p-5 flex-col justify-start items-start gap-3 w-72 drop-shadow-lg ${showContact ? "flex" : "hidden"}`}>
              {
                Object.entries(
                  locations.reduce((acc, location) => {
                    if (!acc[location.region]) {
                      acc[location.region] = [];
                    }
                    acc[location.region].push(location);
                    return acc;
                  }, {})
                ).map(([region, locationsList]) => (
                  <div key={region} className="w-full mb-3 last:mb-0">
                    <p className="text-sm font-bold mb-2">{region}</p>
                    <div className="flex flex-col gap-2">
                      {locationsList.map((location) => (
                        <a 
                          key={location.title} 
                          href={`/contact/${location.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                          className="text-sm text-gray-400 hover:text-dark transition-colors"
                        >
                          {location.title}
                        </a>
                      ))}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
          <a href="javascript: roomvo.startStandaloneVisualizer();" className='text-dark font-medium cursor-pointer'>Tile Visualizer</a>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="relative group">
                <button className="text-dark flex items-center gap-2 py-2">
                  <FaUser size={18} />
                  <span className="text-sm">{user.firstName}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="py-1">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</a>
                    <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Orders</a>
                    {isAdmin && <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin</a>}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <a href="/login" className="text-dark">
                <FaUser size={20} />
              </a>
            )}
            <button onClick={() => setShowSearch(true)} className="text-dark">
              <IoSearch size={20} />
            </button>
            <a href="/wishlist" className="text-dark relative">
              <FaHeart size={20} />
            </a>
            {
              cartCount > 0 ?
              <a href="/cart" className="relative flex justify-center items-center"><Badge color="red"><FaCartShopping size={20} /></Badge></a>
              :
              <a href="/cart" className="relative flex justify-center items-center"><FaCartShopping size={18} /></a>
            }
          </div>
        </div>
        <button onClick={() => setShowMenu(true)} className="lg:hidden text-dark">
          <IoMenu size={24} />
        </button>
      </div>
    </nav>
    <div className={`w-10/12 h-lvh bg-white fixed top-0 z-[90] lg:hidden flex flex-col justify-start items-start max-h-lvh overflow-y-auto transition-all ${showMenu ? "right-0" : "-right-full"}`}>
      <div className='w-full py-5 z-50 flex justify-end items-center px-4'>
        <IoClose stroke="black" size={30} onClick={() => setShowMenu(false)} />
      </div>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/" className="text-sm font-bold text-dark">Home</a>
      </div>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 4} icon={<Icon id={4} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark" onClick={() => handleOpen(4)}>Shop By Brand</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {Object.entries(categorizedBrands).map(([range, brandList]) => (
            brandList.length > 0 && (
              <Accordion 
                key={range} 
                open={openBrandSection === range}
                className="w-full"
                icon={<Icon id={range} open={openBrandSection} />}
              >
                <AccordionHeader 
                  onClick={() => handleBrandSectionOpen(range)}
                  className="text-sm py-2 font-medium border-none"
                >
                  Brands {range}
                </AccordionHeader>
                <AccordionBody className="py-1">
                  <div className="flex flex-col gap-1 pl-4">
                    {brandList.map(brand => (
                      <a 
                        key={brand} 
                        href={`/product-category/brands/${brand}`} 
                        className="text-sm text-dark hover:text-dark py-1"
                      >
                        {decodeHtmlEntities(brand)}
                      </a>
                    ))}
                  </div>
                </AccordionBody>
              </Accordion>
            )
          ))}
        </AccordionBody>
      </Accordion>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 1} icon={<Icon id={1} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark" onClick={() => handleOpen(1)}>Tiles</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {
            data?.filter(item => item.parent === 1262)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => {
              const hasSubcategories = data?.some(subItem => subItem.parent === item.term_id);
              
              if (hasSubcategories) {
                return (
                  <Accordion 
                    key={item.term_id} 
                    open={openTilesSection === item.term_id}
                    className="w-full"
                    icon={<Icon id={item.term_id} open={openTilesSection} />}
                  >
                    <AccordionHeader 
                      onClick={() => handleTilesSectionOpen(item.term_id)}
                      className="text-sm py-2 font-medium border-none"
                    >
                      {item.name}
                    </AccordionHeader>
                    <AccordionBody className="py-1">
                      <div className="flex flex-col gap-1 pl-4">
                        {data?.filter(subItem => subItem.parent === item.term_id)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((subItem) => (
                            <a 
                              key={subItem.term_id} 
                              href={`/product-category/tiles/${item.slug}/${subItem.slug}`} 
                              className="text-sm text-dark hover:text-dark py-1"
                            >
                              {subItem.name}
                            </a>
                          ))}
                        <a 
                          href={`/product-category/tiles/${item.slug}`} 
                          className="text-sm text-dark hover:text-dark py-1"
                        >
                          See all {item.name}
                        </a>
                      </div>
                    </AccordionBody>
                  </Accordion>
                );
              } else {
                return (
                  <a 
                    key={item.term_id} 
                    href={`/product-category/tiles/${item.slug}`} 
                    className="text-sm text-dark hover:text-dark py-2 block"
                  >
                    {item.name}
                  </a>
                );
              }
            })
          }
        </AccordionBody>
      </Accordion>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 2} icon={<Icon id={2} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark" onClick={() => handleOpen(2)}>Sanware</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {
            data?.filter(item => item.parent === 1091)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => {
              const hasSubcategories = data?.some(subItem => subItem.parent === item.term_id);
              
              if (hasSubcategories) {
                return (
                  <Accordion 
                    key={item.term_id} 
                    open={openSanwareSection === item.term_id}
                    className="w-full"
                    icon={<Icon id={item.term_id} open={openSanwareSection} />}
                  >
                    <AccordionHeader 
                      onClick={() => handleSanwareSectionOpen(item.term_id)}
                      className="text-sm py-2 font-medium border-none"
                    >
                      {item.name}
                    </AccordionHeader>
                    <AccordionBody className="py-1">
                      <div className="flex flex-col gap-1 pl-4">
                        {data?.filter(subItem => subItem.parent === item.term_id)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((subItem) => (
                            <a 
                              key={subItem.term_id} 
                              href={`/product-category/sanitary-ware/${item.slug}/${subItem.slug}`} 
                              className="text-sm text-dark hover:text-dark py-1"
                            >
                              {subItem.name}
                            </a>
                          ))}
                        <a 
                          href={`/product-category/sanitary-ware/${item.slug}`} 
                          className="text-sm text-dark hover:text-dark py-1"
                        >
                          See all {item.name}
                        </a>
                      </div>
                    </AccordionBody>
                  </Accordion>
                );
              } else {
                return (
                  <a 
                    key={item.term_id} 
                    href={`/product-category/sanitary-ware/${item.slug}`} 
                    className="text-sm text-dark hover:text-dark py-2 block"
                  >
                    {item.name}
                  </a>
                );
              }
            })
          }
        </AccordionBody>
      </Accordion>
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 3} icon={<Icon id={3} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark" onClick={() => handleOpen(3)}>Flooring</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {
            data?.filter(item => item.parent === 1562)
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((item, index) => {
              const hasSubcategories = data?.some(subItem => subItem.parent === item.term_id);
              
              if (hasSubcategories) {
                return (
                  <Accordion 
                    key={item.term_id} 
                    open={openFlooringSection === item.term_id}
                    className="w-full"
                    icon={<Icon id={item.term_id} open={openFlooringSection} />}
                  >
                    <AccordionHeader 
                      onClick={() => handleFlooringSectionOpen(item.term_id)}
                      className="text-sm py-2 font-medium border-none"
                    >
                      {item.name}
                    </AccordionHeader>
                    <AccordionBody className="py-1">
                      <div className="flex flex-col gap-1 pl-4">
                        {data?.filter(subItem => subItem.parent === item.term_id)
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map((subItem) => (
                            <a 
                              key={subItem.term_id} 
                              href={`/product-category/flooring/${item.slug}/${subItem.slug}`} 
                              className="text-sm text-dark hover:text-dark py-1"
                            >
                              {subItem.name}
                            </a>
                          ))}
                        <a 
                          href={`/product-category/flooring/${item.slug}`} 
                          className="text-sm text-dark hover:text-dark py-1"
                        >
                          See all {item.name}
                        </a>
                      </div>
                    </AccordionBody>
                  </Accordion>
                );
              } else {
                return (
                  <a 
                    key={item.term_id} 
                    href={`/product-category/flooring/${item.slug}`} 
                    className="text-sm text-dark hover:text-dark py-2 block"
                  >
                    {item.name}
                  </a>
                );
              }
            })
          }
        </AccordionBody>
      </Accordion>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/calore-kamado-jan/" className="text-sm font-bold text-dark">Fireplaces</a>
      </div>
      {/* <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/promos" className="text-sm font-bold">Promos</a>
      </div> */}
      {/* <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/tile-visualizer" className="text-sm font-bold">Tile Visualizer</a>
      </div> */}
      <Accordion className="w-full px-5 border-b border-b-gray-300 relative" open={open === 5} icon={<Icon id={5} open={open} />}>
        <AccordionHeader className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark" onClick={() => handleOpen(5)}>Contact Us</AccordionHeader>
        <AccordionBody className="py-0 pb-2">
          {Object.entries(
            locations.reduce((acc, location) => {
              if (!acc[location.region]) {
                acc[location.region] = [];
              }
              acc[location.region].push(location);
              return acc;
            }, {})
          ).map(([region, locationsList]) => (
            <div key={region} className="w-full mb-3 last:mb-0">
              <p className="text-sm font-bold mb-2">{region}</p>
              <div className="flex flex-col gap-2 pl-4">
                {locationsList.map((location) => (
                  <a 
                    key={location.title} 
                    href={`/contact/${location.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`}
                    className="text-sm text-dark hover:text-dark"
                  >
                    {location.title}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </AccordionBody>
      </Accordion>
      <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="javascript: roomvo.startStandaloneVisualizer();" className="text-sm font-bold text-dark">Tile Visualizer</a>
      </div>
      {
        isAuthenticated ?
        <>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <a href="/profile" className="text-sm font-bold text-dark">Profile</a>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <a href="/orders" className="text-sm font-bold text-dark">Orders</a>
          </div>
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <button onClick={handleLogout} className="text-sm font-bold text-dark">Logout</button>
          </div>
        </>
        :
        <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
          <a href="/login" className="text-sm font-bold text-dark">Login</a>
        </div>
      }
      <div className="w-full flex justify-center items-center gap-8 px-5 py-5">
        {/* <a href="#"><FaUser className="fill-dark" size={20} /></a> */}
        <a href="/wishlist"><FaHeart className="fill-dark" size={20} /></a>
        <a href="/cart"><FaCartShopping className="fill-dark" size={20} /></a>
        
        <button onClick={() => {
          setShowSearch(true)
          document.getElementById('search-input-navbar').focus()
        }} className="text-dark">
          <IoSearch size={22} />
        </button>
      </div>
    </div>
    </>
  )
}

export default NavbarDark