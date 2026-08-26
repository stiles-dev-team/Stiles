import { useEffect, useState } from "react";
import { FaUser, FaHeart, FaCartShopping } from "react-icons/fa6";
import { IoMenu, IoClose, IoSearch } from "react-icons/io5";
import { IoChevronDown } from "react-icons/io5";
import {
  Accordion,
  AccordionHeader,
  AccordionBody,
  Badge,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { decodeHtmlEntities } from "../utils/pricingUtils";
import useIsTouchDevice from "../utils/useIsTouchDevice";
import {
  Bath,
  Sofa,
  CookingPot,
  Sun,
  TreePine,
  Package,
  Droplets,
  PanelTop,
  SprayCan,
  LayoutGrid,
} from "lucide-react";

import {WALL_TILES_MEGA_MENU} from "../components/navbar-categories/wall-tiles";
import {FLOORING_MEGA_MENU} from "../components/navbar-categories/floor-tiles";
import {LARGE_SLABS_MEGA_MENU} from "../components/navbar-categories/large-slabs";
import { DECOR_MOSAICS_MEGA_MENU } from "../components/navbar-categories/decor-mosaics";
import { SANWARE_MEGA_MENU } from "../components/navbar-categories/sanware";

function MegaMenuItemVisual({ item, itemType }) {
  if (itemType === "icon") {
    const IconComponent = item.icon;
    const ExtraIcon = item.extraIcon;

    return (
      <div className="flex h-8 items-center justify-center gap-0.5 text-gray-700">
        {ExtraIcon && <ExtraIcon size={18} strokeWidth={1.25} />}
        <IconComponent size={22} strokeWidth={1.25} />
      </div>
    );
  }

  if (itemType === "size") {
    return (
      <div className="flex h-8 w-8 items-center justify-center">
        <div className="flex h-6 w-6 rotate-45 items-center justify-center border border-gray-200 bg-gray-50">
          <span className="-rotate-45 text-[7px] font-semibold leading-none text-gray-700">
            {item.dimension}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center">
      <div
        className={`h-6 w-6 rotate-45 ${item.swatch} group-hover:rotate-[405deg] group-hover:transition-transform group-hover:duration-500 group-hover:ease-in-out`}
      />
    </div>
  );
}

function MegaMenuColumn({ column }) {
  return (
    <div className="min-w-0 flex-1 border-r border-gray-200 px-2 last:border-r-0">
      <p className="mb-3 text-center text-[10px] font-semibold tracking-wide text-gray-400">
        {column.title}
      </p>
      <div className="grid grid-cols-3 gap-x-1 gap-y-3">
        {column.items.map((item) => (
          <a
            key={item.label || item.dimension || item.href}
            href={item.href}
            className={`group flex flex-col items-center gap-1 text-center ${item.className || ""}`}
          >
            <MegaMenuItemVisual item={item} itemType={column.itemType} />
            {item.label ? (
              <span className="text-[9px] leading-tight text-gray-600 group-hover:text-gray-900">
                {item.label}
              </span>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}

function WallTilesMegaMenu({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="wall-tiles-dropdown absolute left-0 right-0 top-full z-[999] w-full pt-2">
      <div className="rounded-2xl bg-white py-8 shadow-lg">
        <div className="flex flex-nowrap">
          {WALL_TILES_MEGA_MENU.map((column) => (
            <MegaMenuColumn key={column.title} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}

function FlooringMegaMenu({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="floor-tiles-dropdown absolute left-0 right-0 top-full z-[999] w-full pt-2">
      <div className="rounded-2xl bg-white py-8 shadow-lg">
        <div className="flex flex-nowrap">
          {FLOORING_MEGA_MENU.map((column) => (
            <MegaMenuColumn key={column.title} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LargeSlabsMegaMenu({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="large-slabs-dropdown absolute left-0 right-0 top-full z-[999] w-full pt-2">
      <div className="rounded-2xl bg-white py-8 shadow-lg">
        <div className="flex flex-nowrap">
          {LARGE_SLABS_MEGA_MENU.map((column) => (
            <MegaMenuColumn key={column.title} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DecorMosaicsMegaMenu({ isOpen }) {
  if (!isOpen) return null;

  return (
    <div className="decor-mosaics-dropdown absolute left-0 right-0 top-full z-[999] w-full pt-2">
      <div className="rounded-2xl bg-white py-8 shadow-lg">
        <div className="flex flex-nowrap">
          {DECOR_MOSAICS_MEGA_MENU.map((column) => (
            <MegaMenuColumn key={column.title} column={column} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SanwareMegaMenu({ isOpen }) {
  if (!isOpen) return null;

  const section = SANWARE_MEGA_MENU[0];

  return (
    <div className="sanware-dropdown absolute left-0 right-0 top-full z-[999] w-full pt-2">
      <div className="rounded-2xl bg-white px-6 py-8 shadow-lg">
        <div className="flex flex-nowrap border-y border-gray-200">
          {section.items.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`group flex flex-1 flex-col items-center gap-3 px-3 py-6 text-center ${
                index < section.items.length - 1 ? "border-r border-gray-200" : ""
              }`}
            >
              <img
                src={item.image}
                alt={item.label}
                className="h-16 w-full max-w-[80px] object-contain"
              />
              <span className="text-[10px] font-medium leading-tight tracking-wide text-gray-700 group-hover:text-gray-900">
                {item.label}
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function locationSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupLocationsByRegion(locations) {
  return locations.reduce((acc, location) => {
    if (!acc[location.region]) acc[location.region] = [];
    acc[location.region].push(location);
    return acc;
  }, {});
}

// --- Pill nav styles ---
const pillContainerClass =
  "rounded-2xl bg-white px-3 xl:px-5 py-2.5 backdrop-blur-sm shadow-sm";
const navLinkClass =
  "shrink-0 whitespace-nowrap text-xs font-medium text-gray-900 hover:text-gray-600 transition-colors";
const navDropdownClass =
  "flex shrink-0 items-center gap-0.5 whitespace-nowrap text-xs font-medium text-gray-900 hover:text-gray-600 cursor-pointer";

function PillDropdownPanel({ isOpen, className = "", children }) {
  if (!isOpen) return null;

  return (
    <div
      className={`absolute left-0 right-0 top-full z-[999] w-full pt-2 ${className}`}
    >
      <div className="rounded-2xl bg-white p-6 shadow-lg">{children}</div>
    </div>
  );
}

function ContactDropdown({ isOpen, locations }) {
  if (!isOpen) return null;

  const byRegion = groupLocationsByRegion(locations);

  return (
    <PillDropdownPanel isOpen className="contact-dropdown">
      <div className="grid grid-cols-3 gap-8">
        {Object.entries(byRegion).map(([region, locationsList]) => (
          <div key={region}>
            <p className="mb-3 text-sm font-bold text-gray-900">{region}</p>
            <div className="flex flex-col gap-2">
              {locationsList.map((location) => (
                <a
                  key={location.title}
                  href={`/contact/${locationSlug(location.title)}`}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  {location.title}
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PillDropdownPanel>
  );
}

function NavDropdownTrigger({ children, onMouseEnter, onClick, className = "", isOpen = false }) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={`${navDropdownClass} rounded-full px-1.5 py-1.5 xl:px-2.5 ${
        isOpen ? "bg-gray-100" : ""
      } ${className}`}
    >
      {children}
      <IoChevronDown
        size={12}
        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
}

function Icon({ id, open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={`${
        id === open ? "-rotate-0" : "-rotate-90"
      } size-3 transition-transform`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 8.25l-7.5 7.5-7.5-7.5"
      />
    </svg>
  );
}

function getMegaMenuItemLabel(item) {
  return item.label || item.dimension || "";
}

function MobileMegaMenuAccordion({
  menu,
  label,
  href,
  accordionId,
  open,
  onToggle,
  openSection,
  onSectionToggle,
  flatten = false,
}) {
  const flatItems = flatten
    ? menu.flatMap((column) => column.items)
    : [];

  return (
    <Accordion
      className="w-full px-5 border-b border-b-gray-300 relative"
      open={open === accordionId}
    >
      <MobileNavHeader
        href={href}
        label={label}
        id={accordionId}
        open={open}
        onToggle={onToggle}
        className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark"
      />
      <AccordionBody className="py-0 pb-2">
        {flatten ? (
          <div className="flex flex-col gap-1 pl-4">
            {flatItems.map((item) => (
              <a
                key={`${item.href}-${getMegaMenuItemLabel(item)}`}
                href={item.href}
                className="text-sm text-dark hover:text-dark py-1"
              >
                {getMegaMenuItemLabel(item)}
              </a>
            ))}
          </div>
        ) : (
          menu.map((column) => {
            const sectionKey = `${accordionId}-${column.title}`;
            return (
              <Accordion
                key={column.title}
                open={openSection === sectionKey}
                className="w-full"
              >
                <MobileNavHeader
                  label={column.title}
                  id={sectionKey}
                  open={openSection}
                  onToggle={onSectionToggle}
                  className="text-sm py-2 font-medium border-none"
                />
                <AccordionBody className="py-1">
                  <div className="flex flex-col gap-1 pl-4">
                    {column.items.map((item) => (
                      <a
                        key={`${item.href}-${getMegaMenuItemLabel(item)}`}
                        href={item.href}
                        className="text-sm text-dark hover:text-dark py-1"
                      >
                        {getMegaMenuItemLabel(item)}
                      </a>
                    ))}
                  </div>
                </AccordionBody>
              </Accordion>
            );
          })
        )}
      </AccordionBody>
    </Accordion>
  );
}

function MobileNavHeader({ href, label, id, open, onToggle, className }) {
  return (
    <AccordionHeader className={className}>
      <div className="flex w-full items-center justify-between gap-2">
        {href ? (
          <a href={href} className="flex-1 text-inherit">
            {label}
          </a>
        ) : (
          <span className="flex-1">{label}</span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(id);
          }}
          className="p-1 shrink-0"
          aria-label={`Toggle ${label} menu`}
        >
          <Icon id={id} open={open} />
        </button>
      </div>
    </AccordionHeader>
  );
}

const Navbar = () => {
  const navigate = useNavigate();
  const isTouchDevice = useIsTouchDevice();
  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showWallTiles, setShowWallTiles] = useState(false);
  const [showFloorTiles, setShowFloorTiles] = useState(false);
  const [showSanware, setShowSanware] = useState(false);
  const [showLargeSlabs, setShowLargeSlabs] = useState(false);
  const [showDecorMosaics, setShowDecorMosaics] = useState(false);
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
  const [openMegaMenuSection, setOpenMegaMenuSection] = useState(null);
  const [parentCategories, setParentCategories] = useState([]);

  const categorizedBrands = {
    "A-C": brands.filter((brand) => /^[A-C]/i.test(brand)),
    "D-G": brands.filter((brand) => /^[D-G]/i.test(brand)),
    "H-M": brands.filter((brand) => /^[H-M]/i.test(brand)),
    "N-R": brands.filter((brand) => /^[N-R]/i.test(brand)),
    "S-Z": brands.filter((brand) => /^[S-Z]/i.test(brand)),
  };

  const handleOpen = (value) => setOpen(open === value ? 0 : value);
  const handleBrandSectionOpen = (value) =>
    setOpenBrandSection(openBrandSection === value ? null : value);
  const handleMegaMenuSectionOpen = (value) =>
    setOpenMegaMenuSection(openMegaMenuSection === value ? null : value);

  useEffect(() => {
    // Fetch categories
    fetch("/data/navbar-categories.json")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        // Extract parent categories (those with parent = 0)
        const parents = data.filter(category => category.parent === 0);
        setParentCategories(parents);
      });

    // Fetch brands from API
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-brands.php`)
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
    fetch("/data/stiles-locations.json")
      .then((response) => response.json())
      .then((data) => {
        setLocations(data.locations);
      });

    const cart = JSON.parse(localStorage.getItem("stiles_cart_ls") || "[]");
    const totalQuantity = cart.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    setCartCount(totalQuantity);
  }, []);

  useEffect(() => {
    if (search.trim()) {
      setIsSearchLoading(true);
      const fetchSearchResults = async () => {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL}/api/search.php?q=${encodeURIComponent(
              search.trim()
            )}&limit=4`
          );
          if (!response.ok) {
            throw new Error("Failed to fetch search results");
          }
          const data = await response.json();
          console.log(data);
          if (data.status === "success" && Array.isArray(data.data)) {
            setSearchResults(data.data);
          } else {
            setSearchResults([]);
          }
        } catch (error) {
          console.error("Error fetching search results:", error);
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
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(value || 0);
  };

  const handleSearchSubmit = (e) => {
    if (e.key === "Enter" && search.trim()) {
      setShowSearch(false);
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeAllDropdowns = () => {
    setShowBrands(false);
    setShowWallTiles(false);
    setShowFloorTiles(false);
    setShowSanware(false);
    setShowLargeSlabs(false);
    setShowDecorMosaics(false);
    setShowContact(false);
    setOpenBrandSection(null);
    setOpenMegaMenuSection(null);
  };

  const openDropdown = (menu) => {
    closeAllDropdowns();
    if (menu === "brands") setShowBrands(true);
    if (menu === "wallTiles") setShowWallTiles(true);
    if (menu === "floorTiles") setShowFloorTiles(true);
    if (menu === "sanware") setShowSanware(true);
    if (menu === "largeSlabs") setShowLargeSlabs(true);
    if (menu === "decorMosaics") setShowDecorMosaics(true);
    if (menu === "contact") setShowContact(true);
  };

  // Add click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      const brandsDropdown = document.querySelector(".brands-dropdown");
      const brandsButton = event.target.closest(".brands-button");

      if (showBrands && !brandsDropdown?.contains(event.target) && !brandsButton) {
        setShowBrands(false);
      }

      const wallTilesDropdown = document.querySelector(".wall-tiles-dropdown");
      const wallTilesButton = event.target.closest(".wall-tiles-button");

      if (
        showWallTiles &&
        !wallTilesDropdown?.contains(event.target) &&
        !wallTilesButton
      ) {
        setShowWallTiles(false);
      }

      const floorTilesDropdown = document.querySelector(".floor-tiles-dropdown");
      const floorTilesButton = event.target.closest(".floor-tiles-button");

      if (
        showFloorTiles &&
        !floorTilesDropdown?.contains(event.target) &&
        !floorTilesButton
      ) {
        setShowFloorTiles(false);
      }

      const largeSlabsDropdown = document.querySelector(".large-slabs-dropdown");
      const largeSlabsButton = event.target.closest(".large-slabs-button");

      if (
        showLargeSlabs &&
        !largeSlabsDropdown?.contains(event.target) &&
        !largeSlabsButton
      ) {
        setShowLargeSlabs(false);
      }

      const decorMosaicsDropdown = document.querySelector(".decor-mosaics-dropdown");
      const decorMosaicsButton = event.target.closest(".decor-mosaics-button");

      if (
        showDecorMosaics &&
        !decorMosaicsDropdown?.contains(event.target) &&
        !decorMosaicsButton
      ) {
        setShowDecorMosaics(false);
      }

      const sanwareDropdown = document.querySelector(".sanware-dropdown");
      const sanwareButton = event.target.closest(".sanware-button");

      if (
        showSanware &&
        !sanwareDropdown?.contains(event.target) &&
        !sanwareButton
      ) {
        setShowSanware(false);
      }

      const contactDropdown = document.querySelector(".contact-dropdown");
      const contactButton = event.target.closest(".contact-button");

      if (
        showContact &&
        !contactDropdown?.contains(event.target) &&
        !contactButton
      ) {
        setShowContact(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showBrands,
    showWallTiles,
    showFloorTiles,
    showLargeSlabs,
    showDecorMosaics,
    showSanware,
    showContact,
  ]);

  return (
    <>
      {showSearch && (
        <div className="w-full fixed h-screen top-0 z-[999] flex flex-col justify-center items-center gap-5 px-4 py-3">
          <div
            className="bg-black/80 w-full h-full absolute top-0 left-0 z-0"
            onClick={() => setShowSearch(false)}
          ></div>
          <div className="w-11/12 max-w-3xl relative z-10">
            <input
              type="search"
              id="search-input-navbar"
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
                        src={product.image || ""}
                        alt={product.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-sm font-medium text-gray-900">
                        {product.title}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {product.brands || ""}
                      </p>
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
                      navigate(
                        `/search?q=${encodeURIComponent(search.trim())}`
                      );
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
      )}
      <nav className="w-full fixed top-0 left-0 right-0 z-50">
        {/* Mobile pill nav bar */}
        <div className="nav:hidden py-3">
          <div className="container mx-auto px-4">
            <div
              className={`flex w-full items-center justify-between ${pillContainerClass}`}
            >
              <a href="/" className="shrink-0">
                <img src="/images/logo.png" alt="Stiles" className="h-12" />
              </a>
              <button
                onClick={() => setShowMenu(true)}
                className="text-gray-900 p-1"
                aria-label="Open menu"
              >
                <IoMenu size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop pill menu */}
        <div className="hidden nav:block py-5">
          <div className="mx-auto w-full max-w-[1440px] px-3 xl:px-4">
            <div
              className={`relative flex w-full items-center gap-3 xl:gap-6 ${pillContainerClass}`}
              onMouseLeave={closeAllDropdowns}
            >
              <a href="/" className="shrink-0">
                <img src="/images/logo.png" alt="Stiles" className="h-12 xl:h-14" />
              </a>

              <div className="flex min-w-0 flex-1 items-center">
            <div className="flex flex-nowrap items-center gap-2 xl:gap-4 2xl:gap-8">
              {/* <NavDropdownTrigger
                onMouseEnter={() => openDropdown("brands")}
                onClick={() =>
                  isTouchDevice
                    ? showBrands
                      ? closeAllDropdowns()
                      : openDropdown("brands")
                    : undefined
                }
                className="brands-button"
                isOpen={showBrands}
              >
                Brands
              </NavDropdownTrigger> */}


              {/* Floor Tiles */}
              <NavDropdownTrigger
                onMouseEnter={() => openDropdown("floorTiles")}
                onClick={() =>
                  isTouchDevice
                    ? showFloorTiles
                      ? closeAllDropdowns()
                      : openDropdown("floorTiles")
                    : (window.location.href = "/product-category/flooring")
                }
                className="floor-tiles-button"
                isOpen={showFloorTiles}
              >
                Floor Tiles
              </NavDropdownTrigger>
              
              {/* Wall Tiles */}
              <NavDropdownTrigger
                onMouseEnter={() => openDropdown("wallTiles")}
                onClick={() =>
                  isTouchDevice
                    ? showWallTiles
                      ? closeAllDropdowns()
                      : openDropdown("wallTiles")
                    : (window.location.href = "/product-category/tiles/wall-tiles")
                }
                className="wall-tiles-button"
                isOpen={showWallTiles}
              >
                Wall Tiles
              </NavDropdownTrigger>
              
              {/* Large Slabs */}
              <NavDropdownTrigger
                onMouseEnter={() => openDropdown("largeSlabs")}
                onClick={() =>
                  isTouchDevice
                    ? showLargeSlabs
                      ? closeAllDropdowns()
                      : openDropdown("largeSlabs")
                    : (window.location.href = "/product-category/tiles/large-slab")
                }
                className="large-slabs-button"
                isOpen={showLargeSlabs}
              >
                Large Slabs
              </NavDropdownTrigger>

              {/* Decor */}
              <NavDropdownTrigger
                onMouseEnter={() => openDropdown("decorMosaics")}
                onClick={() =>
                  isTouchDevice
                    ? showDecorMosaics
                      ? closeAllDropdowns()
                      : openDropdown("decorMosaics")
                    : (window.location.href = "/product-category/tiles/mosaics")
                }
                className="decor-mosaics-button"
                isOpen={showDecorMosaics}
              >
                Decor
              </NavDropdownTrigger>

              <NavDropdownTrigger
                onMouseEnter={() => openDropdown("sanware")}
                onClick={() =>
                  isTouchDevice
                    ? showSanware
                      ? closeAllDropdowns()
                      : openDropdown("sanware")
                    : (window.location.href = "/product-category/sanitary-ware")
                }
                className="sanware-button"
                isOpen={showSanware}
              >
                Sanware
              </NavDropdownTrigger>

              {/* <NavDropdownTrigger
                onMouseEnter={() => openDropdown("flooring")}
                onClick={() =>
                  isTouchDevice
                    ? showFlooring
                      ? closeAllDropdowns()
                      : openDropdown("flooring")
                    : (window.location.href = "/product-category/flooring")
                }
                className="flooring-button"
                isOpen={showFlooring}
              >
                Flooring
              </NavDropdownTrigger> */}

              <a href="/calore-kamado-jan/" className={navLinkClass}>
                Fireplaces
              </a>

              <a
                href="javascript: roomvo.startStandaloneVisualizer();"
                className={navLinkClass}
              >
                Tile Visualizer
              </a>

              <NavDropdownTrigger
                onMouseEnter={() => openDropdown("contact")}
                onClick={() =>
                  isTouchDevice
                    ? showContact
                      ? closeAllDropdowns()
                      : openDropdown("contact")
                    : (window.location.href = "/contact-us")
                }
                className="contact-button"
                isOpen={showContact}
              >
                Contact Us
              </NavDropdownTrigger>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-3 xl:gap-5">
              <div className="flex items-center gap-2.5 xl:gap-3">
                <button
                  onClick={() => {
                    setShowSearch(true);
                    document.getElementById("search-input-navbar").focus();
                  }}
                  className="text-gray-900 hover:text-gray-600"
                  aria-label="Search"
                >
                  <IoSearch size={18} />
                </button>
                <a href="/wishlist" className="text-gray-900 hover:text-gray-600">
                  <FaHeart size={16} />
                </a>
                {cartCount > 0 ? (
                  <a href="/cart" className="relative flex items-center text-gray-900">
                    <Badge color="red">
                      <FaCartShopping size={16} />
                    </Badge>
                  </a>
                ) : (
                  <a href="/cart" className="text-gray-900 hover:text-gray-600">
                    <FaCartShopping size={16} />
                  </a>
                )}
              </div>

              {isAuthenticated ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 whitespace-nowrap rounded-full border border-gray-900 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 xl:px-4">
                    <FaUser size={14} />
                    {user.firstName}
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-lg bg-white py-2 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </a>
                      <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Orders
                      </a>
                      {isAdmin && (
                        <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Admin
                        </a>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <a
                  href="/login"
                  className="whitespace-nowrap rounded-full border border-gray-900 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-50 xl:px-4"
                >
                  Login
                </a>
              )}

              {/* <a
                href="/shop"
                className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
              >
                Shop
              </a> */}
            </div>

            {/* --- Full-width pill dropdowns --- */}
            {/* <PillDropdownPanel isOpen={showBrands} className="brands-dropdown">
              <div className="grid grid-cols-5 gap-6">
                {Object.entries(categorizedBrands).map(
                  ([range, brandList]) =>
                    brandList.length > 0 && (
                      <div key={range}>
                        <p className="mb-3 text-xs font-bold text-gray-400">
                          Brands {range}
                        </p>
                        <div className="flex flex-col gap-1">
                          {brandList.map((brand) => (
                            <a
                              key={brand}
                              href={`/product-category/brands/${brand}`}
                              className="text-sm text-gray-600 hover:text-gray-900"
                            >
                              {decodeHtmlEntities(brand)}
                            </a>
                          ))}
                        </div>
                      </div>
                    )
                )}
              </div>
            </PillDropdownPanel> */}

            {/* <PillDropdownPanel isOpen={showTiles} className="tiles-dropdown">
              <div className="grid grid-cols-3 gap-6">
                {data
                  ?.filter((item) => {
                    const tilesParent = parentCategories.find((p) =>
                      p.name.toLowerCase().includes("tile")
                    );
                    return tilesParent ? item.parent === tilesParent.term_id : false;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => {
                    const hasSubcategories = data?.some(
                      (subItem) => subItem.parent === item.term_id
                    );

                    if (hasSubcategories) {
                      return (
                        <div key={item.term_id}>
                          <a
                            href={`/product-category/tiles/${item.slug}`}
                            className="mb-2 block text-sm font-semibold text-gray-900"
                          >
                            {item.name}
                          </a>
                          <div className="flex flex-col gap-1">
                            {data
                              ?.filter((subItem) => subItem.parent === item.term_id)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((subItem) => (
                                <a
                                  key={subItem.term_id}
                                  href={`/product-category/tiles/${item.slug}/${subItem.slug}`}
                                  className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                  {subItem.name}
                                </a>
                              ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <a
                        key={item.term_id}
                        href={`/product-category/tiles/${item.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-600"
                      >
                        {item.name}
                      </a>
                    );
                  })}
              </div>
              <a
                href="/product-category/tiles"
                className="mt-6 inline-block text-sm font-semibold text-gray-900"
              >
                See all Tiles
              </a>
            </PillDropdownPanel> */}

            {/* <PillDropdownPanel isOpen={showSanware} className="sanware-dropdown">
              <div className="grid grid-cols-3 gap-6">
                {data
                  ?.filter((item) => {
                    const sanwareParent = parentCategories.find((p) =>
                      p.name.toLowerCase().includes("sanitary")
                    );
                    return sanwareParent ? item.parent === sanwareParent.term_id : false;
                  })
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((item) => {
                    const hasSubcategories = data?.some(
                      (subItem) => subItem.parent === item.term_id
                    );

                    if (hasSubcategories) {
                      return (
                        <div key={item.term_id}>
                          <a
                            href={`/product-category/sanitary-ware/${item.slug}`}
                            className="mb-2 block text-sm font-semibold text-gray-900"
                          >
                            {item.name}
                          </a>
                          <div className="flex flex-col gap-1">
                            {data
                              ?.filter((subItem) => subItem.parent === item.term_id)
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((subItem) => (
                                <a
                                  key={subItem.term_id}
                                  href={`/product-category/sanitary-ware/${item.slug}/${subItem.slug}`}
                                  className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                  {subItem.name}
                                </a>
                              ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <a
                        key={item.term_id}
                        href={`/product-category/sanitary-ware/${item.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-600"
                      >
                        {item.name}
                      </a>
                    );
                  })}
              </div>
              <a
                href="/product-category/sanitary-ware"
                className="mt-6 inline-block text-sm font-semibold text-gray-900"
              >
                See all Sanware
              </a>
            </PillDropdownPanel> */}

            <WallTilesMegaMenu isOpen={showWallTiles} />
            <FlooringMegaMenu isOpen={showFloorTiles} />
            <LargeSlabsMegaMenu isOpen={showLargeSlabs} />
            <DecorMosaicsMegaMenu isOpen={showDecorMosaics} />
            <SanwareMegaMenu isOpen={showSanware} />
            <ContactDropdown isOpen={showContact} locations={locations} />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`w-10/12 h-lvh bg-white fixed top-0 right-0 z-[90] nav:hidden flex flex-col justify-start items-start max-h-lvh overflow-y-auto transition-all ${
          showMenu ? "translate-x-0" : "translate-x-full"
        }`}
        id="navbar-mobile-menu"
      >
        <div className="sticky top-0 z-10 w-full bg-white px-4 py-3 flex justify-end items-center border-b border-b-gray-300">
          <IoClose
            stroke="black"
            size={30}
            onClick={() => setShowMenu(false)}
          />
        </div>
        <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
          <a href="/" className="text-sm font-bold text-dark">
            Home
          </a>
        </div>
        {/* Brand */}
        {/* <Accordion
          className="w-full px-5 border-b border-b-gray-300 relative"
          open={open === 4}
        >
          <MobileNavHeader
            label="Shop By Brand"
            id={4}
            open={open}
            onToggle={handleOpen}
            className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark"
          />
          <AccordionBody className="py-0 pb-2">
            {Object.entries(categorizedBrands).map(
              ([range, brandList]) =>
                brandList.length > 0 && (
                  <Accordion
                    key={range}
                    open={openBrandSection === range}
                    className="w-full"
                  >
                    <MobileNavHeader
                      label={`Brands ${range}`}
                      id={range}
                      open={openBrandSection}
                      onToggle={handleBrandSectionOpen}
                      className="text-sm py-2 font-medium border-none"
                    />
                    <AccordionBody className="py-1">
                      <div className="flex flex-col gap-1 pl-4">
                        {brandList.map((brand) => (
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
            )}
          </AccordionBody>
        </Accordion> */}

        <MobileMegaMenuAccordion
          menu={FLOORING_MEGA_MENU}
          label="Floor Tiles"
          href="/product-category/floor-tiles"
          accordionId={1}
          open={open}
          onToggle={handleOpen}
          openSection={openMegaMenuSection}
          onSectionToggle={handleMegaMenuSectionOpen}
        />

        <MobileMegaMenuAccordion
          menu={WALL_TILES_MEGA_MENU}
          label="Wall Tiles"
          href="/product-category/tiles/wall-tiles"
          accordionId={2}
          open={open}
          onToggle={handleOpen}
          openSection={openMegaMenuSection}
          onSectionToggle={handleMegaMenuSectionOpen}
        />

        <MobileMegaMenuAccordion
          menu={LARGE_SLABS_MEGA_MENU}
          label="Large Slabs"
          href="/product-category/tiles/large-slab"
          accordionId={3}
          open={open}
          onToggle={handleOpen}
          openSection={openMegaMenuSection}
          onSectionToggle={handleMegaMenuSectionOpen}
        />

        <MobileMegaMenuAccordion
          menu={DECOR_MOSAICS_MEGA_MENU}
          label="Decor"
          href="/product-category/tiles/mosaics"
          accordionId={4}
          open={open}
          onToggle={handleOpen}
          openSection={openMegaMenuSection}
          onSectionToggle={handleMegaMenuSectionOpen}
        />

        <MobileMegaMenuAccordion
          menu={SANWARE_MEGA_MENU}
          label="Sanware"
          href="/product-category/sanitary-ware"
          accordionId={5}
          open={open}
          onToggle={handleOpen}
          openSection={openMegaMenuSection}
          onSectionToggle={handleMegaMenuSectionOpen}
          flatten
        />

        {/* Fireplace */}
        <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
          <a href="/calore-kamado-jan/" className="text-sm font-bold text-dark">
            Fireplaces
          </a>
        </div>
        {/* <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/promos" className="text-sm font-bold">Promos</a>
      </div> */}
        {/* <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
        <a href="/tile-visualizer" className="text-sm font-bold">Tile Visualizer</a>
      </div> */}
        <Accordion
          className="w-full px-5 border-b border-b-gray-300 relative"
          open={open === 6}
        >
          <MobileNavHeader
            href="/contact-us"
            label="Contact Us"
            id={6}
            open={open}
            onToggle={handleOpen}
            className="text-sm font-bold w-full flex flex-row justify-between items-center gap-2 border-none py-3.5 text-dark"
          />
          <AccordionBody className="py-0 pb-2">
            {Object.entries(groupLocationsByRegion(locations)).map(
              ([region, locationsList]) => (
                <div key={region} className="w-full mb-3 last:mb-0">
                  <p className="text-sm font-bold mb-2">{region}</p>
                  <div className="flex flex-col gap-2 pl-4">
                    {locationsList.map((location) => (
                      <a
                        key={location.title}
                        href={`/contact/${locationSlug(location.title)}`}
                        className="text-sm text-dark hover:text-dark"
                      >
                        {location.title}
                      </a>
                    ))}
                  </div>
                </div>
              )
            )}
          </AccordionBody>
        </Accordion>
        <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
          <a
            href="javascript: roomvo.startStandaloneVisualizer();"
            className="text-sm font-bold text-dark"
          >
            Tile Visualizer
          </a>
        </div>

        {isAuthenticated ? (
          <>
            <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
              <a href="/profile" className="text-sm font-bold text-dark">
                Profile
              </a>
            </div>
            <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
              <a href="/orders" className="text-sm font-bold text-dark">
                Orders
              </a>
            </div>
            <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-dark"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div className="w-full px-5 py-3.5 border-b border-b-gray-300 relative">
            <a href="/login" className="text-sm font-bold text-dark">
              Login
            </a>
          </div>
        )}
        <div className="w-full flex justify-center items-center gap-8 px-5 py-5">
          {/* <a href="#"><FaUser className="fill-dark" size={20} /></a> */}
          <a href="/wishlist">
            <FaHeart className="fill-dark" size={20} />
          </a>
          <a href="/cart">
            <FaCartShopping className="fill-dark" size={20} />
          </a>

          <button
            onClick={() => {
              setShowSearch(true);
              document.getElementById("search-input-navbar").focus();
            }}
            className="text-dark"
          >
            <IoSearch size={22} />
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
