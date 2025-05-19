import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import MultiRangeSlider from "multi-range-slider-react";
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';

import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Dialog,
    DialogBody,
    Breadcrumbs,
    Select,
    Option,
    Slider,
    Radio,
    Spinner,
    Tooltip
} from "@material-tailwind/react";
import ProductCard from '../components/ProductCard';
import { CircularPagination } from '../components/CircularPagination';
import { FaFacebook, FaFacebookF, FaInstagram, FaPinterest, FaPinterestP, FaTwitter, FaWhatsapp, FaX, FaXTwitter } from 'react-icons/fa6';
import { RiHandbagLine } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
import { MdOutlineGridView } from 'react-icons/md';
import { BsFillGrid3X3GapFill, BsFillGridFill } from 'react-icons/bs';
import { getPricingUnit, formatPriceWithUnit } from '../utils/pricingUtils';

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

const ProductBrands = () => {
    const { slug } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [productsPerPage, setProductsPerPage] = useState(15);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleProductsPerPageChange = (value) => {
        setProductsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page when changing items per page
    };

    const [data, setData] = useState(null);

    useEffect(() => {
        fetch(`/data/categories.json`)
        .then(res => res.json())
        .then(data => {
            const selectedData = data.filter(item => item.slug === slug);
            setData(selectedData[0]);
        })
        .catch(err => console.log(err));
    }, []);

  return (
    <Layout>
        <Helmet>
            <title>{data?.name || 'Products'} | Stiles</title>
            <meta name="description" content="Stiles Product Brands" />
        </Helmet>
        <Hero slug={slug} />
        <Content 
            slug={slug} 
            currentPage={currentPage} 
            productsPerPage={productsPerPage} 
            onPageChange={handlePageChange} 
            loading={loading} 
            setLoading={setLoading}
            onProductsPerPageChange={handleProductsPerPageChange}
        />
    </Layout>
  )
}

export default ProductBrands

const Hero = ({slug}) => {

    return (
      <section id='heroHome' className='w-full h-[60vh] bg-[url("/images/bannerhome.png")] relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>{slug}</h1>
        </div>
      </section>
    )
}

const Content = ({slug, currentPage, productsPerPage, onPageChange, loading, setLoading, onProductsPerPageChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [product, setProduct] = useState(null);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);
    const [minValue, set_minValue] = useState(0);
    const [maxValue, set_maxValue] = useState(0);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

    const [dataSlug, setDataSlug] = useState(null);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'asc');
    const [gridView, setGridView] = useState(true);

    const [colours, setColours] = useState([]);
    const [finish, setFinish] = useState([]);
    
    // Initialize selected filters from URL params
    const [selectedFinish, setSelectedFinish] = useState(searchParams.get('finish')?.split(',') || []);
    const [selectedColours, setSelectedColours] = useState(searchParams.get('colours')?.split(',') || []);
    const [filteredProducts, setFilteredProducts] = useState(null);

    // Function to update URL parameters
    const updateUrlParams = (updates) => {
        const newParams = new URLSearchParams(searchParams);
        
        // Update each parameter
        Object.entries(updates).forEach(([key, value]) => {
            if (value && value.length > 0) {
                newParams.set(key, Array.isArray(value) ? value.join(',') : value);
            } else {
                newParams.delete(key);
            }
        });
        
        setSearchParams(newParams);
    };

    // Update URL when filters change
    useEffect(() => {
        updateUrlParams({
            finish: selectedFinish,
            colours: selectedColours,
            sort: sortBy,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            perPage: productsPerPage
        });
    }, [selectedFinish, selectedColours, sortBy, priceRange, productsPerPage]);

    // Modify the initial data loading effect to be more efficient
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/data/products2.json`);
                const data = await response.json();
                
                // First, get all products for the brand
                const selectedProducts = data
                    .filter(item => {
                        if (!item.brands) return false;
                        if (Array.isArray(item.brands)) {
                            return item.brands.includes(slug);
                        }
                        return item.brands.includes(slug);
                    })
                    .filter(item => item.status === 'publish');
                
                // Set the original product list
                setProduct(selectedProducts);
                
                // Calculate price ranges
                const prices = selectedProducts
                    .map(item => {
                        const priceStr = item.regular_price.toString().replace(/[^\d.-]/g, '');
                        return parseFloat(priceStr) || 0;
                    })
                    .filter(price => !isNaN(price) && price > 0);
        
                const minPrice = prices.length ? Math.min(...prices) : 0;
                const maxPrice = prices.length ? Math.max(...prices) : 0;
        
                // Initialize price range from URL params or calculated values
                const urlMinPrice = searchParams.get('minPrice');
                const urlMaxPrice = searchParams.get('maxPrice');
                
                setMinPrice(minPrice);
                setMaxPrice(maxPrice);
                set_minValue(urlMinPrice ? parseFloat(urlMinPrice) : minPrice);
                set_maxValue(urlMaxPrice ? parseFloat(urlMaxPrice) : maxPrice);
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
        
                // Apply initial filters
                applyFilters(selectedProducts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, searchParams]);

    // Add a new useEffect to handle page changes
    useEffect(() => {
        if (product) {
            setLoading(true);
            // Apply filters to the current product list
            applyFilters(product);
            setLoading(false);
        }
    }, [currentPage, productsPerPage]);

    // Modify the price range handling to be more efficient
    const handleInput = (e) => {
        // Debounce the price range updates
        const newMinValue = e.minValue;
        const newMaxValue = e.maxValue;
        
        // Only update if values actually changed
        if (newMinValue !== minValue || newMaxValue !== maxValue) {
            set_minValue(newMinValue);
            set_maxValue(newMaxValue);
            setPriceRange({ min: newMinValue, max: newMaxValue });
            
            if (product) {
                // Use requestAnimationFrame to batch DOM updates
                requestAnimationFrame(() => {
                    applyFilters(product);
                });
            }
        }
    };

    useEffect(() => {
        fetch(`/data/categories.json`)
        .then(res => res.json())
        .then(data => {
            const selectedData = data.filter(item => item.slug === slug);
            setDataSlug(selectedData[0]);
        })
        .catch(err => console.log(err));
    }, []);

    // New useEffect to handle sorting when sortBy changes
    useEffect(() => {
        if (product) {
            setLoading(true);
            let sortedProducts = [...product];
            
            switch (sortBy) {
                case 'asc':
                    // Latest (default sort by post date)
                    sortedProducts.sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
                    break;
                case 'desc':
                    // Popularity (assuming there's a popularity field, otherwise using a placeholder)
                    sortedProducts.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                    break;
                case 'nuev':
                    // Price: Low to High
                    sortedProducts.sort((a, b) => {
                        const priceA = parseFloat(a.regular_price) || 0;
                        const priceB = parseFloat(b.regular_price) || 0;
                        return priceA - priceB;
                    });
                    break;
                case 'vend':
                    // Price: High to Low
                    sortedProducts.sort((a, b) => {
                        const priceA = parseFloat(a.regular_price) || 0;
                        const priceB = parseFloat(b.regular_price) || 0;
                        return priceB - priceA;
                    });
                    break;
                default:
                    // Default sort by post date
                    sortedProducts.sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
            }
            
            setProduct(sortedProducts);
            // Apply filters to the sorted products
            applyFilters(sortedProducts);
            setLoading(false);
        }
    }, [sortBy]);

    // Modify the filter application to be more efficient
    const applyFilters = (productsToFilter) => {
        if (!productsToFilter) return;
        
        let filtered = [...productsToFilter];
        
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
            const priceStr = item.regular_price.toString().replace(/[^\d.-]/g, '');
            const price = parseFloat(priceStr) || 0;
            return price >= priceRange.min && price <= priceRange.max;
        });
        
        setFilteredProducts(filtered);
    };

    // Consolidate all filter changes into a single effect
    useEffect(() => {
        if (product) {
            applyFilters(product);
        }
    }, [selectedFinish, selectedColours, priceRange.min, priceRange.max]);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const handleOpenDialog = () => setOpenDialog(!openDialog);

    // Modify the filter handlers to use the new URL param system
    const handleFinishFilter = (finishItem) => {
        const newFinish = selectedFinish.includes(finishItem)
            ? selectedFinish.filter(item => item !== finishItem)
            : [...selectedFinish, finishItem];
        setSelectedFinish(newFinish);
    };

    const handleColourFilter = (colourItem) => {
        const newColours = selectedColours.includes(colourItem)
            ? selectedColours.filter(item => item !== colourItem)
            : [...selectedColours, colourItem];
        setSelectedColours(newColours);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts ? filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct) : [];

    return (
        <>
            {
                loading &&
                <div className='w-full h-svh fixed top-0 left-0 bg-black/90 z-50 flex justify-center items-center'>
                    <Spinner color='white' className="h-12 w-12" />
                </div>
            }
            <div className="flex flex-col lg:flex-row container mx-auto justify-between items-start gap-10 pt-8 relative px-4">
                <aside className='w-full lg:w-4/12 xl:w-3/12 flex flex-col justify-start items-start relative top-3'>
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
                                            onClick={() => handleFinishFilter(item)}
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
                                            onClick={() => handleColourFilter(item)}
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
                            <a href={"/product-category/brands/" + slug}>
                                {slug}
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
                                <ProductCard key={item.ID} onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
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