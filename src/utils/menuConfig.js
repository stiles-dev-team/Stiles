import {
  Bath,
  CookingPot,
  Sun,
  TreePine,
  Home,
  Waves,
  Building2,
  PanelTop,
  Package,
  Droplets,
  SprayCan,
  LayoutGrid,
  Sofa,
} from "lucide-react";

export const MENU_ICONS = {
  Bath,
  CookingPot,
  Sun,
  TreePine,
  Home,
  Waves,
  Building2,
  PanelTop,
  Package,
  Droplets,
  SprayCan,
  LayoutGrid,
  Sofa,
};

export const ICON_OPTIONS = Object.keys(MENU_ICONS);

export const LOOK_IMAGES = {
  "Brick Look": "/images/menu-look/brick.png",
  Wood: "/images/menu-look/wood.png",
  Stone: "/images/menu-look/stone.png",
  Marble: "/images/menu-look/marble.png",
  Cement: "/images/menu-look/cement.png",
  Terrazzo: "/images/menu-look/terrazzo.png",
  Patterned: "/images/menu-look/patterned.png",
  Minimalistic: "/images/menu-look/minimalist.png",
  Handmade: "/images/menu-look/handmade.png",
  "Metal Look": "/images/menu-look/metal.png",
  Subway: "/images/menu-look/subway.png",
  Smalls: "/images/menu-look/smalls.png",
  Fluted: "/images/menu-look/fluted.png",
  "Kit Kat": "/images/menu-look/kit-kat.png",
  Hexagon: "/images/menu-look/hexagon.png",
  Relief: "/images/menu-look/relief.png",
};

export const COLOUR_IMAGES = {
  Grey: "/images/menu-colour/grey.png",
  Green: "/images/menu-colour/green.png",
  Blue: "/images/menu-colour/blue.png",
  Pink: "/images/menu-colour/pink.png",
  Brown: "/images/menu-colour/brown.png",
  White: "/images/menu-colour/white.png",
  Red: "/images/menu-colour/red.png",
  Yellow: "/images/menu-colour/yellow.png",
  Gold: "/images/menu-colour/matellic.png",
  Multicolour: "/images/menu-colour/multicolour.png",
};

export const withMenuImage = (item, type) => {
  const image =
    type === "look" ? LOOK_IMAGES[item.label] : COLOUR_IMAGES[item.label];
  if (!image) return item;
  const { swatch, ...rest } = item;
  return { ...rest, image };
};

export const ITEM_TYPES = [
  { value: "look", label: "Look (swatch)" },
  { value: "colour", label: "Colour (swatch)" },
  { value: "size", label: "Size" },
  { value: "icon", label: "Icon" },
  { value: "image", label: "Image" },
];

export const COLOUR_SWATCHES = {
  grey: "bg-gray-400",
  gray: "bg-gray-400",
  black: "bg-black",
  green: "bg-green-600",
  blue: "bg-blue-600",
  pink: "bg-pink-400",
  brown: "bg-[#6b4423]",
  beige: "bg-[#d4b896]",
  cream: "bg-[#f5f5dc] border border-gray-300",
  white: "bg-white border border-gray-300",
  red: "bg-red-600",
  sand: "bg-[#c2b280]",
  gold: "bg-[#d4af37]",
  purple: "bg-purple-600",
  yellow: "bg-yellow-400",
  orange: "bg-orange-500",
};

export const LOOK_SWATCHES = {
  "Brick Look": "bg-gradient-to-br from-red-900 via-red-700 to-red-500",
  Wood: "bg-gradient-to-br from-amber-800 via-amber-600 to-amber-400",
  Stone: "bg-stone-500",
  Marble: "bg-gradient-to-br from-gray-200 via-white to-gray-400",
  Cement: "bg-gray-400",
  Terrazzo: "bg-[radial-gradient(circle,#666_1px,transparent_1px)] bg-[length:4px_4px] bg-gray-200",
  Patterned:
    "bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[length:8px_8px] bg-[position:0_0,0_4px,4px_-4px,-4px_0px] bg-gray-100",
  Minimalistic: "bg-gradient-to-br from-gray-100 to-gray-300",
  Handmade: "bg-gradient-to-br from-amber-700 via-orange-300 to-amber-900",
  "Metal Look": "bg-gradient-to-br from-gray-700 via-gray-500 to-gray-800",
  Subway:
    "bg-white border border-gray-300 bg-[linear-gradient(#e5e7eb_1px,transparent_1px)] bg-[length:100%_33%]",
  Smalls:
    "bg-gray-200 bg-[radial-gradient(circle,#999_1px,transparent_1px)] bg-[length:6px_6px]",
  Fluted:
    "bg-gray-300 bg-[repeating-linear-gradient(90deg,#999_0px,#999_2px,transparent_2px,transparent_6px)]",
  "Kit Kat":
    "bg-stone-400 bg-[repeating-linear-gradient(90deg,transparent_0px,transparent_3px,#78716c_3px,#78716c_5px)]",
  Hexagon:
    "bg-gray-200 bg-[conic-gradient(at_50%_50%,#ccc_0deg_60deg,transparent_60deg_120deg,#ccc_120deg_180deg,transparent_180deg_240deg,#ccc_240deg_300deg,transparent_300deg_360deg)] bg-[length:12px_12px]",
  Relief: "bg-gradient-to-br from-stone-400 via-stone-300 to-stone-500 shadow-inner",
};

export const SWATCH_PRESETS = [
  ...Object.entries(COLOUR_SWATCHES).map(([name, swatch]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    swatch,
  })),
  ...Object.entries(LOOK_SWATCHES).map(([name, swatch]) => ({ name, swatch })),
].filter(
  (preset, index, all) =>
    all.findIndex((item) => item.swatch === preset.swatch) === index
);

export const getColourSwatch = (colour) => {
  const key = String(colour || "").toLowerCase().trim();
  return COLOUR_SWATCHES[key] || "bg-gray-300";
};

export const formatSizeDimension = (size) =>
  String(size || "")
    .replace(/\s*[x×]\s*/i, "×")
    .trim();

export const sizeQueryValue = (size) =>
  String(size || "")
    .replace(/\s*[×x]\s*/i, " x ")
    .trim();

export const resolveMenuIcons = (menus = []) =>
  menus.map((menu) => ({
    ...menu,
    columns: (menu.columns || []).map((column) => ({
      ...column,
      items: (column.items || []).map((item) => ({
        ...item,
        icon: typeof item.icon === "string" ? MENU_ICONS[item.icon] : item.icon,
        extraIcon:
          typeof item.extraIcon === "string"
            ? MENU_ICONS[item.extraIcon]
            : item.extraIcon,
      })),
    })),
  }));
