import React, { useEffect, useState } from 'react'
import LayoutDark from '../layout/LayoutDark'

import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";

import { FaFacebook, FaFacebookF, FaInstagram, FaPinterest, FaPinterestP, FaTwitter, FaWhatsapp, FaX, FaXTwitter } from 'react-icons/fa6';
import { RiHandbagLine } from 'react-icons/ri';

import {
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel,
    Spinner,
  } from "@material-tailwind/react";

  import {
    Accordion,
    AccordionHeader,
    AccordionBody,
  } from "@material-tailwind/react";

  import { Splide, SplideSlide } from '@splidejs/react-splide';
  import '@splidejs/react-splide/css';
import ProductCard from '../components/ProductCard';
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

const Product = () => {

    const { id } = useParams();
    
    const [activeTab, setActiveTab] = useState("desc");
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [imageSelected, setImageSelected] = useState(0);

    const [related, setRelated] = useState([]);

    useEffect(() => {
        fetch(`/data/products2.json`)
        .then(res => res.json())
        .then(data => {
            const product = data.find(item => item.slug === id);
            if (product) {
                const images = product.images.split('|').map(imageBlock => {
                    const [url, alt, title, desc, caption] = imageBlock.split('!').map(str => str.split(':').pop().trim());
                    return { url, alt, title, desc, caption };
                });
                product.images = images;
            }
            setProduct(product);
            console.log(product);
            
            fetch(`/data/products2.json`)
            .then(res => res.json())
            .then(data => {
            const selectedData = data.filter(item => item.brands === product.brands && item.slug !== product.slug);
                // Shuffle the array
                const shuffledData = selectedData.sort(() => 0.5 - Math.random());
                // Get the first 30 items
                const selectedProducts = shuffledData.slice(0, 10);
                setRelated(selectedProducts);
                console.log(selectedProducts);
            })
            .catch(err => {
                console.log(err);
            });
            setLoading(false);
        })
        .catch(err => {
            console.log(err);
            setLoading(false);
        });
    }, [id]);

    const data = [
        {
            label: "Description",
            value: "desc",
            desc: [
                "Brand: Essence",
                "Range/Collection: Torino",
                "Tile Type/Madre From: Porcelain",
                "Spec: PEI 3 / Glazed / White Body",
                "Sizes Available: 600x1200mm",
                "Look: Marble",
                "Finish/Texture: Polished (R9 - low slip potential in dry conditions; high slip potential in wet conditions)",
                "Number of Faces: 4",+
                "Application: Floor & Wall",
                "Area: Indoor & Outdoor",
                "Country of Origin: Italy",
                "Recommended Grout Width: 3mm",
                "Recommended Adhesive: Mapei Keraflex Maxi S1",
            ],
        },
        {
            label: "Product Details",
            value: "additional",
            desc: [
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla varius magna a consequat pulvinar. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla varius magna a consequat pulvinar. ",
            ],
        },
        {
            label: "Stock Disclaimer",
            value: "stock",
            desc: [
                "Placing an item in your shopping cart or on your quote does not reserve that item or price. We only reserve stock for your order once payment is received.",
            ],
        },
    ];

    const [open, setOpen] = useState(0);
 
  const handleOpen = (value) => setOpen(open === value ? 0 : value);

  return (
    <LayoutDark>
        <div className='container mx-auto flex flex-col lg:flex-row justify-between items-start gap-10 pt-20 lg:pt-40 pb-20 px-4'>
            <div className='w-full lg:w-6/12 flex flex-col lg:flex-row justify-start items-center gap-2'>
                <img src={product?.images[imageSelected].url} alt={product?.images[imageSelected].alt} title={product?.images[imageSelected].title} className='w-full lg:w-10/12 aspect-square object-cover object-center rounded-md' />
                <div className="flex flex-row lg:flex-col justify-start items-start gap-2">
                    {product?.images.map((image, index) => (
                        <img onClick={() => setImageSelected(index)} key={index} src={image.url} alt={image.alt} title={image.title} className={`w-10 lg:w-14 aspect-square object-cover object-center rounded-md cursor-pointer transition-all ${imageSelected == index ? "opacity-100 border border-dark" : "opacity-60 border border-white hover:opacity-100 hover:border-dark/50"}`} />
                    ))}
                </div>
            </div>
            <div className='w-full lg:w-6/12 flex flex-col justify-start items-start gap-1'>
                <h1 className='font-bold text-xl'>{product?.title}</h1>
                <p className='text-dark/60'><span className='text-dark font-bold'>SKU:</span> {product?.sku}</p>
                <div className="flex flex-row justify-start items-end gap-2">
                    {
                        product?.sale_price  == "" ?
                        <p className='text-dark text-2xl'>R{product?.regular_price} m2</p>
                        :
                        <>
                            <p className='text-[#B3B3B3] line-through text-2xl'>R{product?.regular_price}</p>
                            <p className='text-dark text-2xl'>R{product?.sale_price} m2</p>
                        </>
                    }
                </div>
                {/* <p className='italic text-[#B3B3B3]'>(R935.61 per box of tiles)</p> */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full ">
                    <div className='flex flex-row justify-start items-center gap-1 font-normal'>
                        Brand:
                        <a href={"/product-category/brands/" + product?.brands} className='text-dark underline font-bold'>{product?.brands}</a>
                        {/* <img src="/images/partner.png" alt="" className='size-20 object-contain object-center' /> */}
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
                <div className="productdesc flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full pb-5">
                    <div dangerouslySetInnerHTML={{ __html: product?.description }} />
                </div>
                <div className='flex flex-col lg:flex-row justify-start items-center gap-2 w-full lg:pb-2'>
                    <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                        <button className='text-dark font-negro aspect-square w-7'>-</button>
                        <input type="text" className=' border-0 appearance-none text-dark text-center w-16 outline-none' min={1} value={1} />
                        <button className='text-dark font-negro aspect-square w-7'>+</button>
                    </div>
                    <button className='text-xs bg-primary text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold w-full flex-1'>
                        ADD TO CART
                        <RiHandbagLine className='fill-whtie' size={14} />
                    </button>
                    <div className={`rounded-full hidden lg:flex justify-center items-center z-10 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 bg-secondary/10`}>
                        <FaHeart size={20} className={`transition-all fill-dark`} />
                    </div>
                </div>
                <button className='w-full text-xs bg-[#EBEBEB] text-dark rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase lg:mb-1'>
                Technical Specifications
                </button>
                <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
                    <button className='w-full text-xs bg-dark text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase'>
                    View this in your room
                    </button>
                    <button className='w-full text-xs bg-dark text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase'>
                    View in 3D
                    </button>

                </div>
            </div>
        </div>
        <div className="container mx-auto pb-20 hidden lg:block">
            <Tabs value={activeTab}>
                <TabsHeader
                    className="rounded-none border-b border-blue-gray-50 bg-transparent p-0 w-fit mx-auto"
                    indicatorProps={{
                    className:
                        "bg-transparent border-b-2 border-gray-900 shadow-none rounded-none",
                    }}
                >
                    {data.map(({ label, value }) => (
                    <Tab
                        key={value}
                        value={value}
                        onClick={() => setActiveTab(value)}
                        className={activeTab === value ? "text-gray-900 font-bold transition-all w-fit px-5" : " transition-all w-fit text-secondary px-5"}
                    >
                        {label}
                    </Tab>
                    ))}
                </TabsHeader>
                <TabsBody>
                    {data.map(({ value, desc }) => (
                    <TabPanel key={value} value={value}>
                        {
                            desc.length > 1 ? 
                            <ul className='columns-2'>
                                {
                                    desc.map((d, i) => (
                                        <li key={i} className='text-dark'>{d}</li>
                                    ))
                                }
                            </ul>
                            :
                            <p className='text-dark'>{desc[0]}</p>
                        }
                    </TabPanel>
                    ))}
                </TabsBody>
            </Tabs>
        </div>
        <div className="container mx-auto pb-20 lg:hidden px-4">
            {
                data.map(({ label, value, desc, index }) => (
                    <Accordion key={value} open={open === index} icon={<Icon id={index} open={open} />}>
                        <AccordionHeader onClick={() => handleOpen(index)}>{label}</AccordionHeader>
                        <AccordionBody>
                            {
                                desc.length > 1 ? 
                                <ul className='columns-2'>
                                    {
                                        desc.map((d, i) => (
                                            <li key={i} className='text-dark'>{d}</li>
                                        ))
                                    }
                                </ul>
                                :
                                <p className='text-dark'>{desc[0]}</p>
                            }
                        </AccordionBody>
                    </Accordion>
                ))
            }
        </div>
        <div className="container mx-auto pb-20 px-4">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Related Products</h2>
            <br />
            <Splide options={{
                perPage: 4,
                gap: '1rem',
                pagination: false,
                breakpoints: {
                    640: {
                        perPage: 1,
                        padding: "2rem",
                    },
                    768: {
                        perPage: 2,
                        padding: "2rem",
                    },
                    1024: {
                        perPage: 3,
                    },
                }
            }}>
                    {
                        related.map((item) => (
                            <SplideSlide>
                                <ProductCard key={item.ID} onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
                            </SplideSlide>
                        ))
                    }
            </Splide>
        </div>
        <SubscribeBanner />
    </LayoutDark>
  )
}

export default Product



const SubscribeBanner = () => {
    const [email, setEmail] = useState("");
    const onChange = ({ target }) => setEmail(target.value);
  
    return (
      <section className='w-full py-20 lg:py-32 px-4 flex flex-col justify-center items-center bg-[url("/images/bannerhome.png")] bg-cover bg-center relative'>
        <div className='bg-black/40 w-full h-full absolute top-0 left-0 z-0'></div>
        <div className='flex flex-col justify-center items-center gap-6 w-full max-w-5xl z-10 relative'>
          <p className='text-lg leading-tight lg:text-4xl font-medium text-white text-center'>Subscribe to our weekly newsletter to get the latest updates and amazing offers delivered in your inbox</p>
          <div className='relative w-full max-w-[460px] flex justify-center items-center'>
            <input type="mail" className='w-full h-12 pl-3 pr-24 rounded-full lg:rounded z-0 placeholder:text-sm lg:placeholder:text-base' placeholder='Email Address' />
            <button className='absolute right-0.5 px-4 h-[42px] hover:bg-primary bg-dark hover:text-dark text-white rounded-full lg:rounded-md text-sm font-bold uppercase transition-all'>Subscribe</button>
          </div>
        </div>
      </section>
    )
  }