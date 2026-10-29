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
    image: "/images/sanware/new-bathroom-accessories/Toilet%20Roll%20Holder%20-%20transparent%20darker.png",
    children: [
      { label: "Toilet Roll Holder", href: `${BATHROOM_ACCESSORY_BASE}/toilet-roll-holder`, image: "/images/sanware/new-bathroom-accessories/Toilet%20Roll%20Holder%20-%20transparent%20darker.png" },
      { label: "Toilet Brush and Holder (Toilet Brush) + (Toilet Holder)", href: `${BATHROOM_ACCESSORY_BASE}/toilet-brush-and-holder`, image: "/images/sanware/new-bathroom-accessories/technical_isometric_toilet_brush_holder_sketch.png" },
      { label: "Spare Toilet Roll Holder", href: `${BATHROOM_ACCESSORY_BASE}/spare-toilet-roll-holder`, image: "/images/sanware/new-bathroom-accessories/technical_sketch_of_a_modern_toilet_paper_holder.png" },
      { label: "Sanitary Bag Holder", href: `${BATHROOM_ACCESSORY_BASE}/sanitary-bag-holder`, image: "/images/sanware/new-bathroom-accessories/Sanitary%20Bag%20Holder%20-%20transparent%20darker.png" },
      { label: "Watse Bin", href: `${BATHROOM_ACCESSORY_BASE}/watse-bin`, image: "/images/sanware/new-bathroom-accessories/technical_sketch_of_wall_mounted_dispenser.png" },
    ],
  },
  {
    label: "Basin Accessories",
    slug: "basin-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/basin-accessories`,
    image: "/images/sanware/new-bathroom-accessories/Basin%20Accessories%20-%20transparent%20darker.png",
    children: [
      { label: "Towel Rings", href: `${BATHROOM_ACCESSORY_BASE}/towel-rings`, image: "/images/sanware/new-bathroom-accessories/Towel%20Rings(1)%20-%20transparent%20darker.png" },
      { label: "Toothbrush Holder", href: `${BATHROOM_ACCESSORY_BASE}/toothbrush-holder`, image: "/images/sanware/new-bathroom-accessories/Toothbrush%20Holder%20-%20transparent%20darker.png" },
      { label: "Tissue Holder", href: `${BATHROOM_ACCESSORY_BASE}/tissue-holder`, image: "/images/sanware/new-bathroom-accessories/Tissue%20Holder%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Shower and Bath Accessories",
    slug: "shower-and-bath-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/shower-and-bath-accessories`,
    image: "/images/sanware/new-bathroom-accessories/shower%20rack%20-%20transparent%20darker.png",
    children: [
      { label: "Shower Racks (Shower Caddies)", href: `${BATHROOM_ACCESSORY_BASE}/shower-racks`, image: "/images/sanware/new-bathroom-accessories/shower%20rack%20-%20transparent%20darker.png" },
      { label: "Glass Shelves", href: `${BATHROOM_ACCESSORY_BASE}/glass-shelves`, image: "/images/sanware/new-bathroom-accessories/Glass%20Shelves%20-%20transparent%20darker.png" },
      { label: "Shower Seats", href: `${BATHROOM_ACCESSORY_BASE}/shower-seats`, image: "/images/sanware/new-bathroom-accessories/technical_folding_wall_shelf_sketch.png" },
      { label: "Shower Door Accessories", href: `${BATHROOM_ACCESSORY_BASE}/shower-door-accessories`, image: "/images/sanware/new-bathroom-accessories/isometric_hinge_bracket_technical_sketch.png" },
      { label: "Towel Rails", href: `${BATHROOM_ACCESSORY_BASE}/towel-rails`, image: "/images/sanware/new-bathroom-accessories/Towel%20Rails%20-%20transparent%20darker.png" },
      { label: "Robe Hooks", href: `${BATHROOM_ACCESSORY_BASE}/robe-hooks`, image: "/images/sanware/new-bathroom-accessories/Robe%20Hooks%20-%20transparent%20darker.png" },
      { label: "Shower Filters", href: `${BATHROOM_ACCESSORY_BASE}/shower-filters`, image: "/images/sanware/new-bathroom-accessories/technical_cylindrical_component_sketch.png" },
    ],
  },
  {
    label: "Soap Holder",
    slug: "soap-holder",
    href: `${BATHROOM_ACCESSORY_BASE}/soap-holder`,
    image: "/images/sanware/new-bathroom-accessories/soap%20holder%20-%20transparent%20darker.png",
  },
  {
    label: "Heated Towel Rails",
    slug: "heated-towel-rails",
    href: `${BATHROOM_ACCESSORY_BASE}/heated-towel-rails`,
    image: "/images/sanware/new-bathroom-accessories/heated%20towel%20rail%20-%20transparent%20darker.png",
  },
  {
    label: "Mirrors",
    slug: "mirrors",
    href: `${BATHROOM_ACCESSORY_BASE}/mirrors`,
    image: "/images/sanware/new-bathroom-accessories/mirror%20-%20transparent%20darker.png",
  },
  {
    label: "Commercial Accessories",
    slug: "commercial-accessories",
    href: `${BATHROOM_ACCESSORY_BASE}/commercial-accessories`,
    image: "/images/sanware/new-bathroom-accessories/handdryer%20-%20transparent%20darker.png",
    children: [
      { label: "Hand Dryers", href: `${BATHROOM_ACCESSORY_BASE}/hand-dryers`, image: "/images/sanware/new-bathroom-accessories/handdryer%20-%20transparent%20darker.png" },
      { label: "Toilet Roll Dispenser", href: `${BATHROOM_ACCESSORY_BASE}/toilet-roll-dispenser`, image: "/images/sanware/new-bathroom-accessories/Toilet%20Roll%20Holder%20-%20transparent%20darker.png" },
      { label: "Sanitary Bins", href: `${BATHROOM_ACCESSORY_BASE}/sanitary-bins`, image: "/images/sanware/new-bathroom-accessories/technical_sketch_of_wall_mounted_dispenser.png" },
      { label: "Soap Dispensers", href: `${BATHROOM_ACCESSORY_BASE}/soap-dispensers`, image: "/images/sanware/new-bathroom-accessories/Soap%20Dispensers%20-%20transparent%20darker.png" },
      { label: "Paper Towel Dispenser", href: `${BATHROOM_ACCESSORY_BASE}/paper-towel-dispenser`, image: "/images/sanware/new-bathroom-accessories/Paper%20Towel%20Dispenser%20-%20transparent%20darker.png" },
      { label: "Wall Bin", href: `${BATHROOM_ACCESSORY_BASE}/wall-bin`, image: "/images/sanware/new-bathroom-accessories/wall%20bin%20-%20transparent%20darker.png" },
      { label: "Grab Rails", href: `${BATHROOM_ACCESSORY_BASE}/grab-rails`, image: "/images/sanware/new-bathroom-accessories/grab%20rail%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Room Heating",
    slug: "room-heating",
    href: `${BATHROOM_ACCESSORY_BASE}/room-heating`,
  },
];

const BASIN_ITEMS = [
  { label: "Counter Top Basins", href: "/product-category/sanitary-ware/basins/counter-top-basins", image: "/images/sanware/new-basins/Counter%20Top%20Basins%20-%20transparent%20darker.png" },
  { label: "Undercounter Basins (Underslung Basin)", href: "/product-category/sanitary-ware/basins/undercounter-basins", image: "/images/sanware/new-basins/Undercounter%20Basins%20-%20transparent%20darker.png" },
  { label: "Freestanding Basins", href: "/product-category/sanitary-ware/basins/freestanding-basins", image: "/images/sanware/new-basins/Counter%20Top%20Basins%20-%20transparent%20darker.png" },
  { label: "Drop in Basins", href: "/product-category/sanitary-ware/basins/drop-in-basins", image: "/images/sanware/new-basins/Drop%20in%20Basins(1)%20-%20transparent%20darker.png" },
  { label: "Semi-Recessed Basins", href: "/product-category/sanitary-ware/basins/semi-recessed-basins", image: "/images/sanware/new-basins/Semi-Recessed%20Basins%20-%20transparent%20darker.png" },
  { label: "Wall Hung Basins (Same as Handrinse Basins)", href: "/product-category/sanitary-ware/basins/wall-hung-basins", image: "/images/sanware/new-basins/Wall%20Hung%20Basin(1)%20-%20transparent%20darker.png" },
  { label: "Pedestal Basins", href: "/product-category/sanitary-ware/basins/pedestal-basins", image: "/images/sanware/new-basins/Pedestal%20Basins(1)%20-%20transparent%20darker.png" },
  { label: "Medical Basins", href: "/product-category/sanitary-ware/basins/medical-basins", image: "/images/sanware/new-basins/Medical%20Basins(1)%20-%20transparent%20darker.png" },
  { label: "Cabinets (also Vanity)", href: "/product-category/sanitary-ware/basins/cabinets", image: "/images/sanware/new-basins/Cabinets%20-%20transparent%20darker.png" },
];

const SHOWER_BASE = "/product-category/sanitary-ware/showers";

const SHOWER_ITEMS = [
  {
    label: "Shower Roses (Shower Heads) + (Shower Heads + Arms)",
    slug: "shower-roses",
    href: `${SHOWER_BASE}/shower-roses`,
    image: "/images/sanware/new-shower/Shower%20Roses%20-%20transparent%20darker.png",
  },
  {
    label: "Shower Arms",
    slug: "shower-arms",
    href: `${SHOWER_BASE}/shower-arms`,
    image: "/images/sanware/new-shower/Shower%20Arms%20-%20transparent%20darker.png",
  },
  {
    label: "Shower Rails (Rail Sets) (Shower Bar)",
    slug: "shower-rails",
    href: `${SHOWER_BASE}/shower-rails`,
    image: "/images/sanware/new-shower/Shower%20Rails%20-%20transparent%20darker.png",
  },
  {
    label: "Shower Columns",
    slug: "shower-columns",
    href: `${SHOWER_BASE}/shower-columns`,
    image: "/images/sanware/new-shower/Shower%20Columns%20-%20transparent%20darker.png",
  },
  {
    label: "Shower Pipes",
    slug: "shower-pipes",
    href: `${SHOWER_BASE}/shower-pipes`,
    image: "/images/sanware/new-shower/Shower%20Pipes%20-%20transparent%20darker.png",
  },
  {
    label: "Hand Showers (Outlet and Bracket) + (Shower Hoses) + (Wall Outlets)",
    slug: "hand-showers",
    href: `${SHOWER_BASE}/hand-showers`,
    image: "/images/sanware/new-shower/Hand%20Showers%20-%20transparent%20darker.png",
  },
  {
    label: "Shower Glass",
    slug: "shower-glass",
    href: `${SHOWER_BASE}/shower-glass`,
    image: "/images/sanware/new-shower/Shower%20Screen%20-%20transparent%20darker.png",
    children: [
      { label: "Shower Screen", href: `${SHOWER_BASE}/shower-screen`, image: "/images/sanware/new-shower/Shower%20Screen%20-%20transparent%20darker.png" },
      { label: "Pivot Door", href: `${SHOWER_BASE}/pivot-door`, image: "/images/sanware/new-shower/Pivot%20Door%20-%20transparent%20darker.png" },
      { label: "Return Panel", href: `${SHOWER_BASE}/return-panel`, image: "/images/sanware/new-shower/Return%20Panel%20-%20transparent%20darker.png" },
      { label: "Tri Slider", href: `${SHOWER_BASE}/tri-slider`, image: "/images/sanware/new-shower/Tri%20Slider%20-%20transparent%20darker.png" },
      { label: "Bi Slider", href: `${SHOWER_BASE}/bi-slider`, image: "/images/sanware/new-shower/Bi%20Slider%20-%20transparent%20darker.png" },
      { label: "Bath Screen", href: `${SHOWER_BASE}/bath-screen`, image: "/images/sanware/new-shower/Bath%20Screen%20-%20transparent%20darker.png" },
      { label: "Telescopic Shower Door", href: `${SHOWER_BASE}/telescopic-shower-door`, image: "/images/sanware/new-shower/Telescopic%20Shower%20Door%20-%20transparent%20darker.png" },
      { label: "Mono Telescopic Shower Door", href: `${SHOWER_BASE}/mono-telescopic-shower-door`, image: "/images/sanware/new-shower/Mono%20Telescopic%20Shower%20Door%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Shower Trays",
    slug: "shower-trays",
    href: `${SHOWER_BASE}/shower-trays`,
    image: "/images/sanware/new-shower/Shower%20Trays%20-%20transparent%20darker.png",
  },
  {
    label: "Shower Wall Panels",
    slug: "shower-wall-panels",
    href: `${SHOWER_BASE}/shower-wall-panels`,
    image: "/images/sanware/new-shower/shower%20wall%20panel%20-%20transparent%20darker.png",
  },
  {
    label: "Pet Friendly",
    slug: "pet-friendly",
    href: `${SHOWER_BASE}/pet-friendly`,
    image: "/images/sanware/new-shower/Pet%20Friendly%20-%20transparent%20darker.png",
  },
  {
    label: "Bidet Spray (Trigger Spray)",
    slug: "bidet-spray",
    href: `${SHOWER_BASE}/bidet-spray`,
    image: "/images/sanware/new-shower/Bidet%20Spray%20-%20transparent%20darker.png",
  },
];

const DOMESTIC_HOT_WATER_BASE = "/product-category/sanitary-ware/domestic-hot-water";

const DOMESTIC_HOT_WATER_ITEMS = [
  {
    label: "Heat Pumps",
    href: `${DOMESTIC_HOT_WATER_BASE}/heat-pumps`,
    image: "/images/sanware/new-domestic-hot-water/heatpump%20-%20transparent%20darker.png",
  },
  {
    label: "Instantaneous Water Heaters",
    href: `${DOMESTIC_HOT_WATER_BASE}/instantaneous-water-heaters`,
    image: "/images/sanware/new-domestic-hot-water/Instantaneous%20Water%20Heaters%20-%20transparent%20darker.png",
  },
];

const TAPWARE_BASE = "/product-category/sanitary-ware/mixers-and-taps";

const TAPWARE_ITEMS = [
  {
    label: "Mixers",
    slug: "mixers",
    href: `${TAPWARE_BASE}/mixers`,
    image: "/images/sanware/new-tapware/Mixers%20-%20transparent%20darker.png",
    children: [
      { label: "Basin Mixers", href: `${TAPWARE_BASE}/basin-mixers`, image: "/images/sanware/new-tapware/Mixers%20-%20transparent%20darker.png" },
      { label: "Concealed Mixers", href: `${TAPWARE_BASE}/concealed-mixers`, image: "/images/sanware/new-tapware/Concealed%20Mixers%20-%20transparent%20darker.png" },
      { label: "Concealed Diver Mixers", href: `${TAPWARE_BASE}/concealed-diver-mixers`, image: "/images/sanware/new-tapware/Concealed%20Diver%20Mixers%20-%20transparent%20darker.png" },
      { label: "Thermostatic Mixers", href: `${TAPWARE_BASE}/thermostatic-mixers`, image: "/images/sanware/new-tapware/Thermostatic%20Mixers%20-%20transparent%20darker.png" },
      { label: "Sink Mixers (Kitchen Mixers)", href: `${TAPWARE_BASE}/sink-mixers`, image: "/images/sanware/new-tapware/Sink%20Mixers%20-%20transparent%20darker.png" },
      { label: "Electronic Mixers", href: `${TAPWARE_BASE}/electronic-mixers`, image: "/images/sanware/new-tapware/Electronic%20Mixers%20copy%20-%20transparent%20darker.png" },
      { label: "Stop Taps", href: `${TAPWARE_BASE}/stop-taps`, image: "/images/sanware/new-tapware/-%20Stop%20Taps%20-%20transparent%20darker.png" },
      { label: "Bib Taps", href: `${TAPWARE_BASE}/bib-taps`, image: "/images/sanware/new-tapware/Bib%20Taps%20-%20transparent%20darker.png" },
      { label: "Pillar Taps", href: `${TAPWARE_BASE}/pillar-taps`, image: "/images/sanware/new-tapware/Pillar%20Taps%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Spouts",
    slug: "spouts",
    href: `${TAPWARE_BASE}/spouts`,
    image: "/images/sanware/new-tapware/Basin%20Spouts%20-%20transparent%20darker.png",
    children: [
      { label: "Bath Spouts", href: `${TAPWARE_BASE}/bath-spouts`, image: "/images/sanware/new-tapware/Bath%20Spouts%20-%20transparent%20darker.png" },
      { label: "Basin Spouts", href: `${TAPWARE_BASE}/basin-spouts`, image: "/images/sanware/new-tapware/Basin%20Spouts%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Wastes",
    slug: "wastes",
    href: `${TAPWARE_BASE}/wastes`,
    image: "/images/sanware/new-tapware/Basin%20Wastes%20-%20transparent%20darker.png",
    children: [
      { label: "Bath Wastes", href: `${TAPWARE_BASE}/bath-wastes`, image: "/images/sanware/new-tapware/Bath%20Wastes%20-%20transparent%20darker.png" },
      { label: "Basin Wastes", href: `${TAPWARE_BASE}/basin-wastes`, image: "/images/sanware/new-tapware/Basin%20Wastes%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Valves",
    slug: "valves",
    href: `${TAPWARE_BASE}/valves`,
    image: "/images/sanware/new-tapware/Valves%20-%20transparent%20darker.png",
  },
  {
    label: "Traps",
    slug: "traps",
    href: `${TAPWARE_BASE}/traps`,
    image: "/images/sanware/new-tapware/Bottle%20Traps%20-%20transparent%20darker.png",
    children: [
      { label: "PVC Traps", href: `${TAPWARE_BASE}/pvc-traps`, image: "/images/sanware/new-tapware/PVC%20Traps%20-%20transparent%20darker.png" },
      { label: "Bottle Traps", href: `${TAPWARE_BASE}/bottle-traps`, image: "/images/sanware/new-tapware/Bottle%20Traps%20-%20transparent%20darker.png" },
      { label: "Shower Traps", href: `${TAPWARE_BASE}/shower-traps`, image: "/images/sanware/new-tapware/Shower%20Traps%20-%20transparent%20darker.png" },
      { label: "Shower Channels", href: `${TAPWARE_BASE}/shower-channels`, image: "/images/sanware/new-tapware/Shower%20Channelsss%20-%20transparent%20darker.png" },
    ],
  },
];

const KITCHEN_BASE = "/product-category/sanitary-ware/kitchen-sinks";

const KITCHEN_ITEMS = [
  {
    label: "Sink",
    slug: "sink",
    href: `${KITCHEN_BASE}/sink`,
    image: "/images/sanware/new-kitchen/Undermount%20Sinks%20-%20transparent%20darker.png",
    children: [
      { label: "Undermount Sinks", href: `${KITCHEN_BASE}/undermount-sinks`, image: "/images/sanware/new-kitchen/Undermount%20Sinks%20-%20transparent%20darker.png" },
      { label: "Drop in Sinks", href: `${KITCHEN_BASE}/drop-in-sinks`, image: "/images/sanware/new-kitchen/Drop%20in%20Sinks%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Prep Bowl",
    slug: "prep-bowl",
    href: `${KITCHEN_BASE}/prep-bowl`,
    image: "/images/sanware/new-kitchen/undermount%20prep%20-%20transparent%20darker.png",
    children: [
      { label: "Undermount Sinks", href: `${KITCHEN_BASE}/prep-bowl-undermount-sinks`, image: "/images/sanware/new-kitchen/undermount%20prep%20-%20transparent%20darker.png" },
      { label: "Drop in Sink", href: `${KITCHEN_BASE}/prep-bowl-drop-in-sink`, image: "/images/sanware/new-kitchen/dropin%20prep%20-%20transparent%20darker.png" },
    ],
  },
  {
    label: "Butler Sinks",
    slug: "butler-sinks",
    href: `${KITCHEN_BASE}/butler-sinks`,
    image: "/images/sanware/new-kitchen/Butler%20Sinks%20-%20transparent%20darker.png",
  },
  {
    label: "Wash Trough",
    slug: "wash-trough",
    href: `${KITCHEN_BASE}/wash-trough`,
    image: "/images/sanware/new-kitchen/Wash%20trough%20-%20transparent%20darker.png",
  },
  {
    label: "Kitchen Mixers",
    slug: "kitchen-mixers",
    href: `${KITCHEN_BASE}/kitchen-mixers`,
    image: "/images/sanware/new-tapware/Sink%20Mixers%20-%20transparent%20darker.png",
  },
  {
    label: "Waste Disposers",
    slug: "waste-disposers",
    href: `${KITCHEN_BASE}/waste-disposers`,
    image: "/images/sanware/new-kitchen/Waste%20Disposers%20-%20transparent%20darker.png",
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
    image: "/images/sanware/new-kitchen/Sink%20Wastes%20-%20transparent%20darker.png",
  },
  {
    label: "Water Filters",
    slug: "water-filters",
    href: `${KITCHEN_BASE}/water-filters`,
    image: "/images/sanware/new-kitchen/Water%20Filters%20-%20transparent%20darker.png",
  },
];

const BATH_ITEMS = [
  { label: "Freestanding Baths", href: "/product-category/sanitary-ware/baths/freestanding-baths", image: "/images/sanware/new-bath/Freestanding%20Baths%20-%20transparent%20darker.png" },
  { label: "Built In Baths", href: "/product-category/sanitary-ware/baths/built-in-baths", image: "/images/sanware/new-bath/Built%20In%20Baths%20-%20transparent%20darker.png" },
  { label: "Spa and Jacuzzi", href: "/product-category/sanitary-ware/baths/spa-and-jacuzzi", image: "/images/sanware/new-bath/Spa%20and%20Jacuzzi%20-%20transparent%20darker.png" },
];

const TOILET_BASE = "/product-category/sanitary-ware/toilets";

const TOILET_ITEMS = [
  {
    label: "Wall Hung Toilets",
    slug: "wall-hung-toilets",
    href: `${TOILET_BASE}/wall-hung-toilets`,
    image: "/images/sanware/new-toilets/Wall%20Hung%20Toilets%20-%20transparent%20darker.png",
  },
  {
    label: "Close Coupled Wall Hung Toilets",
    slug: "close-coupled-wall-hung-toilets",
    href: `${TOILET_BASE}/close-coupled-wall-hung-toilets`,
    image: "/images/sanware/new-toilets/Close%20Coupled%20Wall%20Hung%20Toilets%20-%20transparent%20darker.png",
  },
  {
    label: "Back to Wall Floor Mounted Toilets (Floor Mounted Pans)",
    slug: "back-to-wall-floor-mounted-toilets",
    href: `${TOILET_BASE}/back-to-wall-floor-mounted-toilets`,
    image: "/images/sanware/new-toilets/Back%20to%20Wall%20Floor%20Mounted%20Toilets%20_Floor%20Mounted%20Pan%20-%20transparent%20darker.png",
  },
  {
    label: "Close Coupled Toilets",
    slug: "close-coupled-toilets",
    href: `${TOILET_BASE}/close-coupled-toilets`,
    image: "/images/sanware/new-toilets/Back%20to%20Wall%20Closed%20Coupled%20Toilets%20-%20transparent%20darker.png",
    children: [
      {
        label: "Back to Wall Closed Coupled Toilets",
        href: `${TOILET_BASE}/back-to-wall-closed-coupled-toilets`,
        image: "/images/sanware/new-toilets/Back%20to%20Wall%20Closed%20Coupled%20Toilets%20-%20transparent%20darker.png",
      },
    ],
  },
  {
    label: "Accesible Toilets",
    slug: "accesible-toilets",
    href: `${TOILET_BASE}/accesible-toilets`,
    image: "/images/sanware/new-toilets/ChatGPT%20Image%20Sep%2025,%202026,%2002_14_16%20PM%20(1).png",
  },
  {
    label: "Shower Toilets",
    slug: "shower-toilets",
    href: `${TOILET_BASE}/shower-toilets`,
    image: "/images/sanware/new-toilets/Shower%20Toilets%20-%20transparent%20darker.png",
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
    image: "/images/sanware/new-toilets/Toilet%20Seats%20-%20transparent%20darker.png",
  },
  {
    label: "Concealed Systems",
    slug: "concealed-systems",
    href: `${TOILET_BASE}/concealed-systems`,
    image: "/images/sanware/new-toilets/Wall%20Hung%20Cisterns%20-%20transparent%20darker.png",
    children: [
      { label: "Wall Hung Cisterns", href: `${TOILET_BASE}/wall-hung-cisterns`, image: "/images/sanware/new-toilets/Wall%20Hung%20Cisterns%20-%20transparent%20darker.png" },
      { label: "Dry Wall Wall Hung Cisterns", href: `${TOILET_BASE}/dry-wall-wall-hung-cisterns`, image: "/images/sanware/new-toilets/Dry%20Wall%20Wall%20Hung%20Cisterns%20-%20transparent%20darker.png" },
      { label: "Floor Mount Cisterns", href: `${TOILET_BASE}/floor-mount-cisterns`, image: "/images/sanware/new-toilets/Floor%20Mount%20Cisterns%20-%20transparent%20darker.png" },
      { label: "Actuator Plates", href: `${TOILET_BASE}/actuator-plates`, image: "/images/sanware/new-toilets/ChatGPT%20Image%20Sep%2025,%202026,%2002_14_16%20PM%20(2).png" },
    ],
  },
  {
    label: "Urinals",
    slug: "urinals",
    href: `${TOILET_BASE}/urinals`,
    image: "/images/sanware/new-toilets/ChatGPT%20Image%20Sep%2025,%202026,%2002_14_17%20PM%20(4).png",
    children: [
      { label: "Back Entry Urinal", href: `${TOILET_BASE}/back-entry-urinal`, image: "/images/sanware/new-toilets/ChatGPT%20Image%20Sep%2025,%202026,%2002_14_17%20PM%20(4).png" },
      { label: "Top Entry Urinal", href: `${TOILET_BASE}/top-entry-urinal`, image: "/images/sanware/new-toilets/Top%20Entry%20Urinal%20-%20transparent%20darker.png" },
      { label: "Electronic Urinal", href: `${TOILET_BASE}/electronic-urinal`, image: "/images/sanware/new-toilets/Electronic%20Urinal%20-%20transparent%20darker.png" },
      { label: "Waterless Urinal", href: `${TOILET_BASE}/waterless-urinal`, image: "/images/sanware/new-toilets/Waterless%20Urinal%20-%20transparent%20darker.png" },
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
