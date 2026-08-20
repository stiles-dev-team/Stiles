import {
  Bath,
  CookingPot,
  TreePine,
  Home,
  Building2,
  PanelTop,
  Package,
  Droplets,
  SprayCan,
  LayoutGrid,
} from "lucide-react";

const BASE = "/product-category/tiles/large-slab";

export const LARGE_SLABS_MEGA_MENU = [
  {
    title: "Large slabs by look",
    itemType: "look",
    items: [
      { label: "Brick Look", href: `${BASE}/brick`, swatch: "bg-gradient-to-br from-red-900 via-red-700 to-red-500" },
      { label: "Wood", href: `${BASE}/wood-design`, swatch: "bg-gradient-to-br from-amber-800 via-amber-600 to-amber-400" },
      { label: "Stone", href: `${BASE}/stone-design`, swatch: "bg-stone-500" },
      { label: "Marble", href: `${BASE}/marble-design`, swatch: "bg-gradient-to-br from-gray-200 via-white to-gray-400" },
      { label: "Cement", href: `${BASE}/concrete-cement-design`, swatch: "bg-gray-400" },
      { label: "Terrazzo", href: `${BASE}/terrazzo-design`, swatch: "bg-[radial-gradient(circle,#666_1px,transparent_1px)] bg-[length:4px_4px] bg-gray-200" },
      { label: "Patterned", href: `${BASE}/patterned`, swatch: "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[length:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0px] bg-gray-100" },
      { label: "Minimalistic", href: `${BASE}/minimalist-design`, swatch: "bg-gradient-to-br from-gray-100 to-gray-300" },
      { label: "Handmade", href: `${BASE}/decor-tiles`, swatch: "bg-gradient-to-br from-amber-700 via-orange-300 to-amber-900" },
    ],
  },
  {
    title: "Large slabs by colour",
    itemType: "colour",
    items: [
      { label: "Grey", href: `${BASE}/grey`, swatch: "bg-gray-400" },
      { label: "Black", href: `${BASE}/black`, swatch: "bg-black" },
      { label: "Green", href: `${BASE}/green`, swatch: "bg-green-600" },
      { label: "Blue", href: `${BASE}/blue`, swatch: "bg-blue-600" },
      { label: "Pink", href: `${BASE}/pink`, swatch: "bg-pink-400" },
      { label: "Brown", href: `${BASE}/brown`, swatch: "bg-[#6b4423]" },
      { label: "Beige", href: `${BASE}/beige`, swatch: "bg-[#d4b896]" },
      { label: "Cream", href: `${BASE}/cream`, swatch: "bg-[#f5f5dc] border border-gray-300" },
      { label: "White", href: `${BASE}/white`, swatch: "bg-white border border-gray-300" },
      { label: "Red", href: `${BASE}/red`, swatch: "bg-red-600" },
      { label: "Sand", href: `${BASE}/sand`, swatch: "bg-[#c2b280]" },
      { label: "Gold", href: `${BASE}/gold`, swatch: "bg-[#d4af37]" },
      { label: "Purple", href: `${BASE}/purple`, swatch: "bg-purple-600" },
      { label: "Yellow", href: `${BASE}/yellow`, swatch: "bg-yellow-400" },
      { label: "Orange", href: `${BASE}/orange`, swatch: "bg-orange-500" },
    ],
  },
  {
    title: "Large slabs by size",
    itemType: "size",
    items: [
      { label: "", href: `${BASE}?sizes=1200%20x%202400`, dimension: "1200×2400" },
      { label: "", href: `${BASE}?sizes=1200%20x%202800`, dimension: "1200×2800" },
      { label: "", href: `${BASE}?sizes=1600%20x%203200`, dimension: "1600×3200" },
    ],
  },
  {
    title: "Large slabs by space",
    itemType: "icon",
    items: [
      { label: "Kitchen", href: `${BASE}/kitchen`, icon: CookingPot },
      { label: "Bathroom", href: `${BASE}/bathroom`, icon: Bath },
      { label: "Indoor", href: `${BASE}/indoor`, icon: Home },
      { label: "Outdoor Walls", href: `${BASE}/outdoor-walls`, icon: TreePine },
      { label: "Commercial", href: `${BASE}/commercial`, icon: Building2 },
      { label: "Countertop", href: `${BASE}/countertop`, icon: PanelTop },
    ],
  },
  {
    title: "Installation needs",
    itemType: "icon",
    items: [
      { label: "Adhesives", href: "/product-category/tiles/accessories-tools/tile-adhesive-porcelain", icon: Package },
      { label: "Grouts", href: "/product-category/tiles/accessories-tools/grout", icon: Droplets },
      { label: "Skirtings & Edgings", href: "/product-category/tiles/accessories-tools/trim", icon: PanelTop },
      { label: "Cleaning Products & Chemicals", href: "/product-category/tiles/accessories-tools/cleaning-product", icon: SprayCan, className: "col-start-1" },
      { label: "Spacers", href: "/product-category/tiles/accessories-tools/tile-spacer", icon: LayoutGrid, className: "col-start-2" },
    ],
  },
];
