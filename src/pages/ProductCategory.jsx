import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
import { FaHeart } from "react-icons/fa";

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
import { useParams } from 'react-router-dom';

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

const Content = ({slug, currentPage, productsPerPage, onPageChange, loading, setLoading }) => {

    const [open, setOpen] = useState(0);
    const [openDialog, setOpenDialog] = useState(false);

    const [product, setProduct] = useState(null);

    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    const [dataSlug, setDataSlug] = useState(null);

    useEffect(() => {
        fetch(`/data/categories.json`)
        .then(res => res.json())
        .then(data => {
            const selectedData = data.filter(item => item.slug === slug);
            setDataSlug(selectedData[0]);
        })
        .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        setLoading(true);
        fetch(`/data/products2.json`)
        .then(res => res.json())
        .then(data => {
            const selectedProducts = data.filter(item => item.product_cat.includes(dataSlug?.name));
            setProduct(selectedProducts);

            const prices = selectedProducts
                .map(item => parseFloat(item.regular_price))
                .filter(price => !isNaN(price));

            const minPrice = prices.length ? Math.min(...prices) : 0;
            const maxPrice = prices.length ? Math.max(...prices) : 0;

            setMinPrice(minPrice);
            setMaxPrice(maxPrice);

            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        });
    }, [dataSlug, currentPage]);

    useEffect(() => {
        if (product) {
            setLoading(false);
        }
    }, [product]);

    const handleOpen = (value) => setOpen(open === value ? 0 : value);

    const handleOpenDialog = () => setOpenDialog(!openDialog);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(value);
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = product ? product.slice(indexOfFirstProduct, indexOfLastProduct) : [];

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
                    <Accordion open={open === 2} icon={<Icon id={2} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(2)}>Price</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='w-full pt-4 pb-2'>
                                <Slider defaultValue={50} />
                            </div>
                            <div className='w-full flex flex-row justify-between items-center gap-2'>
                                <p className='text-gray-500'>{formatCurrency(minPrice)}</p>
                                <p className='text-gray-500'>{formatCurrency(maxPrice)}</p>
                            </div>
                        </AccordionBody>
                    </Accordion>
                    <Accordion open={open === 3} icon={<Icon id={3} open={open} />}>
                        <AccordionHeader className='font-medio text-lg lg:text-xl text-dark text-left border-b border-b-[#cfcfcf] w-full pb-3 tracking-tight' onClick={() => handleOpen(3)}>Finish</AccordionHeader>
                        <AccordionBody className="py-1 px-1">
                            <div className='flex flex-row flex-wrap w-full justify-start items-center gap-2 py-2'>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>GLOSS</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>MATT</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>NATURAL</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>POLISHED</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>SATIN</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>SHINY</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>SOFT GRIP</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>COMFORT</p>
                                <p className='bg-[#F2F2F2] hover:bg-dark text-dark hover:text-white transition-all py-1.5 px-4 rounded text-center cursor-pointer'>GLASS</p>
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
                        <Select label="Sort By">
                            <Option value="preestablecido">Default</Option>
                            <Option value="asc">Latest</Option>
                            <Option value="desc">Popularity</Option>
                            <Option value="nuev">Price: Low to High</Option>
                            <Option value="vend">Price: High to Low</Option>
                        </Select>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5 w-full relative">
                        {
                            currentProducts.map((item, index) => (
                                <ProductCard key={index} onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
                            ))
                        }
                    </div>
                    <CircularPagination
                        totalItems={product ? product.length : 0}
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