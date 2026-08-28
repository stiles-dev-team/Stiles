import { FLOORING_MEGA_MENU } from "./floor-tiles";
import { WALL_TILES_MEGA_MENU } from "./wall-tiles";
import { LARGE_SLABS_MEGA_MENU } from "./large-slabs";
import { DECOR_MOSAICS_MEGA_MENU } from "./decor-mosaics";
import { SANWARE_MEGA_MENU } from "./sanware";

export const NAV_MENUS = [
  {
    id: "floor-tiles",
    label: "Floor Tiles",
    href: "/product-category/flooring",
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
    label: "Decor",
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
    href: "/product-category/sanitary-ware",
    mobileHref: "/product-category/sanitary-ware",
    filterBase: "/product-category/sanitary-ware",
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
    return { name: "", slug: "", description: "", thumbnail: "" };
  }

  const menuMatch = NAV_MENUS.find(
    (menu) => menu.id === key || slugFromHref(menu.href) === key || slugFromHref(menu.mobileHref) === key
  );
  if (menuMatch) {
    return {
      name: menuMatch.label,
      slug: key,
      description: "",
      thumbnail: "",
    };
  }

  for (const menu of NAV_MENUS) {
    for (const column of menu.columns || []) {
      for (const item of column.items || []) {
        if (slugFromHref(item.href) === key) {
          return {
            name: pickName(key, item.label),
            slug: key,
            description: "",
            thumbnail: item.image || "",
          };
        }
      }
    }
  }

  return {
    name: nameFromSlug(key),
    slug: key,
    description: "",
    thumbnail: "",
  };
};
