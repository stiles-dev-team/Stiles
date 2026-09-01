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
      { label: "Brick Look", href: `${BASE}/brick`, image: "/images/menu-look/brick.png" },
      { label: "Wood", href: `${BASE}/wood-design`, image: "/images/menu-look/wood.png" },
      { label: "Stone", href: `${BASE}/stone-design`, image: "/images/menu-look/stone.png" },
      { label: "Marble", href: `${BASE}/marble-design`, image: "/images/menu-look/marble.png" },
      { label: "Cement", href: `${BASE}/concrete-cement-design`, image: "/images/menu-look/cement.png" },
      { label: "Terrazzo", href: `${BASE}/terrazzo-design`, image: "/images/menu-look/terrazzo.png" },
      { label: "Patterned", href: `${BASE}/patterned`, image: "/images/menu-look/patterned.png" },
      { label: "Minimalistic", href: `${BASE}/minimalist-design`, image: "/images/menu-look/minimalist.png" },
      { label: "Handmade", href: `${BASE}/decor-tiles`, image: "/images/menu-look/handmade.png" },
    ],
  },
  {
    title: "Large slabs by Colour",
    itemType: "colour",
    items: [
      { label: "Grey", href: `${BASE}?colours=grey`, image: "/images/menu-colour/grey.png" },
      // { label: "Black", href: `${BASE}?colours=black`, swatch: "bg-black" },
      { label: "Green", href: `${BASE}?colours=green`, image: "/images/menu-colour/green.png" },
      { label: "Blue", href: `${BASE}?colours=blue`, image: "/images/menu-colour/blue.png" },
      { label: "Pink", href: `${BASE}?colours=pink`, image: "/images/menu-colour/pink.png" },
      { label: "Brown", href: `${BASE}?colours=brown`, image: "/images/menu-colour/brown.png" },
      // { label: "Beige", href: `${BASE}?colours=beige`, swatch: "bg-[#d4b896]" },
      // { label: "Cream", href: `${BASE}?colours=cream`, swatch: "bg-[#f5f5dc] border border-gray-300" },
      { label: "White", href: `${BASE}?colours=white`, image: "/images/menu-colour/white.png" },
      { label: "Red", href: `${BASE}?colours=red`, image: "/images/menu-colour/red.png" },
      // { label: "Sand", href: `${BASE}?colours=sand`, swatch: "bg-[#c2b280]" },
      { label: "Gold", href: `${BASE}?colours=gold`, image: "/images/menu-colour/matellic.png" },
      // { label: "Purple", href: `${BASE}?colours=purple`, swatch: "bg-purple-600" },
      { label: "Yellow", href: `${BASE}?colours=yellow`, image: "/images/menu-colour/yellow.png" },
      // { label: "Orange", href: `${BASE}?colours=orange`, swatch: "bg-orange-500" },
      // { label: "Multicolour", href: `${BASE}?colours=multicolour`, image: "/images/menu-colour/multicolour.png" },
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
