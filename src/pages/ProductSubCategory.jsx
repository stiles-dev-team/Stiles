import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Layout from '../layout/Layout'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import MultiRangeSlider from "multi-range-slider-react";
import { useSearchParams, useNavigate } from 'react-router-dom';

import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Dialog,
    DialogBody,
    Select,
    Option,
    Slider,
    Radio,
    Breadcrumbs,
    Spinner
} from "@material-tailwind/react";
import ProductCard from '../components/ProductCard';
import { CircularPagination } from '../components/CircularPagination';
import { FaFacebook, FaFacebookF, FaInstagram, FaPinterest, FaPinterestP, FaTwitter, FaWhatsapp, FaX, FaXTwitter } from 'react-icons/fa6';
import { RiHandbagLine } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import { MdOutlineGridView } from 'react-icons/md';
import { BsFillGrid3X3GapFill, BsFillGridFill } from 'react-icons/bs';
import { data } from 'autoprefixer';
import { getPricingUnit, formatPriceWithUnit } from '../utils/pricingUtils';
import { Helmet } from 'react-helmet';

// Add cache object at the top level
const dataCache = {
    products: null,
    categories: null,
    lastFetch: null
};

function Icon({ id, open }) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className={`${id === open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
      </svg>
    );
  }

const ProductSubCategory = () => {
    const navigate = useNavigate();
    const { slug, category } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [productsPerPage, setProductsPerPage] = useState(15);
    const [data, setData] = useState(null);

    // Combine data fetching into a single useEffect with caching
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Check if we have cached data that's less than 5 minutes old
                const now = Date.now();
                if (dataCache.lastFetch && (now - dataCache.lastFetch) < 300000) {
                    const selectedData = dataCache.categories.filter(item => item.slug === slug);
                    setData(selectedData[0]);
                    setLoading(false);
                    return;
                }

                const response = await fetch(`/data/categories.json`);
                const categoriesData = await response.json();
                dataCache.categories = categoriesData;
                dataCache.lastFetch = now;
                
                const selectedData = categoriesData.filter(item => item.slug === slug);
                setData(selectedData[0]);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [slug]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleProductsPerPageChange = (value) => {
        setProductsPerPage(parseInt(value));
        setCurrentPage(1);
    };

    const handleProductClick = (slug) => {
        navigate(`/product/${slug}`);
    };

    return (
        <Layout>
            <Helmet>
                <title>{data?.name || 'Products'} | Stiles</title>
                <meta name="description" content="Stiles Product Sub Category" />
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
                <style>
                    {`
                        html {
                            overscroll-behavior-y: none;
                        }
                    `}
                </style>
            </Helmet>
            <div>
                <Hero slug={slug} data={data} />
                <Content 
                    slug={slug} 
                    category={category} 
                    currentPage={currentPage} 
                    productsPerPage={productsPerPage} 
                    onPageChange={handlePageChange} 
                    loading={loading} 
                    setLoading={setLoading}
                    onProductsPerPageChange={handleProductsPerPageChange}
                    onProductClick={handleProductClick}
                />
            </div>
        </Layout>
    )
}

const Hero = ({slug, data}) => {
    return (
        <section id='heroHome' className='w-full h-[60vh] bg-[url("/images/bannerhome.png")] relative flex flex-col justify-center items-center pt-20'>
            <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
            <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
                <h1 className='text-white font-bold text-5xl text-center'>{data?.name}</h1>
                <div className='!text-white text-center w-full max-w-3xl'>
                    <p className='!text-white' dangerouslySetInnerHTML={{ __html: data?.description }}></p>
                </div>
            </div>
        </section>
    )
}

const Content = ({slug, category, currentPage, productsPerPage, onPageChange, loading, setLoading, onProductsPerPageChange, onProductClick }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [product, setProduct] = useState(null);
    const [dataSlug, setDataSlug] = useState(null);
    const [dataCategory, setDataCategory] = useState(null);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'asc');
    const [gridView, setGridView] = useState(true);

    // Split filterState into individual states like ProductCategory.jsx
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [minValue, setMinValue] = useState(0);
    const [maxValue, setMaxValue] = useState(0);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

    const [colours, setColours] = useState([]);
    const [finish, setFinish] = useState([]);
    const [brands, setBrands] = useState([]);
    
    // Initialize selected filters from URL params
    const [selectedFinish, setSelectedFinish] = useState(searchParams.get('finish')?.split(',') || []);
    const [selectedColours, setSelectedColours] = useState(searchParams.get('colours')?.split(',') || []);
    const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brands')?.split(',') || []);
    const [filteredProducts, setFilteredProducts] = useState(null);

    // Function to update URL parameters
    const updateUrlParams = useCallback((updates) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value.length > 0) {
                newParams.set(key, Array.isArray(value) ? value.join(',') : value);
            } else {
                newParams.delete(key);
            }
        });
        setSearchParams(newParams);
    }, [searchParams, setSearchParams]);

    // Update URL when filters change
    useEffect(() => {
        updateUrlParams({
            brands: selectedBrands,
            finish: selectedFinish,
            colours: selectedColours,
            sort: sortBy,
            minPrice: priceRange.min,
            maxPrice: priceRange.max
        });
    }, [selectedBrands, selectedFinish, selectedColours, sortBy, priceRange, updateUrlParams]);

    // Modify the initial data loading effect to be more efficient
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [categoriesRes, productsRes] = await Promise.all([
                    fetch('/data/categories.json'),
                    fetch('/data/products2.json')
                ]);
                
                const [categoriesData, productsData] = await Promise.all([
                    categoriesRes.json(),
                    productsRes.json()
                ]);

                const selectedData = categoriesData.filter(item => item.slug === slug);
                const categoryData = categoriesData.filter(item => item.slug === category);
                
                setDataSlug(selectedData[0]);
                setDataCategory(categoryData[0]);

                const selectedProducts = productsData
                    .filter(item => {
                        if (!item.product_cat) return false;
                        if (Array.isArray(item.product_cat)) {
                            return item.product_cat.includes(selectedData[0]?.name);
                        }
                        return item.product_cat.includes(selectedData[0]?.name);
                    })
                    .filter(item => item.status === 'publish');

                setProduct(selectedProducts);

                // Calculate price ranges
                const prices = selectedProducts
                    .map(item => parseFloat(item.regular_price.toString().replace(/[^\d.-]/g, '')) || 0)
                    .filter(price => !isNaN(price) && price > 0);

                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;

                const urlMinPrice = searchParams.get('minPrice');
                const urlMaxPrice = searchParams.get('maxPrice');

                setMinPrice(minPrice);
                setMaxPrice(maxPrice);
                setMinValue(urlMinPrice ? parseFloat(urlMinPrice) : minPrice);
                setMaxValue(urlMaxPrice ? parseFloat(urlMaxPrice) : maxPrice);
                setPriceRange({
                    min: urlMinPrice ? parseFloat(urlMinPrice) : minPrice,
                    max: urlMaxPrice ? parseFloat(urlMaxPrice) : maxPrice
                });

                // Extract unique values for filters
                const colours = [...new Set(selectedProducts
                    .map(item => item.colour?.split(',').map(c => c.trim()))
                    .flat()
                    .filter(colour => colour !== ''))]
                    .sort((a, b) => a.localeCompare(b));
                setColours(colours);

                const finish = [...new Set(selectedProducts
                    .map(item => item.finish?.split(',').map(f => f.trim()))
                    .flat()
                    .filter(finish => finish !== ''))]
                    .sort((a, b) => a.localeCompare(b));
                setFinish(finish);

                const brands = [...new Set(selectedProducts
                    .map(item => item.brands?.split(',').map(b => b.trim()))
                    .flat()
                    .filter(brand => brand !== ''))]
                    .sort((a, b) => a.localeCompare(b));
                setBrands(brands);

                // Apply initial filters
                applyFilters(selectedProducts);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, category, searchParams]);

    // Modify the price range handling to be more efficient
    const handleInput = useCallback((e) => {
        const newMinValue = e.minValue;
        const newMaxValue = e.maxValue;
        
        // Only update if values actually changed
        if (newMinValue !== minValue || newMaxValue !== maxValue) {
            setMinValue(newMinValue);
            setMaxValue(newMaxValue);
            setPriceRange({ min: newMinValue, max: newMaxValue });
            
            if (product) {
                applyFilters(product);
            }
        }
    }, [minValue, maxValue, product]);

    // Modify the filter application to be more efficient
    const applyFilters = useCallback((productsToFilter) => {
        if (!productsToFilter) return;
        
        let filtered = [...productsToFilter];
        
        // Apply brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(item => selectedBrands.includes(item.brands));
        }
        
        // Apply finish filter
        if (selectedFinish.length > 0) {
            filtered = filtered.filter(item => selectedFinish.includes(item.finish));
        }
        
        // Apply colour filter
        if (selectedColours.length > 0) {
            filtered = filtered.filter(item => selectedColours.includes(item.colour));
        }
        
        // Apply price filter
        filtered = filtered.filter(item => {
            const price = parseFloat(item.regular_price.toString().replace(/[^\d.-]/g, '')) || 0;
            return price >= priceRange.min && price <= priceRange.max;
        });
        
        setFilteredProducts(filtered);
    }, [selectedBrands, selectedFinish, selectedColours, priceRange]);

    // Consolidate all filter changes into a single effect
    useEffect(() => {
        if (product) {
            applyFilters(product);
        }
    }, [product, selectedFinish, selectedColours, selectedBrands, priceRange, applyFilters]);

    // Modify the filter handlers to be more efficient
    const handleFinishFilter = useCallback((finishItem) => {
        setSelectedFinish(prev => 
            prev.includes(finishItem)
                ? prev.filter(item => item !== finishItem)
                : [...prev, finishItem]
        );
    }, []);

    const handleColourFilter = useCallback((colourItem) => {
        setSelectedColours(prev => 
            prev.includes(colourItem)
                ? prev.filter(item => item !== colourItem)
                : [...prev, colourItem]
        );
    }, []);

    const handleBrandFilter = useCallback((brandItem) => {
        setSelectedBrands(prev => 
            prev.includes(brandItem)
                ? prev.filter(item => item !== brandItem)
                : [...prev, brandItem]
        );
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const handleOpenDialog = () => setOpenDialog(!openDialog);

    // Calculate current products for pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts ? filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct) : [];

    // Memoize filter handlers to prevent unnecessary re-renders
    const filterHandlers = useMemo(() => ({
        handleBrandFilter,
        handleFinishFilter,
        handleColourFilter
    }), [handleBrandFilter, handleFinishFilter, handleColourFilter]);

    return (
        <>
            {
                loading &&
                <div className='w-full h-svh fixed top-0 left-0 bg-black/90 z-50 flex justify-center items-center'>
                    <Spinner color='white' className="h-12 w-12" />
                </div>
            }
            <div className="flex flex-col lg:flex-row container mx-auto justify-between items-start gap-10 pt-8 relative px-4">
                <aside className='w-full lg:w-4/12 xl:w-3/12 flex flex-col justify-start items-start relative lg:sticky top-3'>
                    <Accordion open={open === 1} icon={<Icon id={1} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(1)}>Brands</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {
                                    brands.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedBrands.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => filterHandlers.handleBrandFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                }
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 2} icon={<Icon id={2} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(2)}>Price</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='w-full pt-6 pb-2 px-1'>
                                <MultiRangeSlider
                                    key={`${minPrice}-${maxPrice}`}
                                    className='border-none shadow-none'
                                    min={minPrice}
                                    max={maxPrice}
                                    ruler={false}
                                    step={10}
                                    minValue={minValue}
                                    maxValue={maxValue}
                                    barLeftColor='white'
                                    barRightColor='white'
                                    barInnerColor='black'
                                    onInput={handleInput}
                                    label={true}
                                    labelColor="white"
                                    labelBackgroundColor="black"
                                    preventWheel={true}
                                    style={{
                                        border: 'none',
                                        boxShadow: 'none',
                                        padding: '0',
                                        margin: '0'
                                    }}
                                />
                            </div>
                            <div className='w-full flex flex-row justify-between items-center gap-2'>
                                <p className='text-gray-500'>{formatCurrency(minValue)}</p>
                                <p className='text-gray-500'>{formatCurrency(maxValue)}</p>
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(3)}>Finish</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {
                                    finish.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedFinish.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => filterHandlers.handleFinishFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                }
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 4} icon={<Icon id={4} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(4)}>Colour</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {
                                    colours.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedColours.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => filterHandlers.handleColourFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                }
                            </div>
                        </AccordionBody>
                    </Accordion>
                </aside>
                <div className='w-full flex flex-col justify-start items-start gap-5'>
                    <div className='w-full flex flex-row justify-start items-center gap-3'>
                        <Breadcrumbs>
                            <a href="/" className="opacity-60">
                                Home
                            </a>
                            <a href={"/product-category/" + category} className="opacity-60">
                                {dataCategory?.name}
                            </a>
                            <a href={"/product-category/" + category + "/" + slug}>
                                {dataSlug?.name}
                            </a>
                        </Breadcrumbs>
                    </div>
                    <div className='w-full flex flex-row justify-between items-center gap-3'>
                        <div className='w-full lg:max-w-80'>
                            <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e)}>
                                <Option value="asc">Latest</Option>
                                <Option value="desc">Popularity</Option>
                                <Option value="nuev">Price: Low to High</Option>
                                <Option value="vend">Price: High to Low</Option>
                            </Select>
                        </div>
                        <div className='flex flex-row justify-end items-center gap-2'>
                            <div className='w-52'>
                                <Select 
                                    label="Products per page" 
                                    value={productsPerPage.toString()} 
                                    onChange={(e) => onProductsPerPageChange(e)}
                                >
                                    <Option value="9">9 per page</Option>
                                    <Option value="15">15 per page</Option>
                                    <Option value="24">24 per page</Option>
                                    <Option value="36">36 per page</Option>
                                </Select>
                            </div>
                            <div className='hidden xl:flex flex-row justify-end items-center gap-2'>
                                <BsFillGrid3X3GapFill className={`cursor-pointer transition-all ${gridView === true ? "fill-dark" : "fill-dark/50 hover:fill-dark/70"}`} size={20} onClick={() => setGridView(true)} />
                                <BsFillGridFill  className={`cursor-pointer transition-all ${gridView === false ? "fill-dark" : "fill-dark/50 hover:fill-dark/70"}`} size={20} onClick={() => setGridView(false)} />
                            </div>
                        </div>
                    </div>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 ${gridView === true ? "xl:grid-cols-3" : "xl:grid-cols-2"} gap-5 w-full relative`}>
                        {
                            currentProducts.map((item, index) => (
                                <ProductCard 
                                    key={index} 
                                    onClick={() => onProductClick(item.slug)} 
                                    prod={item.slug} 
                                />
                            ))
                        }
                    </div>
                    <CircularPagination
                        totalItems={filteredProducts ? filteredProducts.length : 0}
                        itemsPerPage={productsPerPage}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                    <br />
                    <br />
                </div>
            </div>
            <Dialog size='lg' open={openDialog} handler={handleOpenDialog}>
                <DialogBody>
                    <div className='w-full flex flex-col lg:flex-row justify-between items-start gap-4'>
                        <div className='w-full lg:w-7/12 flex flex-row justify-start items-center gap-2'>
                            <img src="/images/product_ph.png" alt="" className='w-full lg:w-10/12 aspect-[16/10] lg:aspect-square object-cover object-center rounded-md' />
                            <div className="hidden lg:flex flex-col justify-start items-center gap-2 relative">
                                <FaAngleUp className='fill-dark absolute -top-10 bg-white rounded-full p-1 cursor-pointer' size={24} />
                                <img src="/images/product_ph.png" alt="" className='w-full max-w-20 aspect-square object-cover object-center rounded-md' />
                                <img src="/images/product_ph.png" alt="" className='w-full max-w-20 aspect-square object-cover object-center rounded-md opacity-40' />
                                <img src="/images/product_ph.png" alt="" className='w-full max-w-20 aspect-square object-cover object-center rounded-md opacity-40' />
                                <img src="/images/product_ph.png" alt="" className='w-full max-w-20 aspect-square object-cover object-center rounded-md opacity-40' />
                                <FaAngleDown className='fill-dark absolute -bottom-10 bg-white rounded-full p-1 cursor-pointer' size={24} />
                            </div>
                        </div>
                        <div className='w-full lg:w-5/12 flex flex-col justify-start items-start gap-1 pt-5'>
                            <h2 className='font-bold text-lg'>Essence Torino Calacatta Polished Rectified 600x1200mm</h2>
                            <p className='text-secondary'><span className='text-dark font-bold'>SKU:</span> 116-ST111200</p>
                            <div className="flex flex-row justify-start items-end gap-2">
                                <p className='text-[#B3B3B3] line-through'>R3,186</p>
                                <p className='text-dark text-2xl'>{formatPriceWithUnit(2399, getPricingUnit({product_cat: ["Tiles"]}))}</p>
                            </div>
                            <p className='italic text-[#B3B3B3]'>(R935.61 per box of tiles)</p>
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full ">
                                <div className='flex flex-row justify-start items-center gap-1 font-bold'>
                                    Brand:
                                    <img src="/images/partner.png" alt="" className='size-20 object-contain object-center' />
                                </div>
                                <div className='flex flex-row justify-start items-center gap-1 font-bold'>
                                    Share Item:
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'>
                                        <FaFacebookF className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'>
                                        <FaXTwitter className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'>
                                        <FaPinterestP className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'>
                                        <FaInstagram className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'>
                                        <FaWhatsapp className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                </div>
                            </div>
                            <p>Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nulla nibh diam, blandit vel consequat nec, ultrices et ipsum. Nulla varius magna a consequat pulvinar. </p>
                            <div className='flex flex-row justify-start items-center gap-2 w-full'>
                                <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                    <button className='text-dark font-negro aspect-square w-7'>-</button>
                                    <input type="text" className=' border-0 appearance-none text-dark text-center w-16 outline-none' min={1} value={1} />
                                    <button className='text-dark font-negro aspect-square w-7'>+</button>
                                </div>
                                <button className='text-xs bg-primary text-dark rounded-full py-4 w-72 px-5 flex justify-center items-center gap-2 font-semibold'>
                                    ADD TO CART
                                    <RiHandbagLine className='fill-dark' size={14} />
                                </button>
                                <div className={`rounded-full hidden lg:flex justify-center items-center z-10 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 bg-secondary/10`}>
                                    <FaHeart size={20} className={`transition-all fill-dark`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogBody>
            </Dialog>
        </>
    )
}

export default ProductSubCategory;