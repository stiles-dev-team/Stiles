import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import MultiRangeSlider from "multi-range-slider-react";
import { useSearchParams } from 'react-router-dom';

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
import { Helmet } from 'react-helmet';
import { toast } from 'sonner';

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

const ProductCategory = () => {

    const { slug } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [productsPerPage, setProductsPerPage] = useState(15);
    const [retryCount, setRetryCount] = useState(0);

    const handlePageChange = (pageNumber) => {
        setLoading(true);
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Add useEffect to clear loading state after page change
    useEffect(() => {
        if (loading) {
            // Small delay to ensure smooth transition
            const timer = setTimeout(() => {
                setLoading(false);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [currentPage, loading]);

    const handleProductsPerPageChange = (value) => {
        setProductsPerPage(parseInt(value));
        setCurrentPage(1); // Reset to first page when changing items per page
        setLoading(true);
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
            <meta name="description" content="Stiles Product Category" />
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

export default ProductCategory

const Hero = ({slug}) => {

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

const Content = ({slug, currentPage, productsPerPage, onPageChange, loading, setLoading, onProductsPerPageChange }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [product, setProduct] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

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
    const [brands, setBrands] = useState([]);
    
    // Initialize selected filters from URL params
    const [selectedFinish, setSelectedFinish] = useState(searchParams.get('finish')?.split(',') || []);
    const [selectedColours, setSelectedColours] = useState(searchParams.get('colours')?.split(',') || []);
    const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brands')?.split(',') || []);
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

    // Modify the initial data loading effect to be more efficient
    useEffect(() => {
        if (!dataSlug?.name) return;
        
        setLoading(true);
        const fetchProducts = async () => {
            try {
                // Calculate offset based on current page and products per page
                const offset = (currentPage - 1) * productsPerPage;
                
                // Build query parameters for filters
                const queryParams = new URLSearchParams({
                    category: dataSlug.name,
                    limit: productsPerPage,
                    offset: offset,
                    _: new Date().getTime()
                });

                // Add all filter parameters at once
                if (selectedBrands.length > 0) {
                    queryParams.append('brands', selectedBrands.join(','));
                }
                if (selectedFinish.length > 0) {
                    queryParams.append('finish', selectedFinish.join(','));
                }
                if (selectedColours.length > 0) {
                    queryParams.append('colours', selectedColours.join(','));
                }
                if (priceRange.min > 0) {
                    queryParams.append('min_price', priceRange.min);
                }
                if (priceRange.max > 0) {
                    queryParams.append('max_price', priceRange.max);
                }
                if (sortBy) {
                    queryParams.append('sort', sortBy);
                }

                // Log the request URL for debugging
                const requestUrl = `https://stiles.co.za/api/products.php?${queryParams.toString()}`;
                console.log('Fetching products from:', requestUrl);
                
                const res = await fetch(requestUrl, {
                    headers: {
                        'Accept-Encoding': 'gzip, deflate',
                        'Accept': 'application/json',
                        'Connection': 'keep-alive'
                    },
                    cache: 'no-store',
                    credentials: 'omit'
                });
                
                if (!res.ok) {
                    console.error('HTTP Error:', res.status, res.statusText);
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                
                // Get the response as text first
                const text = await res.text();
                
                // Try to parse the response
                let data;
                try {
                    // Clean the response text before parsing
                    const cleanText = text.trim();
                    data = JSON.parse(cleanText);
                } catch (e) {
                    console.error('JSON Parse Error:', e);
                    
                    // If we get a parse error and haven't retried too many times
                    if (retryCount < 3) {
                        console.log(`Retrying... Attempt ${retryCount + 1}`);
                        setRetryCount(prev => prev + 1);
                        return;
                    }
                    
                    throw new Error('Invalid JSON response from server');
                }
                
                // Validate the response structure
                if (!data || typeof data !== 'object') {
                    console.error('Invalid response format:', data);
                    throw new Error('Invalid response format');
                }
                
                if (data.status !== 'success' || !Array.isArray(data.data)) {
                    console.error('Invalid response structure:', data);
                    throw new Error('Invalid response structure');
                }
                
                // Process the data
                const selectedProducts = data.data;
                
                if (selectedProducts.length === 0) {
                    console.log('No products found for category:', dataSlug.name);
                    setProduct([]);
                    setTotalCount(0);
                    setLoading(false);
                    return;
                }
                
                // Set the product list and total count
                setProduct(selectedProducts);
                setTotalCount(data.total_count || 0);
                
                // Calculate price ranges only if we don't have them yet
                if (minPrice === 0 && maxPrice === 0) {
                    const prices = selectedProducts
                        .map(item => item.price?.regular)
                        .filter(price => !isNaN(price) && price > 0);
            
                    const newMinPrice = prices.length ? Math.min(...prices) : 0;
                    const newMaxPrice = prices.length ? Math.max(...prices) : 0;
            
                    // Initialize price range from URL params or calculated values
                    const urlMinPrice = searchParams.get('minPrice');
                    const urlMaxPrice = searchParams.get('maxPrice');
                    
                    setMinPrice(newMinPrice);
                    setMaxPrice(newMaxPrice);
                    set_minValue(urlMinPrice ? parseFloat(urlMinPrice) : newMinPrice);
                    set_maxValue(urlMaxPrice ? parseFloat(urlMaxPrice) : newMaxPrice);
                    setPriceRange({ 
                        min: urlMinPrice ? parseFloat(urlMinPrice) : newMinPrice, 
                        max: urlMaxPrice ? parseFloat(urlMaxPrice) : newMaxPrice 
                    });
                }

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
        
                setRetryCount(0); // Reset retry count on success
                setLoading(false);
                
            } catch (err) {
                console.error('Error fetching products:', err);
                
                // If we get a fetch error and haven't retried too many times
                if (retryCount < 3) {
                    console.log(`Retrying... Attempt ${retryCount + 1}`);
                    setRetryCount(prev => prev + 1);
                    return;
                }
                
                toast.error('Failed to load products. Please try again later.');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [dataSlug, currentPage, productsPerPage, retryCount, selectedBrands, selectedFinish, selectedColours, priceRange, sortBy]);

    // Add a small delay to the loading state to prevent flickering
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                setLoading(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    useEffect(() => {
        fetch(`/data/categories.json`)
        .then(res => res.json())
        .then(data => {
            const selectedData = data.filter(item => item.slug === slug);
            setDataSlug(selectedData[0]);
        })
        .catch(err => console.log(err));
    }, [slug]);

    // Modify the price range handling to reset to first page when price changes
    const handleInput = (e) => {
        const newMinValue = e.minValue;
        const newMaxValue = e.maxValue;
        
        if (newMinValue !== minValue || newMaxValue !== maxValue) {
            set_minValue(newMinValue);
            set_maxValue(newMaxValue);
            setPriceRange({ min: newMinValue, max: newMaxValue });
            setCurrentPage(1);
        }
    };

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
        
        // Apply brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(item => 
                selectedBrands.some(brand => item.brands?.includes(brand))
            );
        }
        
        // Apply finish filter
        if (selectedFinish.length > 0) {
            filtered = filtered.filter(item => 
                selectedFinish.some(finish => item.finish?.includes(finish))
            );
        }
        
        // Apply colour filter
        if (selectedColours.length > 0) {
            filtered = filtered.filter(item => 
                selectedColours.some(colour => item.colour?.includes(colour))
            );
        }
        
        // Apply price filter
        filtered = filtered.filter(item => {
            const price = item.price.regular;
            return price >= priceRange.min && price <= priceRange.max;
        });
        
        setFilteredProducts(filtered);
    };

    // Update URL when filters change
    useEffect(() => {
        updateUrlParams({
            brands: selectedBrands,
            finish: selectedFinish,
            colours: selectedColours,
            sort: sortBy,
            minPrice: priceRange.min,
            maxPrice: priceRange.max,
            perPage: productsPerPage,
            page: currentPage
        });
    }, [selectedBrands, selectedFinish, selectedColours, sortBy, priceRange, productsPerPage, currentPage]);

    // Consolidate all filter changes into a single effect
    useEffect(() => {
        if (product) {
            applyFilters(product);
        }
    }, [selectedFinish, selectedColours, selectedBrands, priceRange.min, priceRange.max]);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const handleOpenDialog = () => setOpenDialog(!openDialog);

    // Modify the filter handlers to reset to first page when filters change
    const handleFinishFilter = (finishItem) => {
        setSelectedFinish(prev => 
            prev.includes(finishItem)
                ? prev.filter(item => item !== finishItem)
                : [...prev, finishItem]
        );
        setCurrentPage(1);
    };

    const handleColourFilter = (colourItem) => {
        setSelectedColours(prev => 
            prev.includes(colourItem)
                ? prev.filter(item => item !== colourItem)
                : [...prev, colourItem]
        );
        setCurrentPage(1);
    };

    const handleBrandFilter = (brandItem) => {
        setSelectedBrands(prev => 
            prev.includes(brandItem)
                ? prev.filter(item => item !== brandItem)
                : [...prev, brandItem]
        );
        setCurrentPage(1);
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
                    <Accordion open={open === 1} icon={<Icon id={1} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(1)}>Brands</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {
                                    brands.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedBrands.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => handleBrandFilter(item)}
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
                            <a href={"/product-category/" + slug}>
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
                            product && product.map((item, index) => (
                                <ProductCard key={item.id} onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
                            ))
                        }
                    </div>
                    <CircularPagination
                        totalItems={totalCount}
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