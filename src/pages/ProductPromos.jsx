import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import MultiRangeSlider from "multi-range-slider-react";

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

const ProductPromos = () => {

    const { slug } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const productsPerPage = 15;

    const handlePageChange = (pageNumber) => {
        setLoading(true);
        setCurrentPage(pageNumber);
    };

  return (
    <Layout>
        <Hero slug={slug} />
        <Content slug={slug} currentPage={currentPage} productsPerPage={productsPerPage} onPageChange={handlePageChange} loading={loading} setLoading={setLoading} />
    </Layout>
  )
}

export default ProductPromos

const Hero = ({slug}) => {

    return (
      <section id='heroHome' className='w-full h-[60vh] bg-[url("/images/bannerhome.png")] relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>PROMOS / STILES</h1>
        </div>
      </section>
    )
}

const Content = ({slug, currentPage, productsPerPage, onPageChange, loading, setLoading }) => {

    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);

    const [product, setProduct] = useState(null);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const [minValue, set_minValue] = useState(0);
    const [maxValue, set_maxValue] = useState(0);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 0 });

    const [dataSlug, setDataSlug] = useState(null);

    const [sortBy, setSortBy] = useState('asc');

    const [gridView, setGridView] = useState(true);

    const [colours, setColours] = useState([]);
    const [finish, setFinish] = useState([]);
    
    // Add state for selected filters
    const [selectedFinish, setSelectedFinish] = useState([]);
    const [selectedColours, setSelectedColours] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState(null);

    useEffect(() => {
        setLoading(true);
        fetch(`/data/products2.json`)
        .then(res => res.json())
        .then(data => {
            const selectedProducts = data
                .filter(item => item.sale_price > 0 && item.status === 'publish')
                .sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
            
            // Set the original product list
            setProduct(selectedProducts);
            
            // Initially set filtered products to all products
            setFilteredProducts(selectedProducts);
    
            // Calculate price ranges
            const prices = selectedProducts
                .map(item => parseFloat(item.regular_price))
                .filter(price => !isNaN(price));
    
            const minPrice = prices.length ? Math.min(...prices) : 0;
            const maxPrice = prices.length ? Math.max(...prices) : 0;
    
            // Set price range values
            setMinPrice(minPrice);
            setMaxPrice(maxPrice);
            set_minValue(minPrice);
            set_maxValue(maxPrice);
            setPriceRange({ min: minPrice, max: maxPrice });

            // Extract unique values for filters
            const colours = [...new Set(selectedProducts
                .map(item => item.colour)
                .filter(colour => colour !== ''))];
            setColours(colours);

            const finish = [...new Set(selectedProducts
                .map(item => item.finish)
                .filter(finish => finish !== ''))];
            setFinish(finish);
    
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        });
    }, [dataSlug, currentPage]);

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

    // Separate function to apply filters
    const applyFilters = (productsToFilter) => {
        if (!productsToFilter) return;
        
        setLoading(true);
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
        if (priceRange.min > 0 || priceRange.max > 0) {
            filtered = filtered.filter(item => {
                const price = parseFloat(item.regular_price) || 0;
                return price >= priceRange.min && price <= priceRange.max;
            });
        }
        
        setFilteredProducts(filtered);
        setLoading(false);
    };

    // Add useEffect to handle filtering when filters change
    useEffect(() => {
        if (product) {
            applyFilters(product);
        }
    }, [selectedFinish, selectedColours, priceRange]);

    useEffect(() => {
        if (product) {
            setLoading(false);
        }
    }, [product]);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const handleOpenDialog = () => setOpenDialog(!openDialog);

    // Add function to handle finish filter selection
    const handleFinishFilter = (finishItem) => {
        if (selectedFinish.includes(finishItem)) {
            setSelectedFinish(selectedFinish.filter(item => item !== finishItem));
        } else {
            setSelectedFinish([...selectedFinish, finishItem]);
        }
    };

    // Add function to handle colour filter selection
    const handleColourFilter = (colourItem) => {
        if (selectedColours.includes(colourItem)) {
            setSelectedColours(selectedColours.filter(item => item !== colourItem));
        } else {
            setSelectedColours([...selectedColours, colourItem]);
        }
    };

    // Add function to handle price range input
    const handleInput = (e) => {
        set_minValue(e.minValue);
        set_maxValue(e.maxValue);
        setPriceRange({ min: e.minValue, max: e.maxValue });
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
                                    onInput={(e) => {
                                        handleInput(e);
                                    }}
                                    label={true}
                                    labelColor="white"
                                    labelBackgroundColor="black"
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
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(4)}>Color</AccordionHeader>
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
                    <div className='w-full flex flex-row justify-between items-center gap-3'>
                        <div className='w-full flex flex-row justify-start items-center gap-3'>
                            <Breadcrumbs>
                                <a href="/" className="opacity-60">
                                    Home
                                </a>
                                <a href={"/promos"}>
                                    Promos
                                </a>
                            </Breadcrumbs>
                        </div>
                        <div className='hidden xl:flex flex-row justify-end items-center gap-2'>
                            <BsFillGrid3X3GapFill className={`cursor-pointer transition-all ${gridView === true ? "fill-dark" : "fill-dark/50 hover:fill-dark/70"}`} size={20} onClick={() => setGridView(true)} />
                            <BsFillGridFill  className={`cursor-pointer transition-all ${gridView === false ? "fill-dark" : "fill-dark/50 hover:fill-dark/70"}`} size={20} onClick={() => setGridView(false)} />
                        </div>
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
                    </div>
                    <div className={`grid grid-cols-1 lg:grid-cols-2 ${gridView === true ? "xl:grid-cols-3" : "xl:grid-cols-2"} gap-5 w-full relative`}>
                        {
                            currentProducts.map((item, index) => (
                                <a href={"/product/" + item.slug} key={item.id}>
                                    <ProductCard key={item.id} prod={item.slug} />
                                </a>
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