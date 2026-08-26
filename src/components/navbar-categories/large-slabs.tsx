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
    title: "Large slabs by Look",
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
    title: "Large slabs by Colour",
    itemType: "colour",
    items: [
      { label: "Grey", href: `${BASE}?colours=grey`, swatch: "bg-gray-400" },
      { label: "Black", href: `${BASE}?colours=black`, swatch: "bg-black" },
      { label: "Green", href: `${BASE}?colours=green`, swatch: "bg-green-600" },
      { label: "Blue", href: `${BASE}?colours=blue`, swatch: "bg-blue-600" },
      { label: "Pink", href: `${BASE}?colours=pink`, swatch: "bg-pink-400" },
      { label: "Brown", href: `${BASE}?colours=brown`, swatch: "bg-[#6b4423]" },
      { label: "Beige", href: `${BASE}?colours=beige`, swatch: "bg-[#d4b896]" },
      { label: "Cream", href: `${BASE}?colours=cream`, swatch: "bg-[#f5f5dc] border border-gray-300" },
      { label: "White", href: `${BASE}?colours=white`, swatch: "bg-white border border-gray-300" },
      { label: "Red", href: `${BASE}?colours=red`, swatch: "bg-red-600" },
      { label: "Sand", href: `${BASE}?colours=sand`, swatch: "bg-[#c2b280]" },
      { label: "Gold", href: `${BASE}?colours=gold`, swatch: "bg-[#d4af37]" },
      { label: "Purple", href: `${BASE}?colours=purple`, swatch: "bg-purple-600" },
      { label: "Yellow", href: `${BASE}?colours=yellow`, swatch: "bg-yellow-400" },
      { label: "Orange", href: `${BASE}?colours=orange`, swatch: "bg-orange-500" },
    ],
  },
  {
    title: "Large slabs by Size",
    itemType: "size",
    items: [
      { label: "", href: `${BASE}?sizes=1200%20x%202400`, dimension: "1200×2400" },
      { label: "", href: `${BASE}?sizes=1200%20x%202800`, dimension: "1200×2800" },
      { label: "", href: `${BASE}?sizes=1600%20x%203200`, dimension: "1600×3200" },
    ],
  },
  {
    title: "Large slabs by Space",
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
  // {
  //   title: "Installation Needs",
  //   itemType: "icon",
  //   items: [
  //     { label: "Adhesives", href: "/product-category/tiles/accessories-tools/tile-adhesive-porcelain", icon: Package },
  //     { label: "Grouts", href: "/product-category/tiles/accessories-tools/grout", icon: Droplets },
  //     { label: "Trims and Edges", href: "/product-category/tiles/accessories-tools/trim", icon: PanelTop },
  //     { label: "Tools and Spacers", href: "/product-category/tiles/accessories-tools/tile-spacer", icon: LayoutGrid },
  //     { label: "Cleaning Products and Chemicals", href: "/product-category/tiles/accessories-tools/cleaning-product", icon: SprayCan },
  //   ],
  // },
];
