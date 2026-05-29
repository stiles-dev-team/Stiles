import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import {
    Accordion,
    AccordionHeader,
    AccordionBody,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
    Select,
    Option,
    Slider,
    Radio,
    Spinner
} from "@material-tailwind/react";
import ProductCard from '../components/ProductCard';
import { CircularPagination } from '../components/CircularPagination';
import { FaFacebook, FaFacebookF, FaInstagram, FaPinterest, FaPinterestP, FaTwitter, FaWhatsapp, FaX, FaXTwitter } from 'react-icons/fa6';
import { RiHandbagLine } from 'react-icons/ri';

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

const Shop = () => {
  return (
    <Layout>
        <Helmet>
            <title>Shop Tiles Online | Premium Tile Collection | Stiles</title>
            <meta name="description" content="Shop our extensive collection of premium tiles at Stiles. Browse bathroom tiles, kitchen tiles, floor tiles, and more. Quality tiles for every space in South Africa." />
            <meta name="keywords" content="shop tiles, buy tiles online, bathroom tiles, kitchen tiles, floor tiles, wall tiles, Stiles, South Africa" />
            <meta property="og:title" content="Shop Tiles Online | Premium Tile Collection | Stiles" />
            <meta property="og:description" content="Shop our extensive collection of premium tiles at Stiles. Browse bathroom tiles, kitchen tiles, floor tiles, and more. Quality tiles for every space in South Africa." />
            <meta property="og:type" content="website" />
            <meta property="og:url" content="https://staging.stiles.co.za/shopall" />
            <meta property="og:site_name" content="Stiles" />
            <meta property="og:locale" content="en_ZA" />
            <meta name="twitter:card" content="summary" />
            <meta name="twitter:title" content="Shop Tiles Online | Premium Tile Collection | Stiles" />
            <meta name="twitter:description" content="Shop our extensive collection of premium tiles at Stiles. Browse bathroom tiles, kitchen tiles, floor tiles, and more. Quality tiles for every space in South Africa." />
            <link rel="canonical" href="https://staging.stiles.co.za/shopall" />
        </Helmet>
        <Hero />
        <Content />
    </Layout>
  )
}

export default Shop

const Hero = () => {
    return (
      <section id='heroHome' className='w-full h-[60vh] bg-[url("/images/bannerhome.png")] relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>All Products</h1>
            <p className='text-white text-center w-full max-w-3xl'>View our Wide Range of Products. Shop Online or visit our showroom in George. Click & Collect at Store. 24/7 Customer Service. Safe & Secure.</p>
        </div>
      </section>
    )
}

const Content = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);

    const [loading, setLoading] = useState(true);
    const [allProducts, setAllProducts] = useState(null);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page')) || 1);
    const [itemsPerPage] = useState(12);
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'asc');
    const [totalCount, setTotalCount] = useState(0);

    // Fetch all products from API
    useEffect(() => {
        setLoading(true);
        const fetchProducts = async () => {
            try {
                // Calculate offset based on current page and items per page
                const offset = (currentPage - 1) * itemsPerPage;
                
                // Build query parameters
                const queryParams = new URLSearchParams({
                    limit: itemsPerPage.toString(),
                    offset: offset.toString(),
                    _: new Date().getTime().toString()
                });

                // Add sorting parameter
                if (sortBy) {
                    queryParams.set('sort', sortBy);
                }

                // Use empty category to get all products
                // The API uses LIKE '%category%', so empty string becomes '%%' which matches all
                queryParams.set('category', '');

                const requestUrl = `https://staging.stiles.co.za/api/products.php?${queryParams.toString()}`;
                
                const res = await fetch(requestUrl);
                if (!res.ok) throw new Error('Failed to fetch products');
                
                const data = await res.json();
                
                if (data.status !== 'success') {
                    throw new Error('Invalid response format');
                }

                // Transform API response to match expected format
                const transformedProducts = (data.data || []).map(product => ({
                    id: product.id || product.ID,
                    slug: product.slug,
                    status: product.status || 'publish',
                    post_date: product.post_date
                }));

                setAllProducts(transformedProducts);
                setTotalCount(data.total_count || transformedProducts.length);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching products:', err);
                toast.error('Failed to load products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, [currentPage, itemsPerPage, sortBy]);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const handleOpenDialog = () => setOpenDialog(!openDialog);

    // Update URL when sort or page changes
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);
        if (sortBy) {
            newParams.set('sort', sortBy);
        } else {
            newParams.delete('sort');
        }
        if (currentPage > 1) {
            newParams.set('page', currentPage.toString());
        } else {
            newParams.delete('page');
        }
        setSearchParams(newParams);
    }, [sortBy, currentPage]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculate pagination - products are already paginated from API
    const currentProducts = allProducts || [];

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
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(1)}>All Categories</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <ul className='flex flex-col gap-0'>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Tiles <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Taps <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Saniti Ware <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Baths <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Basins <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Mosaics <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='categories' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" onClick={() => window.location.href = '/'} label={<span className='uppercase text-base'>Pavers <span className='text-gray-500'>(134)</span></span>} />
                                </li>
                            </ul>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 2} icon={<Icon id={2} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(2)}>Price</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='w-full pt-4 pb-2'>
                                <Slider defaultValue={50} />
                            </div>
                            <p className='text-gray-500'><span className='font-semibold uppercase'>Price:</span> R50 - R1,500</p>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(3)}>Finish</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>GLOSS</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>MATT</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>NATURAL</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>POLISHED</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>SATIN</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>SHINY</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>SOFT GRIP</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>COMFORT</p>
                                <p className='bg-[#F2F2F2] hover:bg-black text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>GLASS</p>
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 4} icon={<Icon id={4} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(4)}>Color</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-3'>
                                <div title="Chocolate" data-toggle="tooltip" data-placement="top" className="bg-[#45322e] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Blanco"  data-toggle="tooltip" data-placement="top" className="bg-white border border-gray-400 size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Rojo" data-toggle="tooltip" data-placement="top" className="bg-[#C0392B] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Azul" data-toggle="tooltip" data-placement="top" className="bg-[#317CF0] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Amarillo" data-toggle="tooltip" data-placement="top" className="bg-[#FECC33] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Verde" data-toggle="tooltip" data-placement="top" className="bg-[#FECC33] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Rosa" data-toggle="tooltip" data-placement="top" className="bg-[#F5A8DC] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Naranja" data-toggle="tooltip" data-placement="top" className="bg-[#FF5733] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Beige" data-toggle="tooltip" data-placement="top" className="bg-[#E8C39E] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Morado" data-toggle="tooltip" data-placement="top" className="bg-[#652F71] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Gris" data-toggle="tooltip" data-placement="top" className="bg-[#9E9B9B] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Negro" data-toggle="tooltip" data-placement="top" className="bg-black size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Nogal" data-toggle="tooltip" data-placement="top" className="bg-[#804000] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Nogal Oscuro" data-toggle="tooltip" data-placement="top" className="bg-[#4B3621]  size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Perla" data-toggle="tooltip" data-placement="top" className="bg-[#EAE6CA]  size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Plata" data-toggle="tooltip" data-placement="top" className="bg-gradient-to-r from-[#eef2f3] to-[#8e9eab]  size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Dorado" data-toggle="tooltip" data-placement="top" className="bg-gradient-to-r from-amber-200 to-yellow-500  size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Tabaco" data-toggle="tooltip" data-placement="top" className="bg-[#6d5e4d] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Cafe" data-toggle="tooltip" data-placement="top" className="bg-[#642800] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Bronce" data-toggle="tooltip" data-placement="top" className="bg-[#cd7f32] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Menta" data-toggle="tooltip" data-placement="top" className="bg-[#20603d] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Vino" data-toggle="tooltip" data-placement="top" className="bg-[#56070C] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                                <div title="Celeste" data-toggle="tooltip" data-placement="top" className="bg-[#0CB7F2] size-7 transition-all hover:border hover:border-gray-500 cursor-pointer shadow rounded-full"></div>
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 5} icon={<Icon id={5} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(5)}>Size</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <ul className='flex flex-col gap-0'>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='size' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" label={<span className='uppercase text-base'>1000x1000</span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='size' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" label={<span className='uppercase text-base'>1000x1000</span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='size' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" label={<span className='uppercase text-base'>1000x1000</span>} />
                                </li>
                                <li className='text-sm font-normal radioCheck'>
                                    <Radio name='size' className="border-gray-900/10 bg-gray-900/5 p-0 transition-all hover:before:opacity-0" label={<span className='uppercase text-base'>1000x1000</span>} />
                                </li>
                            </ul>
                        </AccordionBody>
                    </Accordion>
                </aside>
                <div className='w-full flex flex-col justify-start items-start gap-5'>
                    <div className='w-full lg:max-w-80'>
                        <Select label="Sort By" value={sortBy} onChange={(e) => {
                            setSortBy(e);
                            setCurrentPage(1); // Reset to first page when sorting changes
                        }}>
                            <Option value="asc">Latest</Option>
                            <Option value="desc">Popularity</Option>
                            <Option value="nuev">Price: Low to High</Option>
                            <Option value="vend">Price: High to Low</Option>
                            <Option value="ascBrand">A-Z Brand</Option>
                            <Option value="descBrand">Z-A Brand</Option>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 w-full relative">
                        {
                            currentProducts && currentProducts.length > 0 ? (
                                currentProducts.map((item, index) => (
                                    <a href={"/product/" + item.slug} key={item.id || index}>
                                        <ProductCard key={item.id || index} prod={item.slug} />
                                    </a>
                                ))
                            ) : (
                                !loading && <p className="text-gray-500 col-span-full text-center py-8">No products found</p>
                            )
                        }
                    </div>
                    <CircularPagination 
                        totalItems={totalCount}
                        itemsPerPage={itemsPerPage}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                    />
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
                                <p className='text-dark text-2xl'>R2,399 m2</p>
                            </div>
                            <p className='italic text-[#B3B3B3]'>(R935.61 per box of tiles)</p>
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full ">
                                <div className='flex flex-row justify-start items-center gap-1 font-bold'>
                                    Brand:
                                    <img src="/images/partner.png" alt="" className='size-20 object-contain object-center' />
                                </div>
                                <div className='flex flex-row justify-start items-center gap-1 font-bold'>
                                    Share Item:
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'>
                                        <FaFacebookF className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'>
                                        <FaXTwitter className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'>
                                        <FaPinterestP className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'>
                                        <FaInstagram className='fill-dark group-hover:fill-white transition-all' size={18} />
                                    </div>
                                    <div className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'>
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