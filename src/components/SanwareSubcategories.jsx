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
    image: "/images/sanware/bathroom-accessories/toilet-paper-holders.png",
    children: [
      { label: "Toilet Roll Holder", href: `${BATHROOM_ACCESSORY_BASE}/toilet-roll-holder`, image: "/images/sanware/bathroom-accessories/toilet-paper-holders.png" },
      { label: "Toilet Brush and Holder (Toilet Brush) + (Toilet Holder)", href: `${BATHROOM_ACCESSORY_BASE}/toilet-brush-and-holder`, image: "/images/sanware/bathroom-accessories/toilet-brushes.png" },
      { label: "Spare Toilet Roll Holder", href: `${BATHROOM_ACCESSORY_BASE}/spare-toilet-roll-holder`, image: "/images/sanware/bathroom-accessories/toilet-paper-holders.png" },
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
    image: "/images/sanware/bathroom-accessories/shower-caddies.png",
    children: [
      { label: "Shower Racks (Shower Caddies)", href: `${BATHROOM_ACCESSORY_BASE}/shower-racks`, image: "/images/sanware/bathroom-accessories/shower-caddies.png" },
      { label: "Glass Shelves", href: `${BATHROOM_ACCESSORY_BASE}/glass-shelves`, image: "/images/sanware/bathroom-accessories/shelves.png" },
      { label: "Shower Seats", href: `${BATHROOM_ACCESSORY_BASE}/shower-seats`, image: "/images/sanware/shower/Shower%20Seats.png" },
      { label: "Shower Door Accessories", href: `${BATHROOM_ACCESSORY_BASE}/shower-door-accessories` },
      { label: "Towel Rails", href: `${BATHROOM_ACCESSORY_BASE}/towel-rails`, image: "/images/sanware/bathroom-accessories/towel-rails.png" },
      { label: "Robe Hooks", href: `${BATHROOM_ACCESSORY_BASE}/robe-hooks`, image: "/images/sanware/bathroom-accessories/robe-hooks.png" },
      { label: "Shower Filters", href: `${BATHROOM_ACCESSORY_BASE}/shower-filters` },
    ],
  },
  {
    label: "Soap Holder",
    slug: "soap-holder",
    href: `${BATHROOM_ACCESSORY_BASE}/soap-holder`,
    image: "/images/sanware/bathroom-accessories/soap-holders.png",
  },
  {
    label: "Heated Towel Rails",
    slug: "heated-towel-rails",
    href: `${BATHROOM_ACCESSORY_BASE}/heated-towel-rails`,
    image: "/images/sanware/bathroom-accessories/heated-towel-rails.png",
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
  { label: "Counter Top Basins", href: "/product-category/sanitary-ware/basins/counter-top-basins", image: "/images/sanware/basins/Counter%20Top%20Basins.png" },
  { label: "Undercounter Basins (Underslung Basin)", href: "/product-category/sanitary-ware/basins/undercounter-basins", image: "/images/sanware/basins/Undercounter%20Basins.png" },
  { label: "Freestanding Basins", href: "/product-category/sanitary-ware/basins/freestanding-basins", image: "/images/sanware/basins/Counter%20Top%20Basins.png" },
  { label: "Drop in Basins", href: "/product-category/sanitary-ware/basins/drop-in-basins", image: "/images/sanware/basins/Drop%20in%20Basins.png" },
  { label: "Semi-Recessed Basins", href: "/product-category/sanitary-ware/basins/semi-recessed-basins", image: "/images/sanware/basins/Semi-Recessed%20Basins.png" },
  { label: "Wall Hung Basins (Same as Handrinse Basins)", href: "/product-category/sanitary-ware/basins/wall-hung-basins", image: "/images/sanware/basins/Wall%20Hung%20Basin.png" },
  { label: "Pedestal Basins", href: "/product-category/sanitary-ware/basins/pedestal-basins", image: "/images/sanware/basins/Pedestal%20Basins.png" },
  { label: "Medical Basins", href: "/product-category/sanitary-ware/basins/medical-basins", image: "/images/sanware/basins/Medical%20Basins.png" },
  { label: "Cabinets (also Vanity)", href: "/product-category/sanitary-ware/basins/cabinets", image: "/images/sanware/basins/Cabinets.png" },
];

const SHOWER_BASE = "/product-category/sanitary-ware/showers";

const SHOWER_ITEMS = [
  {
    label: "Shower Roses (Shower Heads) + (Shower Heads + Arms)",
    slug: "shower-roses",
    href: `${SHOWER_BASE}/shower-roses`,
    image: "/images/sanware/shower/Shower%20Roses%20.png",
  },
  {
    label: "Shower Arms",
    slug: "shower-arms",
    href: `${SHOWER_BASE}/shower-arms`,
    image: "/images/sanware/shower/Shower%20Arms.png",
  },
  {
    label: "Shower Rails (Rail Sets) (Shower Bar)",
    slug: "shower-rails",
    href: `${SHOWER_BASE}/shower-rails`,
    image: "/images/sanware/shower/Shower%20Rails.png",
  },
  {
    label: "Shower Columns",
    slug: "shower-columns",
    href: `${SHOWER_BASE}/shower-columns`,
    image: "/images/sanware/shower/Shower%20Columns.png",
  },
  {
    label: "Shower Pipes",
    slug: "shower-pipes",
    href: `${SHOWER_BASE}/shower-pipes`,
    image: "/images/sanware/shower/Shower%20Pipes.png",
  },
  {
    label: "Hand Showers (Outlet and Bracket) + (Shower Hoses) + (Wall Outlets)",
    slug: "hand-showers",
    href: `${SHOWER_BASE}/hand-showers`,
    image: "/images/sanware/shower/Hand%20Showers.png",
  },
  {
    label: "Shower Glass",
    slug: "shower-glass",
    href: `${SHOWER_BASE}/shower-glass`,
    image: "/images/sanware/shower/Shower%20Screen.png",
    children: [
      { label: "Shower Screen", href: `${SHOWER_BASE}/shower-screen`, image: "/images/sanware/shower/Shower%20Screen.png" },
      { label: "Pivot Door", href: `${SHOWER_BASE}/pivot-door`, image: "/images/sanware/shower/Pivot%20Door.png" },
      { label: "Return Panel", href: `${SHOWER_BASE}/return-panel`, image: "/images/sanware/shower/Return%20Panel.png" },
      { label: "Tri Slider", href: `${SHOWER_BASE}/tri-slider`, image: "/images/sanware/shower/Tri%20Slider.png" },
      { label: "Bi Slider", href: `${SHOWER_BASE}/bi-slider`, image: "/images/sanware/shower/Bi%20Slider.png" },
      { label: "Bath Screen", href: `${SHOWER_BASE}/bath-screen`, image: "/images/sanware/shower/Bath%20Screen.png" },
      { label: "Telescopic Shower Door", href: `${SHOWER_BASE}/telescopic-shower-door`, image: "/images/sanware/shower/Telescopic%20Shower%20Door.png" },
      { label: "Mono Telescopic Shower Door", href: `${SHOWER_BASE}/mono-telescopic-shower-door`, image: "/images/sanware/shower/Mono%20Telescopic%20Shower%20Door.png" },
    ],
  },
  {
    label: "Shower Trays",
    slug: "shower-trays",
    href: `${SHOWER_BASE}/shower-trays`,
    image: "/images/sanware/shower/Shower%20Trays.png",
  },
  {
    label: "Shower Wall Panels",
    slug: "shower-wall-panels",
    href: `${SHOWER_BASE}/shower-wall-panels`,
    image: "/images/sanware/shower/shower%20wall%20panel.png",
  },
  {
    label: "Pet Friendly",
    slug: "pet-friendly",
    href: `${SHOWER_BASE}/pet-friendly`,
    image: "/images/sanware/shower/Pet%20Friendly.png",
  },
  {
    label: "Bidet Spray (Trigger Spray)",
    slug: "bidet-spray",
    href: `${SHOWER_BASE}/bidet-spray`,
    image: "/images/sanware/shower/Bidet%20Spray.png",
  },
];

const DOMESTIC_HOT_WATER_BASE = "/product-category/sanitary-ware/domestic-hot-water";

const DOMESTIC_HOT_WATER_ITEMS = [
  {
    label: "Heat Pumps",
    href: `${DOMESTIC_HOT_WATER_BASE}/heat-pumps`,
    image: "/images/sanware/domestic-hot-water/heatpump.png",
  },
  {
    label: "Instantaneous Water Heaters",
    href: `${DOMESTIC_HOT_WATER_BASE}/instantaneous-water-heaters`,
    image: "/images/sanware/domestic-hot-water/Instantaneous%20Water%20Heaters.png",
  },
];

const TAPWARE_BASE = "/product-category/sanitary-ware/mixers-and-taps";

const TAPWARE_ITEMS = [
  {
    label: "Mixers",
    slug: "mixers",
    href: `${TAPWARE_BASE}/mixers`,
    image: "/images/sanware/tapware/Mixers.png",
    children: [
      { label: "Basin Mixers", href: `${TAPWARE_BASE}/basin-mixers`, image: "/images/sanware/tapware/Mixers.png" },
      { label: "Concealed Mixers", href: `${TAPWARE_BASE}/concealed-mixers`, image: "/images/sanware/tapware/Concealed%20Mixers.png" },
      { label: "Concealed Diver Mixers", href: `${TAPWARE_BASE}/concealed-diver-mixers`, image: "/images/sanware/tapware/Concealed%20Diver%20Mixers.png" },
      { label: "Thermostatic Mixers", href: `${TAPWARE_BASE}/thermostatic-mixers`, image: "/images/sanware/tapware/Thermostatic%20Mixers.png" },
      { label: "Sink Mixers (Kitchen Mixers)", href: `${TAPWARE_BASE}/sink-mixers`, image: "/images/sanware/tapware/Sink%20Mixers%20.png" },
      { label: "Electronic Mixers", href: `${TAPWARE_BASE}/electronic-mixers`, image: "/images/sanware/tapware/Electronic%20Mixers%20copy.png" },
      { label: "Stop Taps", href: `${TAPWARE_BASE}/stop-taps`, image: "/images/sanware/tapware/-%20Stop%20Taps.png" },
      { label: "Bib Taps", href: `${TAPWARE_BASE}/bib-taps`, image: "/images/sanware/tapware/Bib%20Taps.png" },
      { label: "Pillar Taps", href: `${TAPWARE_BASE}/pillar-taps`, image: "/images/sanware/tapware/Pillar%20Taps.png" },
    ],
  },
  {
    label: "Spouts",
    slug: "spouts",
    href: `${TAPWARE_BASE}/spouts`,
    image: "/images/sanware/tapware/Basin%20Spouts.png",
    children: [
      { label: "Bath Spouts", href: `${TAPWARE_BASE}/bath-spouts`, image: "/images/sanware/tapware/Bath%20Spouts.png" },
      { label: "Basin Spouts", href: `${TAPWARE_BASE}/basin-spouts`, image: "/images/sanware/tapware/Basin%20Spouts.png" },
    ],
  },
  {
    label: "Wastes",
    slug: "wastes",
    href: `${TAPWARE_BASE}/wastes`,
    image: "/images/sanware/tapware/Basin%20Wastes.png",
    children: [
      { label: "Bath Wastes", href: `${TAPWARE_BASE}/bath-wastes`, image: "/images/sanware/tapware/Bath%20Wastes.png" },
      { label: "Basin Wastes", href: `${TAPWARE_BASE}/basin-wastes`, image: "/images/sanware/tapware/Basin%20Wastes.png" },
    ],
  },
  {
    label: "Valves",
    slug: "valves",
    href: `${TAPWARE_BASE}/valves`,
    image: "/images/sanware/tapware/Valves.png",
  },
  {
    label: "Traps",
    slug: "traps",
    href: `${TAPWARE_BASE}/traps`,
    image: "/images/sanware/tapware/Bottle%20Traps.png",
    children: [
      { label: "PVC Traps", href: `${TAPWARE_BASE}/pvc-traps`, image: "/images/sanware/tapware/PVC%20Traps.png" },
      { label: "Bottle Traps", href: `${TAPWARE_BASE}/bottle-traps`, image: "/images/sanware/tapware/Bottle%20Traps.png" },
      { label: "Shower Traps", href: `${TAPWARE_BASE}/shower-traps`, image: "/images/sanware/tapware/Shower%20Traps.png" },
      { label: "Shower Channels", href: `${TAPWARE_BASE}/shower-channels`, image: "/images/sanware/tapware/Shower%20Channelsss.png" },
    ],
  },
];

const KITCHEN_BASE = "/product-category/sanitary-ware/kitchen-sinks";

const KITCHEN_ITEMS = [
  {
    label: "Sink",
    slug: "sink",
    href: `${KITCHEN_BASE}/sink`,
    image: "/images/sanware/kitchen/Undermount%20Sinks.png",
    children: [
      { label: "Undermount Sinks", href: `${KITCHEN_BASE}/undermount-sinks`, image: "/images/sanware/kitchen/Undermount%20Sinks.png" },
      { label: "Drop in Sinks", href: `${KITCHEN_BASE}/drop-in-sinks`, image: "/images/sanware/kitchen/Drop%20in%20Sinks.png" },
    ],
  },
  {
    label: "Prep Bowl",
    slug: "prep-bowl",
    href: `${KITCHEN_BASE}/prep-bowl`,
    image: "/images/sanware/kitchen/undermount%20prep.png",
    children: [
      { label: "Undermount Sinks", href: `${KITCHEN_BASE}/prep-bowl-undermount-sinks`, image: "/images/sanware/kitchen/undermount%20prep.png" },
      { label: "Drop in Sink", href: `${KITCHEN_BASE}/prep-bowl-drop-in-sink`, image: "/images/sanware/kitchen/dropin%20prep.png" },
    ],
  },
  {
    label: "Butler Sinks",
    slug: "butler-sinks",
    href: `${KITCHEN_BASE}/butler-sinks`,
    image: "/images/sanware/kitchen/Butler%20Sinks.png",
  },
  {
    label: "Wash Trough",
    slug: "wash-trough",
    href: `${KITCHEN_BASE}/wash-trough`,
    image: "/images/sanware/kitchen/Wash%20trough.png",
  },
  {
    label: "Kitchen Mixers",
    slug: "kitchen-mixers",
    href: `${KITCHEN_BASE}/kitchen-mixers`,
    image: "/images/sanware/kitchen/Sink%20Mixers%20.png",
  },
  {
    label: "Waste Disposers",
    slug: "waste-disposers",
    href: `${KITCHEN_BASE}/waste-disposers`,
    image: "/images/sanware/kitchen/Waste%20Disposers.png",
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
    image: "/images/sanware/kitchen/Sink%20Wastes.png",
  },
  {
    label: "Water Filters",
    slug: "water-filters",
    href: `${KITCHEN_BASE}/water-filters`,
    image: "/images/sanware/kitchen/Water%20Filters.png",
  },
];

const BATH_ITEMS = [
  { label: "Freestanding Baths", href: "/product-category/sanitary-ware/baths/freestanding-baths", image: "/images/sanware/baths/Freestanding%20Baths.png" },
  { label: "Built In Baths", href: "/product-category/sanitary-ware/baths/built-in-baths", image: "/images/sanware/baths/Built%20In%20Baths.png" },
  { label: "Spa and Jacuzzi", href: "/product-category/sanitary-ware/baths/spa-and-jacuzzi", image: "/images/sanware/baths/Spa%20and%20Jacuzzi.png" },
];

const TOILET_BASE = "/product-category/sanitary-ware/toilets";

const TOILET_ITEMS = [
  {
    label: "Wall Hung Toilets",
    slug: "wall-hung-toilets",
    href: `${TOILET_BASE}/wall-hung-toilets`,
    image: "/images/sanware/toilets/Wall%20Hung%20Toilets.png",
  },
  {
    label: "Close Coupled Wall Hung Toilets",
    slug: "close-coupled-wall-hung-toilets",
    href: `${TOILET_BASE}/close-coupled-wall-hung-toilets`,
    image: "/images/sanware/toilets/Close%20Coupled%20Wall%20Hung%20Toilets.png",
  },
  {
    label: "Back to Wall Floor Mounted Toilets (Floor Mounted Pans)",
    slug: "back-to-wall-floor-mounted-toilets",
    href: `${TOILET_BASE}/back-to-wall-floor-mounted-toilets`,
    image: "/images/sanware/toilets/Back%20to%20Wall%20Floor%20Mounted%20Toilets%20_Floor%20Mounted%20Pan.png",
  },
  {
    label: "Close Coupled Toilets",
    slug: "close-coupled-toilets",
    href: `${TOILET_BASE}/close-coupled-toilets`,
    image: "/images/sanware/toilets/Back%20to%20Wall%20Closed%20Coupled%20Toilets.png",
    children: [
      {
        label: "Back to Wall Closed Coupled Toilets",
        href: `${TOILET_BASE}/back-to-wall-closed-coupled-toilets`,
        image: "/images/sanware/toilets/Back%20to%20Wall%20Closed%20Coupled%20Toilets.png",
      },
    ],
  },
  {
    label: "Accesible Toilets",
    slug: "accesible-toilets",
    href: `${TOILET_BASE}/accesible-toilets`,
    image: "/images/sanware/toilets/Accesible%20Toilets.png",
  },
  {
    label: "Shower Toilets",
    slug: "shower-toilets",
    href: `${TOILET_BASE}/shower-toilets`,
    image: "/images/sanware/toilets/Shower%20Toilets.png",
  },
  {
    label: "Aquaclean Toilets",
    slug: "aquaclean-toilets",
    href: `${TOILET_BASE}/aquaclean-toilets`,
    image: "/images/sanware/toilets/Aquaclean%20Toilets.png",
  },
  {
    label: "Toilet Seats",
    slug: "toilet-seats",
    href: `${TOILET_BASE}/toilet-seats`,
    image: "/images/sanware/toilets/Toilet%20Seats.png",
  },
  {
    label: "Concealed Systems",
    slug: "concealed-systems",
    href: `${TOILET_BASE}/concealed-systems`,
    image: "/images/sanware/toilets/Wall%20Hung%20Cisterns.png",
    children: [
      { label: "Wall Hung Cisterns", href: `${TOILET_BASE}/wall-hung-cisterns`, image: "/images/sanware/toilets/Wall%20Hung%20Cisterns.png" },
      { label: "Dry Wall Wall Hung Cisterns", href: `${TOILET_BASE}/dry-wall-wall-hung-cisterns`, image: "/images/sanware/toilets/Dry%20Wall%20Wall%20Hung%20Cisterns.png" },
      { label: "Floor Mount Cisterns", href: `${TOILET_BASE}/floor-mount-cisterns`, image: "/images/sanware/toilets/Floor%20Mount%20Cisterns.png" },
      { label: "Actuator Plates", href: `${TOILET_BASE}/actuator-plates`, image: "/images/sanware/toilets/Actuator%20Plates.png" },
    ],
  },
  {
    label: "Urinals",
    slug: "urinals",
    href: `${TOILET_BASE}/urinals`,
    image: "/images/sanware/toilets/Back%20Entry%20Urinal.png",
    children: [
      { label: "Back Entry Urinal", href: `${TOILET_BASE}/back-entry-urinal`, image: "/images/sanware/toilets/Back%20Entry%20Urinal.png" },
      { label: "Top Entry Urinal", href: `${TOILET_BASE}/top-entry-urinal`, image: "/images/sanware/toilets/Top%20Entry%20Urinal.png" },
      { label: "Electronic Urinal", href: `${TOILET_BASE}/electronic-urinal`, image: "/images/sanware/toilets/Electronic%20Urinal.png" },
      { label: "Waterless Urinal", href: `${TOILET_BASE}/waterless-urinal`, image: "/images/sanware/toilets/Waterless%20Urinal.png" },
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
      src={item.image || "/images/product_ph.png"}
      alt={item.label}
      className="w-full aspect-[4/3] object-contain rounded-lg"
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
                perPage: 7,
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
                  768: { perPage: 2 },
                  1024: { perPage: 4 },
                  1280: { perPage: 6 },
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
