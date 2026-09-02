import { useRef } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';

const BATHROOM_ACCESSORY_ITEMS = [
  { label: "Toilet Paper Holders", href: "/product-category/sanitary-ware/bathroom-accessories/toilet-paper-holders" },
  { label: "Shelves", href: "/product-category/sanitary-ware/bathroom-accessories/shelves" },
  { label: "Soap Holders", href: "/product-category/sanitary-ware/bathroom-accessories/soap-holders" },
  { label: "Robe Hooks", href: "/product-category/sanitary-ware/bathroom-accessories/robe-hooks" },
  { label: "Towel Rails", href: "/product-category/sanitary-ware/bathroom-accessories/towel-rails" },
  { label: "Heated Towel Rails", href: "/product-category/sanitary-ware/bathroom-accessories/heated-towel-rails" },
  { label: "Shower Caddies", href: "/product-category/sanitary-ware/bathroom-accessories/shower-caddies" },
  { label: "Toilet Brushes", href: "/product-category/sanitary-ware/bathroom-accessories/toilet-brushes" },
];

const BASIN_ITEMS = [
  { label: "Counter Top Basins", href: "/product-category/sanitary-ware/basins/counter-top-basins" },
  { label: "Undercounter Basins (Underslung Basin)", href: "/product-category/sanitary-ware/basins/undercounter-basins" },
  { label: "Freestanding Basins", href: "/product-category/sanitary-ware/basins/freestanding-basins" },
  { label: "Drop in Basins", href: "/product-category/sanitary-ware/basins/drop-in-basins" },
  { label: "Semi-Recessed Basins", href: "/product-category/sanitary-ware/basins/semi-recessed-basins" },
  { label: "Wall Hung Basins (Same as Handrinse Basins)", href: "/product-category/sanitary-ware/basins/wall-hung-basins" },
  { label: "Pedestal Basins", href: "/product-category/sanitary-ware/basins/pedestal-basins" },
  { label: "Medical Basins", href: "/product-category/sanitary-ware/basins/medical-basins" },
  { label: "Cabinets (also Vanity)", href: "/product-category/sanitary-ware/basins/cabinets" },
];

export const isBathroomAccessoriesSlug = (slug) =>
  String(slug || "").toLowerCase() === "bathroom-accessories";

export const isBasinsSlug = (slug) =>
  String(slug || "").toLowerCase() === "basins";

const AccessoryCard = ({ item }) => (
  <a href={item.href} className="flex flex-col items-center text-center">
    <img
      src="/images/product_ph.png"
      alt={item.label}
      className="w-full aspect-[4/3] object-cover rounded-lg"
    />
    <span className="mt-4 text-sm font-medium text-dark leading-snug">
      {item.label}
    </span>
  </a>
);

export const BathroomAccessoriesSubcategories = () => {
  const carouselRef = useRef(null);

  return (
  <section className="w-full bg-white pt-32 pb-16 lg:pt-36">
    <div className="container mx-auto px-6 lg:px-12">
      <h1 className="text-4xl font-medium uppercase tracking-wide text-dark">
        Bathroom Accessories
      </h1>

      <div className="mt-10 flex items-center gap-2 lg:hidden">
        <div className="min-w-0 flex-1">
          <Splide
            ref={carouselRef}
            options={{
              type: 'loop',
              perPage: 2,
              gap: '1.5rem',
              arrows: false,
              pagination: true,
            }}
          >
            {BATHROOM_ACCESSORY_ITEMS.map((item) => (
              <SplideSlide key={item.href}>
                <AccessoryCard item={item} />
              </SplideSlide>
            ))}
          </Splide>
        </div>
        <button
          type="button"
          aria-label="Next"
          className="mb-8 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark text-white"
          onClick={() => carouselRef.current?.go('>')}
        >
          <FaChevronRight size={14} />
        </button>
      </div>

      <div className="mt-16 hidden lg:grid grid-cols-8 gap-8">
        {BATHROOM_ACCESSORY_ITEMS.map((item) => (
          <AccessoryCard key={item.href} item={item} />
        ))}
      </div>
    </div>
  </section>
  );
};

export const BasinSubcategories = () => (
  <nav className="w-full bg-white mb-2">
    <ul className="w-full border-t border-gray-200">
      {BASIN_ITEMS.map((item) => (
        <li key={item.href} className="border-b border-gray-200">
          <a
            href={item.href}
            className="block py-3 text-sm md:text-base text-dark hover:text-black"
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  </nav>
);
