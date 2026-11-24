import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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

const CATEGORY_DATA_URL = "/data/navbar-categories.json";

let categoryRecords = Array.isArray(navbarCategories) ? navbarCategories : [];
const categoryListeners = new Set();

const notifyCategories = () => {
  categoryListeners.forEach((listener) => listener());
};

const loadLiveCategories = () => {
  if (typeof window === "undefined") return Promise.resolve(categoryRecords);
  if (loadLiveCategories.promise) return loadLiveCategories.promise;
  loadLiveCategories.promise = fetch(CATEGORY_DATA_URL, { cache: "no-cache" })
    .then((response) => (response.ok ? response.json() : null))
    .then((data) => {
      if (Array.isArray(data) && data.length) {
        categoryRecords = data;
        notifyCategories();
      }
      return categoryRecords;
    })
    .catch(() => categoryRecords);
  return loadLiveCategories.promise;
};

const thumbnailOf = (category) => String(category?.thumbnail || "").trim();

const normalizeSlug = (slug) =>
  String(slug || "")
    .toLowerCase()
    .replace(/---+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const lookKey = (slug) => {
  let key = normalizeSlug(slug).replace(/-(design|look|tiles|tile)$/g, "");
  key = key.replace(/-(design|look|tiles|tile)$/g, "");
  if (key.startsWith("concrete") || key.startsWith("cement")) return "concrete";
  if (key.startsWith("terrazzo") || key.startsWith("terrazo")) return "terrazzo";
  if (key.startsWith("metallic") || key === "metal") return "metallic";
  if (key.startsWith("kit-kat") || key.startsWith("kitkat")) return "kit-kat";
  if (key.startsWith("hexagon")) return "hexagon";
  if (key.startsWith("marble")) return "marble";
  if (key.startsWith("pattern")) return "patterned";
  return key;
};

const matchScore = (category, leafSlug) => {
  const categorySlug = normalizeSlug(category?.slug);
  const leaf = normalizeSlug(leafSlug);
  if (!categorySlug || !leaf) return 0;
  if (categorySlug === leaf) return 100;
  const categoryKey = lookKey(categorySlug);
  if (categoryKey && categoryKey === lookKey(leaf)) return thumbnailOf(category) ? 80 : 60;
  return 0;
};

const indexCategories = (records) => {
  const bySlug = new Map();
  const childrenByParent = new Map();
  records.forEach((category) => {
    const parentId = category?.parent ?? 0;
    const children = childrenByParent.get(parentId) || [];
    children.push(category);
    childrenByParent.set(parentId, children);
    [String(category?.slug || "").toLowerCase(), normalizeSlug(category?.slug)].forEach((key) => {
      if (!key) return;
      const matches = bySlug.get(key) || [];
      matches.push(category);
      bySlug.set(key, matches);
    });
  });
  return { bySlug, childrenByParent };
};

const descendantsOf = (parentId, childrenByParent) => {
  const matches = [];
  const stack = [...(childrenByParent.get(parentId) || [])];
  while (stack.length) {
    const category = stack.pop();
    matches.push(category);
    stack.push(...(childrenByParent.get(category.term_id) || []));
  }
  return matches;
};

const bestMatch = (categories, leafSlug) => {
  let best = null;
  let bestScore = 0;
  categories.forEach((category) => {
    const score = matchScore(category, leafSlug);
    const betterThumbnail = score === bestScore && score > 0 && thumbnailOf(category) && !thumbnailOf(best);
    if (score > bestScore || betterThumbnail) {
      best = category;
      bestScore = score;
    }
  });
  return { category: best, score: bestScore };
};

const pathSegments = (pathname) => {
  const parts = String(pathname || "").split("?")[0].split("/").filter(Boolean);
  const categoryIndex = parts.indexOf("product-category");
  const segments = (categoryIndex >= 0 ? parts.slice(categoryIndex + 1) : parts).map((part) =>
    decodeURIComponent(part).toLowerCase()
  );
  return segments;
};

const resolveCategoryRecord = (records, pathname, leafSlug) => {
  if (!Array.isArray(records) || !records.length) return null;
  const { bySlug, childrenByParent } = indexCategories(records);
  const segments = pathSegments(pathname);
  const leaf = String(leafSlug || segments[segments.length - 1] || "").toLowerCase();
  if (!leaf) return null;

  for (let index = segments.length - 2; index >= 0; index -= 1) {
    const parents = bySlug.get(segments[index]) || bySlug.get(normalizeSlug(segments[index])) || [];
    if (!parents.length) continue;
    const { category, score } = bestMatch(
      parents.flatMap((parent) => descendantsOf(parent.term_id, childrenByParent)),
      leaf
    );
    if (category && score >= 60) return category;
    break;
  }

  if (segments.length <= 1) {
    const self = bySlug.get(leaf) || bySlug.get(normalizeSlug(leaf)) || [];
    return self.find((category) => thumbnailOf(category)) || self[0] || null;
  }

  const exact = (bySlug.get(normalizeSlug(leaf)) || []).filter(
    (category) => normalizeSlug(category.slug) === normalizeSlug(leaf)
  );
  return exact.find((category) => thumbnailOf(category)) || exact[0] || null;
};

const categoryPresentation = (slug, pathname) => {
  const record = resolveCategoryRecord(categoryRecords, pathname, slug);
  return {
    description: String(record?.description || ""),
    thumbnail: colourImageForSlug(slug) || thumbnailOf(record) || DEFAULT_CATEGORY_IMAGE,
  };
};

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

// Product category text that must be searched as stored, including hyphens.
// Pet-friendly, Bi-Sliders, Tri-Sliders, and Drop-In Prep Bowls do not match the spaced slug labels.
const CATEGORY_SEARCH_NAMES = {
  "pet-friendly": "Pet-friendly",
  "bi-slider": "Bi-Sliders",
  "tri-slider": "Tri-Sliders",
  "drop-in-prep-bowls": "Drop-In Prep Bowls",
};

const categorySearchName = (slug, fallback) =>
  CATEGORY_SEARCH_NAMES[String(slug || "").toLowerCase()] || fallback;

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

export const getCategoryBySlug = (slug, path) => {
  const key = String(slug || "").toLowerCase();
  const pathname = path || (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "");
  const presentation = categoryPresentation(key, pathname);
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
      description: presentation.description,
      thumbnail: presentation.thumbnail,
    };
  }

  const currentPath = pathname.split("?")[0];
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
            description: presentation.description,
            thumbnail: presentation.thumbnail,
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
      description: presentation.description,
      thumbnail: presentation.thumbnail,
    };
  }

  return {
    name: nameFromSlug(key),
    categoryName: categorySearchName(key, nameFromSlug(key)),
    slug: key,
    description: presentation.description,
    thumbnail: presentation.thumbnail,
  };
};

export const useCategoryBySlug = (slug) => {
  const location = useLocation();
  const [, setVersion] = useState(0);

  useEffect(() => {
    const update = () => setVersion((version) => version + 1);
    categoryListeners.add(update);
    loadLiveCategories();
    return () => categoryListeners.delete(update);
  }, []);

  return getCategoryBySlug(slug, `${location.pathname}${location.search}`);
};
