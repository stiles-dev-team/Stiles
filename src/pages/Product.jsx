import React, { useEffect, useState } from 'react'
import LayoutDark from '../layout/LayoutDark'
import axios from 'axios';
import { Helmet } from 'react-helmet';

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
import { toast } from 'sonner';
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

const Product = () => {

    const { id } = useParams();
    
    const [activeTab, setActiveTab] = useState("desc");
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [imageSelected, setImageSelected] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const [isFavourite, setIsFavourite] = useState(false);
    const [stockInfo, setStockInfo] = useState(null);

    const [related, setRelated] = useState([]);
    
    // Get current URL for sharing
    const currentUrl = window.location.href;
    const productTitle = product?.title || 'Check out this product';
    const productImage = product?.images[0]?.url || '';
    const productDescription = product?.description?.replace(/<[^>]*>/g, '').substring(0, 100) || '';

    // Share functions
    const shareOnFacebook = () => {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareOnTwitter = () => {
        const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(productTitle)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareOnPinterest = () => {
        const url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(productImage)}&description=${encodeURIComponent(productTitle)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    const shareOnInstagram = () => {
        // Instagram doesn't have a direct share URL, so we'll copy the product URL to clipboard
        navigator.clipboard.writeText(currentUrl);
        toast.success('Product URL copied to clipboard! Share it on Instagram');
    };

    const shareOnWhatsApp = () => {
        const url = `https://wa.me/?text=${encodeURIComponent(`${productTitle} ${currentUrl}`)}`;
        window.open(url, '_blank', 'width=600,height=400');
    };

    useEffect(() => {
        fetch(`/data/products2.json`)
        .then(res => res.json())
        .then(data => {
            const product = data.find(item => item.slug === id);
            if (product) {
                const images = product.images.split(',').map(imageBlock => {
                    const [url, alt, title, desc, caption] = imageBlock.split('!').map(str => str.split(':').pop().trim());
                    return { url, alt, title, desc, caption };
                });
                product.images = images;

                // Fetch stock information with Basic Auth
                const username = 'WebUser1142';
                const password = 'e$Ye6!g]I~X@K!D';
                const authHeader = 'Basic ' + btoa(username + ':' + password);

                axios.get(`http://102.37.48.148:5006/Stock/GetByCode?code=${product.sku}`, {
                    headers: {
                        'Authorization': authHeader,
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => {
                    setStockInfo(response.data);
                    console.log(response.data);
                })
                .catch(err => {
                    console.error('Error fetching stock:', err);
                });
            }
            setProduct(product);
            
            // Check if product is in wishlist
            const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
            setIsFavourite(wishlist.some(item => item.slug === id));
            
            fetch(`/data/products2.json`)
            .then(res => res.json())
            .then(data => {
                if (product) {
                    const selectedData = data.filter(item => item.brands === product.brands && item.slug !== product.slug);
                    const shuffledData = selectedData.sort(() => 0.5 - Math.random());
                    const selectedProducts = shuffledData.slice(0, 10);
                    setRelated(selectedProducts);
                }
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

    const handleQuantityChange = (increment) => {
        setQuantity(prev => Math.max(1, prev + increment));
    };

    const handleQuantityInput = (e) => {
        const value = parseInt(e.target.value);
        if (!isNaN(value)) {
            setQuantity(Math.max(1, value));
        }
    };

    const addToCart = () => {
        if (!product) return;

        const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
        const existingItemIndex = cart.findIndex(item => item.slug === product.slug);
        
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
        } else {
            cart.push({
                ...product,
                quantity: quantity
            });
        }
        
        localStorage.setItem('stiles_cart_ls', JSON.stringify(cart));
        toast.success(`${product.title} x ${quantity} added to cart`);
    };

    const toggleWishlist = () => {
        if (!product) return;

        const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
        const newIsFavourite = !isFavourite;
        setIsFavourite(newIsFavourite);
        
        if (newIsFavourite) {
            if (!wishlist.some(item => item.slug === product.slug)) {
                wishlist.push({
                    ...product,
                    dateAdded: new Date().toISOString()
                });
                toast.success(`${product.title} added to wishlist`);
            }
        } else {
            const index = wishlist.findIndex(item => item.slug === product.slug);
            if (index !== -1) {
                wishlist.splice(index, 1);
                toast.error(`${product.title} removed from wishlist`);
            }
        }
        
        localStorage.setItem('stiles_wishlist_ls', JSON.stringify(wishlist));
    };

    const data = [
        {
            label: "Description",
            value: "desc",
            desc: product?.details ? product.details.split('|n|').map((line, index) => {
                // Convert text inside strong/b tags to bold font weight
                const formattedLine = line.replace(/<(strong|b)>(.*?)<\/\1>/g, '<span class="font-bold">$2</span>');
                return <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
            }) : [],
        },
        {
            label: "Product Details",
            value: "additional",
            desc: [
                <div className='productdesc' dangerouslySetInnerHTML={{ __html: product?.description?.replace(/\[.*?\]/g, '').split('|n|').join(' ') || "No product details available" }} />
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
        <Helmet>
            <title>{product?.title ? `${product.title} | Stiles` : 'Stiles'}</title>
            <meta name="description" content={product?.metadesc || ''} />
            <meta property="og:image" content={product?.images?.[0]?.url || ''} />
            <meta property="og:title" content={product?.title || 'Stiles'} />
            <meta property="og:description" content={product?.metadesc || ''} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:type" content="product" />
            <meta property="og:site_name" content="Stiles" />
            <meta property="og:locale" content="en_ZA" />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={product?.title || 'Stiles'} />
        </Helmet>
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
                        <p className='text-dark text-2xl'>{formatPriceWithUnit(product?.regular_price, getPricingUnit(product))}</p>
                        :
                        <>
                            <p className='text-[#B3B3B3] line-through text-2xl'>{formatPriceWithUnit(product?.regular_price, getPricingUnit(product))}</p>
                            <p className='text-dark text-2xl'>{formatPriceWithUnit(product?.sale_price, getPricingUnit(product))}</p>
                        </>
                    }
                </div>
                {/* <p className='italic text-[#B3B3B3]'>(R935.61 per box of tiles)</p> */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full ">
                    <div className='flex flex-row justify-start items-center gap-1 font-normal'>
                        Brand:
                        <a href={"/product-category/brands/" + product?.brands} className='text-dark underline font-bold'>{product?.brands}</a>
                        {/* <img src="/images/partner.png" alt="" className='size-20 object-contain object-center' /> */}
                    </div>
                    <div className='flex flex-row justify-start items-center gap-1 font-bold'>
                        Share Item:
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'
                            onClick={shareOnFacebook}
                        >
                            <FaFacebookF className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'
                            onClick={shareOnTwitter}
                        >
                            <FaXTwitter className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'
                            onClick={shareOnPinterest}
                        >
                            <FaPinterestP className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'
                            onClick={shareOnInstagram}
                        >
                            <FaInstagram className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-dark group transition-all cursor-pointer'
                            onClick={shareOnWhatsApp}
                        >
                            <FaWhatsapp className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                    </div>
                </div>
                <div className="productdesc flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full pb-5">
                    <div dangerouslySetInnerHTML={{ __html: product?.excerpt?.replace(/\[.*?\]/g, '').split('|n|').join('<br />') }} />
                </div>
                <div className='flex flex-col lg:flex-row justify-start items-center gap-2 w-full lg:pb-2'>
                    <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                        <button 
                            className='text-dark font-negro aspect-square w-7'
                            onClick={() => handleQuantityChange(-1)}
                        >
                            -
                        </button>
                        <input 
                            type="text" 
                            className='border-0 appearance-none text-dark text-center w-16 outline-none' 
                            min={1} 
                            value={quantity}
                            onChange={handleQuantityInput}
                        />
                        <button 
                            className='text-dark font-negro aspect-square w-7'
                            onClick={() => handleQuantityChange(1)}
                        >
                            +
                        </button>
                    </div>
                    <button 
                        className='text-xs bg-primary text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold w-full flex-1'
                        onClick={addToCart}
                    >
                        ADD TO CART
                        <RiHandbagLine className='fill-whtie' size={14} />
                    </button>
                    <div 
                        className={`rounded-full hidden lg:flex justify-center items-center z-10 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 ${isFavourite ? "bg-danger" : "bg-secondary/10"}`}
                        onClick={toggleWishlist}
                    >
                        <FaHeart size={20} className={`transition-all ${isFavourite ? "fill-white" : "fill-dark"}`} />
                    </div>
                </div>
                {/* <button onClick={() => window.open("/pdf/placeholder.pdf", "_blank")} className='w-full text-xs bg-[#EBEBEB] text-dark rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase lg:mb-1'>
                Technical Specifications
                </button> */}
                {/* <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
                    <a href="javascript: roomvo.startStandaloneVisualizer();" className='w-full text-xs bg-dark text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase'>
                    View this in your room
                    </a>
                    <a href="javascript: roomvo.startStandaloneVisualizer();" className='w-full text-xs bg-dark text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase'>
                    View in 3D
                    </a>

                </div> */}
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
                        className={activeTab === value ? "text-gray-900 font-bold transition-all w-fit px-5" : " transition-all w-fit text-dark/70 px-5"}
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
                            <ul className='columns-1 lg:columns-2'>
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
                                <ul className='columns-1 lg:columns-2'>
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