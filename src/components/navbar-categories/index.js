import { FLOORING_MEGA_MENU } from "./floor-tiles";
import { WALL_TILES_MEGA_MENU } from "./wall-tiles";
import { LARGE_SLABS_MEGA_MENU } from "./large-slabs";
import { DECOR_MOSAICS_MEGA_MENU } from "./decor-mosaics";
import { SANWARE_MEGA_MENU } from "./sanware";
import navbarCategories from "../../../public/data/navbar-categories.json";

const DEFAULT_CATEGORY_IMAGE = "/images/bannerhome.png";

const FLOOR_TILE_COLOUR_IMAGES = {
  blue: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_blue.jpg",
  brown: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_brown.jpg",
  gold: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_gold.jpg",
  green: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_green.jpg",
  grey: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_grey.jpg",
  pink: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_pink.jpg",
  red: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_red.jpg",
  white: "/images/product-category/colour/floor-tiles/Stiles new catagories websliders_floor_colour_white.jpg",
};

const WALL_TILE_COLOUR_IMAGES = {
  blue: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_blue.jpg",
  brown: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_brown.jpg",
  gold: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_gold.jpg",
  green: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_green.jpg",
  grey: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_grey.jpg",
  pink: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_pink.jpg",
  red: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_red.jpg",
  white: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colour_white.jpg",
  yellow: "/images/product-category/colour/wall-tiles/Stiles new catagories websliders_walltile by colouryellow.jpg",
};

const categoriesBySlug = new Map();
for (const category of navbarCategories) {
  const slug = String(category.slug || "").toLowerCase();
  if (!slug) continue;
  const existing = categoriesBySlug.get(slug);
  if (!existing || (!existing.thumbnail && category.thumbnail)) {
    categoriesBySlug.set(slug, category);
  }
}

const jsonThumbnailForSlug = (slug) =>
  String(categoriesBySlug.get(slug)?.thumbnail || "").trim();

const backgroundImageForSlug = (slug) =>
  colourImageForSlug(slug) || jsonThumbnailForSlug(slug) || DEFAULT_CATEGORY_IMAGE;

const colourImageForSlug = (slug) => {
  const imagesBySlug = {
    "floor-tiles": FLOOR_TILE_COLOUR_IMAGES,
    flooring: FLOOR_TILE_COLOUR_IMAGES,
    "wall-tiles": WALL_TILE_COLOUR_IMAGES,
  };
  const images = imagesBySlug[slug];
  if (!images || typeof window === "undefined") return "";
  const colours = new URLSearchParams(window.location.search).get("colours") || "";
  const colour = colours.split(",")[0].trim().toLowerCase();
  const image = images[colour];
  return image ? encodeURI(image) : "";
};

export const NAV_MENUS = [
  {
    id: "floor-tiles",
    label: "Floor Tiles",
    href: "/product-category/floor-tiles",
    mobileHref: "/product-category/floor-tiles",
    filterBase: "/product-category/floor-tiles",
    flatten: false,
    buttonClass: "floor-tiles-button",
    dropdownClass: "floor-tiles-dropdown",
    columns: FLOORING_MEGA_MENU,
  },
  {
    id: "wall-tiles",
    label: "Wall Tiles",
    href: "/product-category/tiles/wall-tiles",
    mobileHref: "/product-category/tiles/wall-tiles",
    filterBase: "/product-category/tiles/wall-tiles",
    flatten: false,
    buttonClass: "wall-tiles-button",
    dropdownClass: "wall-tiles-dropdown",
    columns: WALL_TILES_MEGA_MENU,
  },
  {
    id: "large-slabs",
    label: "Large Slabs",
    categoryName: "Large Slab",
    href: "/product-category/tiles/large-slab",
    mobileHref: "/product-category/tiles/large-slab",
    filterBase: "/product-category/tiles/large-slab",
    flatten: false,
    buttonClass: "large-slabs-button",
    dropdownClass: "large-slabs-dropdown",
    columns: LARGE_SLABS_MEGA_MENU,
  },
  {
    id: "decor-mosaics",
    label: "Décor & Mosaics",
    categoryName: "Mosaics",
    href: "/product-category/tiles/mosaics",
    mobileHref: "/product-category/tiles/mosaics",
    filterBase: "/product-category/tiles/mosaics",
    flatten: false,
    buttonClass: "decor-mosaics-button",
    dropdownClass: "decor-mosaics-dropdown",
    columns: DECOR_MOSAICS_MEGA_MENU,
  },
  {
    id: "sanware",
    label: "Sanware",
    href: "/product-category/sanitary%20ware",
    mobileHref: "/product-category/sanitary%20ware",
    filterBase: "/product-category/sanitary%20ware",
    flatten: true,
    buttonClass: "sanware-button",
    dropdownClass: "sanware-dropdown",
    columns: SANWARE_MEGA_MENU,
  },
];

const nameFromSlug = (slug) =>
  String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const slugFromHref = (href) => {
  if (!href) return "";
  const path = String(href).split("?")[0];
  const parts = path.split("/").filter(Boolean);
  return (parts[parts.length - 1] || "").toLowerCase();
};

const pickName = (slug, label) => {
  const fromSlug = nameFromSlug(slug);
  if (!label) return fromSlug;
  return fromSlug.length >= label.length ? fromSlug : label;
};

export const getCategoryBySlug = (slug) => {
  const key = String(slug || "").toLowerCase();
  if (!key) {
    return { name: "", categoryName: "", slug: "", description: "", thumbnail: DEFAULT_CATEGORY_IMAGE };
  }

  const menuMatch = NAV_MENUS.find(
    (menu) => menu.id === key || slugFromHref(menu.href) === key || slugFromHref(menu.mobileHref) === key
  );
  if (menuMatch) {
    return {
      name: menuMatch.label,
      categoryName: menuMatch.categoryName || menuMatch.label,
      slug: key,
      description: "",
      thumbnail: backgroundImageForSlug(key),
    };
  }

  const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
  let slugMatch = null;
  for (const menu of NAV_MENUS) {
    for (const column of menu.columns || []) {
      for (const item of column.items || []) {
        if (slugFromHref(item.href) !== key) continue;
        const hrefPath = String(item.href || "").split("?")[0];
        if (currentPath && hrefPath && currentPath.includes(hrefPath)) {
          return {
            name: pickName(key, item.label),
            categoryName: item.categoryName || pickName(key, item.label),
            slug: key,
            description: "",
            thumbnail: backgroundImageForSlug(key),
          };
        }
        if (!slugMatch) slugMatch = item;
      }
    }
  }
  if (slugMatch) {
    return {
      name: pickName(key, slugMatch.label),
      categoryName: slugMatch.categoryName || pickName(key, slugMatch.label),
      slug: key,
      description: "",
      thumbnail: backgroundImageForSlug(key),
    };
  }

  return {
    name: nameFromSlug(key),
    categoryName: nameFromSlug(key),
    slug: key,
    description: "",
    thumbnail: backgroundImageForSlug(key),
  };
};
