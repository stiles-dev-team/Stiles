import { useRef } from 'react';
import { FaChevronRight } from 'react-icons/fa6';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll';
import '@splidejs/react-splide/css';

const BATHROOM_ACCESSORY_BASE = "/product-category/sanitary-ware/bathroom-accessories";

const BATHROOM_ACCESSORY_ITEMS = [
  {
    label: "Toilet Accessories",
    slug: "toilet-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/toilet-accessories`,
    children: [
      { label: "Toilet Roll Holder", href: `${BATHROOM_ACCESSORY_BASE}/toilet-roll-holder` },
      { label: "Toilet Brush and Holder (Toilet Brush) + (Toilet Holder)", href: `${BATHROOM_ACCESSORY_BASE}/toilet-brush-and-holder` },
      { label: "Spare Toilet Roll Holder", href: `${BATHROOM_ACCESSORY_BASE}/spare-toilet-roll-holder` },
      { label: "Sanitary Bag Holder", href: `${BATHROOM_ACCESSORY_BASE}/sanitary-bag-holder` },
      { label: "Watse Bin", href: `${BATHROOM_ACCESSORY_BASE}/watse-bin` },
    ],
  },
  {
    label: "Basin Accessories",
    slug: "basin-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/basin-accessories`,
    children: [
      { label: "Towel Rings", href: `${BATHROOM_ACCESSORY_BASE}/towel-rings` },
      { label: "Toothbrush Holder", href: `${BATHROOM_ACCESSORY_BASE}/toothbrush-holder` },
      { label: "Tissue Holder", href: `${BATHROOM_ACCESSORY_BASE}/tissue-holder` },
    ],
  },
  {
    label: "Shower and Bath Accessories",
    slug: "shower-and-bath-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/shower-and-bath-accessories`,
    children: [
      { label: "Shower Racks (Shower Caddies)", href: `${BATHROOM_ACCESSORY_BASE}/shower-racks` },
      { label: "Glass Shelves", href: `${BATHROOM_ACCESSORY_BASE}/glass-shelves` },
      { label: "Shower Seats", href: `${BATHROOM_ACCESSORY_BASE}/shower-seats` },
      { label: "Shower Door Accessories", href: `${BATHROOM_ACCESSORY_BASE}/shower-door-accessories` },
      { label: "Towel Rails", href: `${BATHROOM_ACCESSORY_BASE}/towel-rails` },
      { label: "Robe Hooks", href: `${BATHROOM_ACCESSORY_BASE}/robe-hooks` },
      { label: "Shower Filters", href: `${BATHROOM_ACCESSORY_BASE}/shower-filters` },
    ],
  },
  {
    label: "Soap Holder",
    slug: "soap-holder",
    href: `${BATHROOM_ACCESSORY_BASE}/soap-holder`,
  },
  {
    label: "Heated Towel Rails",
    slug: "heated-towel-rails",
    href: `${BATHROOM_ACCESSORY_BASE}/heated-towel-rails`,
  },
  {
    label: "Mirrors",
    slug: "mirrors",
    href: `${BATHROOM_ACCESSORY_BASE}/mirrors`,
  },
  {
    label: "Commercial Accessories",
    slug: "commercial-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/commercial-accessories`,
    children: [
      { label: "Hand Dryers", href: `${BATHROOM_ACCESSORY_BASE}/hand-dryers` },
      { label: "Toilet Roll Dispenser", href: `${BATHROOM_ACCESSORY_BASE}/toilet-roll-dispenser` },
      { label: "Sanitary Bins", href: `${BATHROOM_ACCESSORY_BASE}/sanitary-bins` },
      { label: "Soap Dispensers", href: `${BATHROOM_ACCESSORY_BASE}/soap-dispensers` },
      { label: "Paper Towel Dispenser", href: `${BATHROOM_ACCESSORY_BASE}/paper-towel-dispenser` },
      { label: "Wall Bin", href: `${BATHROOM_ACCESSORY_BASE}/wall-bin` },
      { label: "Grab Rails", href: `${BATHROOM_ACCESSORY_BASE}/grab-rails` },
    ],
  },
  {
    label: "Room Heating",
    slug: "room-heating",
    href: `${BATHROOM_ACCESSORY_BASE}/room-heating`,
  },
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

const SHOWER_BASE = "/product-category/sanitary-ware/showers";

const SHOWER_ITEMS = [
  {
    label: "Shower Roses (Shower Heads) + (Shower Heads + Arms)",
    slug: "shower-roses",
    href: `${SHOWER_BASE}/shower-roses`,
  },
  {
    label: "Shower Arms",
    slug: "shower-arms",
    href: `${SHOWER_BASE}/shower-arms`,
  },
  {
    label: "Shower Rails (Rail Sets) (Shower Bar)",
    slug: "shower-rails",
    href: `${SHOWER_BASE}/shower-rails`,
  },
  {
    label: "Shower Columns",
    slug: "shower-columns",
    href: `${SHOWER_BASE}/shower-columns`,
  },
  {
    label: "Shower Pipes",
    slug: "shower-pipes",
    href: `${SHOWER_BASE}/shower-pipes`,
  },
  {
    label: "Hand Showers (Outlet and Bracket) + (Shower Hoses) + (Wall Outlets)",
    slug: "hand-showers",
    href: `${SHOWER_BASE}/hand-showers`,
  },
  {
    label: "Shower Glass",
    slug: "shower-glass",
    href: `${SHOWER_BASE}/shower-glass`,
    children: [
      { label: "Shower Screen", href: `${SHOWER_BASE}/shower-screen` },
      { label: "Pivot Door", href: `${SHOWER_BASE}/pivot-door` },
      { label: "Return Panel", href: `${SHOWER_BASE}/return-panel` },
      { label: "Tri Slider", href: `${SHOWER_BASE}/tri-slider` },
      { label: "Bi Slider", href: `${SHOWER_BASE}/bi-slider` },
      { label: "Bath Screen", href: `${SHOWER_BASE}/bath-screen` },
      { label: "Telescopic Shower Door", href: `${SHOWER_BASE}/telescopic-shower-door` },
      { label: "Mono Telescopic Shower Door", href: `${SHOWER_BASE}/mono-telescopic-shower-door` },
    ],
  },
  {
    label: "Shower Trays",
    slug: "shower-trays",
    href: `${SHOWER_BASE}/shower-trays`,
  },
  {
    label: "Shower Wall Panels",
    slug: "shower-wall-panels",
    href: `${SHOWER_BASE}/shower-wall-panels`,
  },
  {
    label: "Pet Friendly",
    slug: "pet-friendly",
    href: `${SHOWER_BASE}/pet-friendly`,
  },
  {
    label: "Bidet Spray (Trigger Spray)",
    slug: "bidet-spray",
    href: `${SHOWER_BASE}/bidet-spray`,
  },
];

const DOMESTIC_HOT_WATER_ITEMS = [
  { label: "Heat Pumps", href: "/product-category/sanitary-ware/domestic-hot-water/heat-pumps" },
  { label: "Instantaneous Water Heaters", href: "/product-category/sanitary-ware/domestic-hot-water/instantaneous-water-heaters" },
];

const TAPWARE_BASE = "/product-category/sanitary-ware/mixers-and-taps";

const TAPWARE_ITEMS = [
  {
    label: "Mixers",
    slug: "mixers",
    href: `${TAPWARE_BASE}/mixers`,
    children: [
      { label: "Basin Mixers", href: `${TAPWARE_BASE}/basin-mixers` },
      { label: "Concealed Mixers", href: `${TAPWARE_BASE}/concealed-mixers` },
      { label: "Concealed Diver Mixers", href: `${TAPWARE_BASE}/concealed-diver-mixers` },
      { label: "Thermostatic Mixers", href: `${TAPWARE_BASE}/thermostatic-mixers` },
      { label: "Sink Mixers (Kitchen Mixers)", href: `${TAPWARE_BASE}/sink-mixers` },
      { label: "Electronic Mixers", href: `${TAPWARE_BASE}/electronic-mixers` },
      { label: "Stop Taps", href: `${TAPWARE_BASE}/stop-taps` },
      { label: "Bib Taps", href: `${TAPWARE_BASE}/bib-taps` },
      { label: "Pillar Taps", href: `${TAPWARE_BASE}/pillar-taps` },
    ],
  },
  {
    label: "Spouts",
    slug: "spouts",
    href: `${TAPWARE_BASE}/spouts`,
    children: [
      { label: "Bath Spouts", href: `${TAPWARE_BASE}/bath-spouts` },
      { label: "Basin Spouts", href: `${TAPWARE_BASE}/basin-spouts` },
    ],
  },
  {
    label: "Wastes",
    slug: "wastes",
    href: `${TAPWARE_BASE}/wastes`,
    children: [
      { label: "Bath Wastes", href: `${TAPWARE_BASE}/bath-wastes` },
      { label: "Basin Wastes", href: `${TAPWARE_BASE}/basin-wastes` },
    ],
  },
  {
    label: "Valves",
    slug: "valves",
    href: `${TAPWARE_BASE}/valves`,
  },
  {
    label: "Traps",
    slug: "traps",
    href: `${TAPWARE_BASE}/traps`,
    children: [
      { label: "PVC Traps", href: `${TAPWARE_BASE}/pvc-traps` },
      { label: "Bottle Traps", href: `${TAPWARE_BASE}/bottle-traps` },
      { label: "Shower Traps", href: `${TAPWARE_BASE}/shower-traps` },
      { label: "Shower Channels", href: `${TAPWARE_BASE}/shower-channels` },
    ],
  },
];

const KITCHEN_BASE = "/product-category/sanitary-ware/kitchen-sinks";

const KITCHEN_ITEMS = [
  {
    label: "Sink",
    slug: "sink",
    href: `${KITCHEN_BASE}/sink`,
    children: [
      { label: "Undermount Sinks", href: `${KITCHEN_BASE}/undermount-sinks` },
      { label: "Drop in Sinks", href: `${KITCHEN_BASE}/drop-in-sinks` },
    ],
  },
  {
    label: "Prep Bowl",
    slug: "prep-bowl",
    href: `${KITCHEN_BASE}/prep-bowl`,
    children: [
      { label: "Undermount Sinks", href: `${KITCHEN_BASE}/prep-bowl-undermount-sinks` },
      { label: "Drop in Sink", href: `${KITCHEN_BASE}/prep-bowl-drop-in-sink` },
    ],
  },
  {
    label: "Butler Sinks",
    slug: "butler-sinks",
    href: `${KITCHEN_BASE}/butler-sinks`,
  },
  {
    label: "Wash Trough",
    slug: "wash-trough",
    href: `${KITCHEN_BASE}/wash-trough`,
  },
  {
    label: "Kitchen Mixers",
    slug: "kitchen-mixers",
    href: `${KITCHEN_BASE}/kitchen-mixers`,
  },
  {
    label: "Waste Disposers",
    slug: "waste-disposers",
    href: `${KITCHEN_BASE}/waste-disposers`,
  },
  {
    label: "Cleaning Agent",
    slug: "cleaning-agent",
    href: `${KITCHEN_BASE}/cleaning-agent`,
  },
  {
    label: "Sink Wastes",
    slug: "sink-wastes",
    href: `${KITCHEN_BASE}/sink-wastes`,
  },
  {
    label: "Water Filters",
    slug: "water-filters",
    href: `${KITCHEN_BASE}/water-filters`,
  },
];

const BATH_ITEMS = [
  { label: "Freestanding Baths", href: "/product-category/sanitary-ware/baths/freestanding-baths" },
  { label: "Built In Baths", href: "/product-category/sanitary-ware/baths/built-in-baths" },
  { label: "Spa and Jacuzzi", href: "/product-category/sanitary-ware/baths/spa-and-jacuzzi" },
];

const TOILET_BASE = "/product-category/sanitary-ware/toilets";

const TOILET_ITEMS = [
  {
    label: "Wall Hung Toilets",
    slug: "wall-hung-toilets",
    href: `${TOILET_BASE}/wall-hung-toilets`,
  },
  {
    label: "Close Coupled Wall Hung Toilets",
    slug: "close-coupled-wall-hung-toilets",
    href: `${TOILET_BASE}/close-coupled-wall-hung-toilets`,
  },
  {
    label: "Back to Wall Floor Mounted Toilets (Floor Mounted Pans)",
    slug: "back-to-wall-floor-mounted-toilets",
    href: `${TOILET_BASE}/back-to-wall-floor-mounted-toilets`,
  },
  {
    label: "Close Coupled Toilets",
    slug: "close-coupled-toilets",
    href: `${TOILET_BASE}/close-coupled-toilets`,
    children: [
      {
        label: "Back to Wall Closed Coupled Toilets",
        href: `${TOILET_BASE}/back-to-wall-closed-coupled-toilets`,
      },
    ],
  },
  {
    label: "Accesible Toilets",
    slug: "accesible-toilets",
    href: `${TOILET_BASE}/accesible-toilets`,
  },
  {
    label: "Shower Toilets",
    slug: "shower-toilets",
    href: `${TOILET_BASE}/shower-toilets`,
  },
  {
    label: "Aquaclean Toilets",
    slug: "aquaclean-toilets",
    href: `${TOILET_BASE}/aquaclean-toilets`,
  },
  {
    label: "Toilet Seats",
    slug: "toilet-seats",
    href: `${TOILET_BASE}/toilet-seats`,
  },
  {
    label: "Concealed Systems",
    slug: "concealed-systems",
    href: `${TOILET_BASE}/concealed-systems`,
    children: [
      { label: "Wall Hung Cisterns", href: `${TOILET_BASE}/wall-hung-cisterns` },
      { label: "Dry Wall Wall Hung Cisterns", href: `${TOILET_BASE}/dry-wall-wall-hung-cisterns` },
      { label: "Floor Mount Cisterns", href: `${TOILET_BASE}/floor-mount-cisterns` },
      { label: "Actuator Plates", href: `${TOILET_BASE}/actuator-plates` },
    ],
  },
  {
    label: "Urinals",
    slug: "urinals",
    href: `${TOILET_BASE}/urinals`,
    children: [
      { label: "Back Entry Urinal", href: `${TOILET_BASE}/back-entry-urinal` },
      { label: "Top Entry Urinal", href: `${TOILET_BASE}/top-entry-urinal` },
      { label: "Electronic Urinal", href: `${TOILET_BASE}/electronic-urinal` },
      { label: "Waterless Urinal", href: `${TOILET_BASE}/waterless-urinal` },
    ],
  },
];

export const isBathroomAccessoriesSlug = (slug) =>
  String(slug || "").toLowerCase() === "bathroom-accessories";

export const isBasinsSlug = (slug) =>
  String(slug || "").toLowerCase() === "basins";

export const isShowersSlug = (slug) =>
  String(slug || "").toLowerCase() === "showers";

export const isDomesticHotWaterSlug = (slug) => {
  const value = String(slug || "").toLowerCase();
  return value === "domestic-hot-water" || value === "water-heater";
};

export const isToiletsSlug = (slug) =>
  String(slug || "").toLowerCase() === "toilets";

export const isTapwareSlug = (slug) =>
  String(slug || "").toLowerCase() === "mixers-and-taps";

export const isKitchenSlug = (slug) =>
  String(slug || "").toLowerCase() === "kitchen-sinks";

export const isBathsSlug = (slug) =>
  String(slug || "").toLowerCase() === "baths";

export const getToiletCategoryWithChildren = (slug) =>
  TOILET_ITEMS.find(
    (item) =>
      item.slug === String(slug || "").toLowerCase() &&
      Array.isArray(item.children) &&
      item.children.length > 0
  );

export const getShowerCategoryWithChildren = (slug) =>
  SHOWER_ITEMS.find(
    (item) =>
      item.slug === String(slug || "").toLowerCase() &&
      Array.isArray(item.children) &&
      item.children.length > 0
  );

export const getBathroomAccessoryCategoryWithChildren = (slug) =>
  BATHROOM_ACCESSORY_ITEMS.find(
    (item) =>
      item.slug === String(slug || "").toLowerCase() &&
      Array.isArray(item.children) &&
      item.children.length > 0
  );

export const getTapwareCategoryWithChildren = (slug) =>
  TAPWARE_ITEMS.find(
    (item) =>
      item.slug === String(slug || "").toLowerCase() &&
      Array.isArray(item.children) &&
      item.children.length > 0
  );

export const getKitchenCategoryWithChildren = (slug) =>
  KITCHEN_ITEMS.find(
    (item) =>
      item.slug === String(slug || "").toLowerCase() &&
      Array.isArray(item.children) &&
      item.children.length > 0
  );

const AccessoryCard = ({ item }) => (
  <a href={item.href} className="flex flex-col items-center text-center px-1">
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

const SubcategoryCards = ({ title, items }) => {
  const carouselRef = useRef(null);
  const shouldAutoScroll = items.length > 6;

  return (
    <section className="w-full bg-white pt-32 pb-16 lg:pt-36">
      <div className="container mx-auto px-6 lg:px-12">
        <h1 className="text-4xl font-medium uppercase tracking-wide text-dark">
          {title}
        </h1>

        <div className="mt-10 flex items-center gap-3">
          <div className="min-w-0 flex-1 overflow-hidden">
            <Splide
              ref={carouselRef}
              extensions={shouldAutoScroll ? { AutoScroll } : undefined}
              options={{
                type: shouldAutoScroll ? 'loop' : 'slide',
                perPage: 8,
                perMove: 1,
                gap: '1.5rem',
                arrows: false,
                pagination: false,
                drag: true,
                trimSpace: true,
                autoScroll: shouldAutoScroll
                  ? {
                      speed: 0.35,
                      pauseOnHover: true,
                      pauseOnFocus: true,
                    }
                  : undefined,
                breakpoints: {
                  640: { perPage: 2 },
                  768: { perPage: 3 },
                  1024: { perPage: 5 },
                  1280: { perPage: 7 },
                },
              }}
            >
              {items.map((item) => (
                <SplideSlide key={item.href}>
                  <AccessoryCard item={item} />
                </SplideSlide>
              ))}
            </Splide>
          </div>
          {items.length > 2 && (
            <button
              type="button"
              aria-label="Next"
              className="mb-8 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-dark text-white"
              onClick={() => carouselRef.current?.go('>')}
            >
              <FaChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export const BathroomAccessoriesSubcategories = () => (
  <SubcategoryCards title="Sanitaryware Accessories" items={BATHROOM_ACCESSORY_ITEMS} />
);

export const BasinSubcategories = () => (
  <SubcategoryCards title="Basins" items={BASIN_ITEMS} />
);

export const ShowerSubcategories = () => (
  <SubcategoryCards title="Showers" items={SHOWER_ITEMS} />
);

export const DomesticHotWaterSubcategories = () => (
  <SubcategoryCards title="Domestic Hot Water" items={DOMESTIC_HOT_WATER_ITEMS} />
);

export const TapwareSubcategories = () => (
  <SubcategoryCards title="Tapware (Mixers & Taps)" items={TAPWARE_ITEMS} />
);

export const KitchenSubcategories = () => (
  <SubcategoryCards title="Kitchen" items={KITCHEN_ITEMS} />
);

export const BathSubcategories = () => (
  <SubcategoryCards title="Baths" items={BATH_ITEMS} />
);

export const ToiletSubcategories = () => (
  <SubcategoryCards title="Toilets" items={TOILET_ITEMS} />
);

export const ToiletNestedSubcategories = ({ category }) => (
  <SubcategoryCards title={category.label} items={category.children} />
);

export const ShowerNestedSubcategories = ({ category }) => (
  <SubcategoryCards title={category.label} items={category.children} />
);

export const BathroomAccessoriesNestedSubcategories = ({ category }) => (
  <SubcategoryCards title={category.label} items={category.children} />
);

export const TapwareNestedSubcategories = ({ category }) => (
  <SubcategoryCards title={category.label} items={category.children} />
);

export const KitchenNestedSubcategories = ({ category }) => (
  <SubcategoryCards title={category.label} items={category.children} />
);
