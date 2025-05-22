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
    Spinner
} from "@material-tailwind/react";
import ProductCard from '../components/ProductCard';
import { CircularPagination } from '../components/CircularPagination';
import { FaFacebook, FaFacebookF, FaInstagram, FaPinterest, FaPinterestP, FaTwitter, FaWhatsapp, FaX, FaXTwitter } from 'react-icons/fa6';
import { RiHandbagLine } from 'react-icons/ri';
import { useParams } from 'react-router-dom';
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
            setCurrentPage={setCurrentPage}
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

const Content = ({
    slug, 
    currentPage, 
    setCurrentPage,
    productsPerPage, 
    onPageChange, 
    loading, 
    setLoading, 
    onProductsPerPageChange 
}) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);
    const [product, setProduct] = useState(null);
    const [totalCount, setTotalCount] = useState(0);
    const [dataSlug, setDataSlug] = useState(null);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'asc');
    const [gridView, setGridView] = useState(true);

    const [colours, setColours] = useState([]);
    const [finish, setFinish] = useState([]);
    const [brands, setBrands] = useState([]);
    const [sizes, setSizes] = useState([]);
    
    // Initialize selected filters from URL params
    const [selectedFinish, setSelectedFinish] = useState(searchParams.get('finish')?.split(',').filter(Boolean) || []);
    const [selectedColours, setSelectedColours] = useState(searchParams.get('colours')?.split(',').filter(Boolean) || []);
    const [selectedBrands, setSelectedBrands] = useState(searchParams.get('brands')?.split(',').filter(Boolean) || []);
    const [selectedSizes, setSelectedSizes] = useState(searchParams.get('sizes')?.split(',').filter(Boolean) || []);
    const [filteredProducts, setFilteredProducts] = useState(null);

    // Fetch filter values when category changes
    useEffect(() => {
        if (!dataSlug?.name) return;

        const fetchFilterValues = async () => {
            try {
                const response = await fetch(`https://stiles.co.za/api/products.php?category=${encodeURIComponent(dataSlug.name)}&filters=true`);
                if (!response.ok) {
                    throw new Error('Failed to fetch filter values');
                }
                const data = await response.json();
                
                console.log('Raw API response:', data);
                
                if (data.status === 'success' && data.data) {
                    // Process the data to ensure we have arrays of unique values
                    const processValues = (values) => {
                        if (!Array.isArray(values)) {
                            // If it's a string, split by comma and process
                            if (typeof values === 'string') {
                                return values.split(',').map(v => v.trim()).filter(v => v);
                            }
                            return [];
                        }
                        // Ensure values are unique and sorted
                        return [...new Set(values)].filter(v => v && v.trim() !== '').sort();
                    };

                    // Extract and process values from the response
                    const processedData = {
                        colours: processValues(data.data.colours || []),
                        finishes: processValues(data.data.finishes || []),
                        brands: processValues(data.data.brands || []),
                        sizes: processValues(data.data.sizes || [])
                    };

                    console.log('Processed filter values:', processedData);

                    // Update state with processed values
                    setColours(processedData.colours);
                    setFinish(processedData.finishes);
                    setBrands(processedData.brands);
                    setSizes(processedData.sizes);
                }
            } catch (error) {
                console.error('Error fetching filter values:', error);
                toast.error('Failed to load filter options');
            }
        };

        fetchFilterValues();
    }, [dataSlug]);

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
                    queryParams.set('brands', selectedBrands.join(','));
                }
                if (selectedFinish.length > 0) {
                    queryParams.set('finish', selectedFinish.join(','));
                }
                if (selectedColours.length > 0) {
                    queryParams.set('colours', selectedColours.join(','));
                }
                if (selectedSizes.length > 0) {
                    queryParams.set('sizes', selectedSizes.join(','));
                }
                if (sortBy) {
                    queryParams.set('sort', sortBy);
                }

                // Log the request URL for debugging
                const requestUrl = `https://stiles.co.za/api/products.php?${queryParams.toString()}`;
                console.log('Fetching products with URL:', requestUrl);
                
                const res = await fetch(requestUrl);
                if (!res.ok) throw new Error('Failed to fetch products');
                
                const data = await res.json();
                if (data.status !== 'success') throw new Error('Invalid response format');
                
                setProduct(data.data);
                setTotalCount(data.total_count || 0);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                toast.error('Failed to load products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [dataSlug, currentPage, productsPerPage, selectedBrands, selectedFinish, selectedColours, selectedSizes, sortBy]);

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
            filtered = filtered.filter(item => {
                const itemBrands = item.brands?.split(',').map(b => b.trim()) || [];
                return selectedBrands.some(brand => itemBrands.includes(brand));
            });
        }
        
        // Apply finish filter
        if (selectedFinish.length > 0) {
            filtered = filtered.filter(item => {
                const itemFinishes = item.finish?.split(',').map(f => f.trim()) || [];
                return selectedFinish.some(finish => itemFinishes.includes(finish));
            });
        }
        
        // Apply colour filter
        if (selectedColours.length > 0) {
            filtered = filtered.filter(item => {
                const itemColours = item.colour?.split(',').map(c => c.trim()) || [];
                return selectedColours.some(colour => itemColours.includes(colour));
            });
        }
        
        // Apply size filter - recreated exactly like other filters
        if (selectedSizes.length > 0) {
            filtered = filtered.filter(item => {
                const itemSizes = item.size?.split(',').map(s => s.trim()) || [];
                return selectedSizes.some(size => itemSizes.includes(size));
            });
        }
        
        console.log('Filtered products:', {
            total: filtered.length,
            selectedBrands,
            selectedFinish,
            selectedColours,
            selectedSizes
        });
        
        setFilteredProducts(filtered);
    };

    // Update URL when filters change
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);
        
        // Update each parameter
        if (selectedBrands.length > 0) {
            newParams.set('brands', selectedBrands.join(','));
        } else {
            newParams.delete('brands');
        }

        if (selectedFinish.length > 0) {
            newParams.set('finish', selectedFinish.join(','));
        } else {
            newParams.delete('finish');
        }

        if (selectedColours.length > 0) {
            newParams.set('colours', selectedColours.join(','));
        } else {
            newParams.delete('colours');
        }

        if (selectedSizes.length > 0) {
            newParams.set('sizes', selectedSizes.join(','));
        } else {
            newParams.delete('sizes');
        }

        if (sortBy) {
            newParams.set('sort', sortBy);
        } else {
            newParams.delete('sort');
        }

        newParams.set('perPage', productsPerPage.toString());
        newParams.set('page', currentPage.toString());
        
        setSearchParams(newParams);
    }, [selectedBrands, selectedFinish, selectedColours, selectedSizes, sortBy, productsPerPage, currentPage]);

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
        console.log('Selected brand:', brandItem);
        setSelectedBrands(prev => {
            const newBrands = prev.includes(brandItem)
                ? prev.filter(item => item !== brandItem)
                : [...prev, brandItem];
            console.log('Updated brands:', newBrands);
            return newBrands;
        });
        setCurrentPage(1);
    };

    const handleSizeFilter = (sizeItem) => {
        setLoading(true); // Set loading state when filter changes
        setSelectedSizes(prev => 
            prev.includes(sizeItem)
                ? prev.filter(item => item !== sizeItem)
                : [...prev, sizeItem]
        );
        setCurrentPage(1);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts ? filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct) : [];

    // Add this console log before the return statement to debug the state values
    console.log('Current filter states:', {
        brands,
        finish,
        colours,
        sizes,
        selectedBrands,
        selectedFinish,
        selectedColours,
        selectedSizes
    });

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
                                {Array.isArray(brands) && brands.length > 0 ? (
                                    brands.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedBrands.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => handleBrandFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No brands available</p>
                                )}
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(3)}>Finish</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {Array.isArray(finish) && finish.length > 0 ? (
                                    finish.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedFinish.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => handleFinishFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No finishes available</p>
                                )}
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 4} icon={<Icon id={4} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(4)}>Colour</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {Array.isArray(colours) && colours.length > 0 ? (
                                    colours.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedColours.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => handleColourFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No colours available</p>
                                )}
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 5} icon={<Icon id={5} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(5)}>Size</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                {Array.isArray(sizes) && sizes.length > 0 ? (
                                    sizes.map((item, index) => (
                                        <p 
                                            key={index} 
                                            className={`${selectedSizes.includes(item) ? 'bg-dark text-white' : 'bg-[#F2F2F2] text-dark hover:bg-dark hover:text-white'} transition-all py-1.5 px-4 rounded text-center cursor-pointer`}
                                            onClick={() => handleSizeFilter(item)}
                                        >
                                            {item}
                                        </p>
                                    ))
                                ) : (
                                    <p className="text-gray-500">No sizes available</p>
                                )}
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