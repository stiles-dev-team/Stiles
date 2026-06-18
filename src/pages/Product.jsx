import React, { useEffect, useState } from 'react'
import LayoutDark from '../layout/LayoutDark'
import axios from 'axios';
import { Helmet } from 'react-helmet-async';

import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import { decodeHtmlEntities } from '../utils/pricingUtils';


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
    Button,
    Dialog,
    DialogHeader,
    DialogBody,
    DialogFooter,
  } from "@material-tailwind/react";

  import {
    Accordion,
    AccordionHeader,
    AccordionBody,
  } from "@material-tailwind/react";

  import { Splide, SplideSlide } from '@splidejs/react-splide';
  import '@splidejs/react-splide/css';
import ProductCard from '../components/ProductCard';
import ProductImageLightbox from '../components/ProductImageLightbox';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { getPricingUnit, formatPriceWithUnit } from '../utils/pricingUtils';
import { getUniquePromoBadgeVisibilityMap, filterBadgesByUniquePromoBadgeVisibility } from '../utils/uniquePromos';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useAuth } from '../context/AuthContext';
   
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
    // Function to extract YouTube video ID from URL
    const extractYouTubeId = (url) => {
        if (!url) return '';
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : '';
    };

    // Function to get YouTube thumbnail
    const getYouTubeThumbnail = (url) => {
        const videoId = extractYouTubeId(url);
        return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    };

    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    
    const [activeTab, setActiveTab] = useState("additional");
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [imageSelected, setImageSelected] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [isFavourite, setIsFavourite] = useState(false);
    const [stockInfo, setStockInfo] = useState(null);
    const [badges, setBadges] = useState([]);
    const [uniquePromoBadgeVisibility, setUniquePromoBadgeVisibility] = useState(null);
    const [badgesPendingVisibility, setBadgesPendingVisibility] = useState(false);

    const [related, setRelated] = useState([]);
    const [brandPdf, setBrandPdf] = useState(null);

    const [openQuote, setOpenQuote] = useState(false);
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [calculatedQuantity, setCalculatedQuantity] = useState(null);
 
    const handleOpenQuote = () => {
        setOpenQuote(!openQuote);
        if (!openQuote) {
            // Reset values when opening the dialog
            setRoomLength('');
            setRoomWidth('');
            setCalculatedQuantity(null);
        }
    };

    const calculateQuantity = () => {
        if (!roomLength || !roomWidth || !stockInfo?.packSize) return;
        
        const area = parseFloat(roomLength) * parseFloat(roomWidth);
        const areaWithWastage = area * 1.15; // Adding 15% wastage
        const packsNeeded = Math.ceil(areaWithWastage / stockInfo.packSize);
        
        setCalculatedQuantity(packsNeeded);
    };

    const addToQuote = () => {
        if (!product || !calculatedQuantity) return;

        const quote = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
        const existingItemIndex = quote.findIndex(item => item.slug === product.slug);
        const totalQuantity =  calculatedQuantity * stockInfo.packSize;
        console.log('Total quantity:', totalQuantity);
        
        if (existingItemIndex !== -1) {
            quote[existingItemIndex].quantity = totalQuantity;
        } else {
            quote.push({
                ...product,
                quantity: totalQuantity,
                price: stockInfo?.sellPInc1
            });
        }
        
        localStorage.setItem('stiles_cart_ls', JSON.stringify(quote));
        toast.success(`${product.title} x ${totalQuantity}m² added to quote`);
        handleOpenQuote();
    };
    
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
        let mounted = true;
        getUniquePromoBadgeVisibilityMap().then((map) => {
            if (!mounted) return;
            setUniquePromoBadgeVisibility(map);
        });
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        console.log("Starting product fetch for ID:", id);
        setBrandPdf(null);
        // If admin, fetch product regardless of status, otherwise only published
        const apiUrl = isAdmin 
            ? `https://staging.stiles.co.za/api/admin-products.php?slug=${id}`
            : `https://staging.stiles.co.za/api/products.php?slug=${id}`;
        
        fetch(apiUrl)
        .then(res => {
            console.log("Product API response status:", res.status);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(response => {
            console.log('Product data:', response);
            if (response.status === 'success' && (response.data || response.product)) {
                console.log('Product data:', response.data || response.product);
                const product = response.data || response.product;
                // Process images if they exist in the format we expect
                const images = [];
                
                // Add featured image first if it exists
                if (product.featured_image) {
                    images.push({
                        url: product.featured_image,
                        alt: product.featured_image_data?.alt_text || product.title,
                        title: product.title,
                        desc: product.featured_image_data?.description || '',
                        caption: product.featured_image_data?.description || ''
                    });
                }

                // Add gallery images if they exist
                if (product.gallery_images_data && product.gallery_images_data.length > 0) {
                    // Use the new gallery_images_data structure
                    const galleryImages = product.gallery_images_data.map(imageData => ({
                        url: imageData.url,
                        alt: imageData.alt_text || product.title,
                        title: product.title,
                        desc: imageData.description || '',
                        caption: imageData.description || ''
                    }));
                    images.push(...galleryImages);
                } else if (product.gallery_images) {
                    // Fallback to old format if new data is not available
                    const galleryImages = product.gallery_images.split(',').map(imageBlock => {
                        const [url, alt, title, desc, caption] = imageBlock.split('!').map(str => str.split(':').pop().trim());
                        return { url, alt, title, desc, caption };
                    });
                    images.push(...galleryImages);
                }

                // Add YouTube video if it exists
                if (product.youtube_video_url) {
                    const videoId = extractYouTubeId(product.youtube_video_url);
                    if (videoId) {
                        images.push({
                            url: product.youtube_video_url,
                            thumbnail: getYouTubeThumbnail(product.youtube_video_url),
                            videoId: videoId,
                            alt: `${product.title} - Video`,
                            title: `${product.title} - Video`,
                            desc: 'Product video',
                            caption: 'Product video',
                            isVideo: true
                        });
                    }
                }

                // If no images were added, create one with the featured image
                if (images.length === 0 && product.featured_image) {
                    images.push({
                        url: product.featured_image,
                        alt: product.featured_image_data?.alt_text || product.title,
                        title: product.title,
                        desc: product.featured_image_data?.description || '',
                        caption: product.featured_image_data?.description || ''
                    });
                }

                product.images = images;
                
                // Parse promo string to extract multiple badges
                if (product.promo !== null && product.promo !== '' && product.promo.trim() !== '') {
                    const promoArray = product.promo.split(',').map(item => item.trim()).filter(item => item !== '');
                    const extractedBadges = [];
                    
                    promoArray.forEach(promoItem => {
                        if (promoItem.trim()) {
                            extractedBadges.push(promoItem.trim());
                        }
                    });
                    
                    if (!uniquePromoBadgeVisibility) {
                        // Avoid flashing all badges before visibility loads
                        setBadges(extractedBadges);
                        setBadgesPendingVisibility(true);
                    } else {
                        setBadges(filterBadgesByUniquePromoBadgeVisibility(extractedBadges, uniquePromoBadgeVisibility));
                        setBadgesPendingVisibility(false);
                    }
                } else {
                    setBadges([]);
                    setBadgesPendingVisibility(false);
                }
                
                // Fetch stock info
                if (product.sku) {
                    console.log('Fetching stock info for SKU:', product.sku);
                    fetch(`https://staging.stiles.co.za/api/iq_new.php?code=${product.sku}`, {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors',
                        credentials: 'omit'
                    })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(response => {
                        console.log('Stock info response:', response);
                        if (response && response.data) {
                            setStockInfo(response.data);
                        } else {
                            console.warn('Stock info response did not contain expected fields:', response);
                            // Don't redirect, just don't show the Add to Quote button
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching stock info:', err);
                        // Don't redirect, just don't show the Add to Quote button
                    });
                } else {
                    console.warn('No SKU found for product');
                }

                setProduct(product);

                const brandName = product['attribute:pa_brands'];
                if (brandName) {
                    fetch('https://staging.stiles.co.za/api/admin-brands.php')
                        .then(res => res.json())
                        .then(data => {
                            const brand = data.brands?.find(b => b.name === brandName);
                            if (brand?.pdf_url) {
                                setBrandPdf({
                                    name: brand.name,
                                    pdf_url: brand.pdf_url,
                                    pdf_text: brand.pdf_text || brand.name
                                });
                            } else {
                                setBrandPdf(null);
                            }
                        })
                        .catch(() => setBrandPdf(null));
                } else {
                    setBrandPdf(null);
                }
                
                // Check if product is in wishlist
                const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
                setIsFavourite(wishlist.some(item => item.slug === id));
                
                // Fetch related products
                fetch(`https://staging.stiles.co.za/api/products.php?category=${encodeURIComponent(product.product_category)}&limit=10`)
                .then(res => res.json())
                .then(response => {
                    if (response.status === 'success' && response.data) {
                        const selectedProducts = response.data.filter(item => item.slug !== product.slug);
                        setRelated(selectedProducts);
                    }
                })
                .catch(err => {
                    console.error('Error fetching related products:', err);
                });
            } else {
                console.warn('Product response did not contain success status or data:', response);
            }
            setLoading(false);
        })
        .catch(err => {
            console.error('Error fetching product:', err);
            setLoading(false);
            
            // Check if it's a 404 error and redirect to shop
            if (err.message.includes('404')) {
                // alert('Product not found');
                navigate('/error');
                // console.log('404 error');
            }
        });
    }, [id, uniquePromoBadgeVisibility]);

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
                price: stockInfo?.sellPInc1,
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
            label: "Product Details",
            value: "additional",
            desc: product?.["meta:product_details"] ? product?.["meta:product_details"].split(/\r?\n/).map((line, index) => {
                // Split on both Windows (\r\n) and Unix (\n) newlines so each source line always renders on its own row.
                const formattedLine = line.replace(/<(strong|b)>(.*?)<\/\1>/g, '<span class="font-bold">$2</span>');
                return <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
            }) : [],
        },
        {
            label: "Description",
            value: "desc",
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
        {
            loading ? (
                <div className='w-full h-svh fixed top-0 left-0 bg-white z-50 flex justify-center items-center'>
                    <Spinner />
                </div>
            ) : (
                <>
                </>
            )
        }
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
        <Dialog open={openQuote} handler={handleOpenQuote} className="bg-white">
            <DialogHeader className="justify-between">
                <div>
                    <h3 className="text-2xl font-bold text-dark">Calculate Quote</h3>
                    <p className="text-sm text-dark/60 mt-1">Enter your room measurements to calculate the required quantity</p>
                </div>
                <button
                    onClick={handleOpenQuote}
                    className="text-dark/60 hover:text-dark transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </DialogHeader>
            <DialogBody className="overflow-y-auto">
                <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="length" className="text-sm font-medium text-dark">Room Length</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="length"
                                    value={roomLength}
                                    onChange={(e) => setRoomLength(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-dark focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Enter length"
                                    min="0"
                                    step="0.01"
                                />
                                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-dark/60">m</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="width" className="text-sm font-medium text-dark">Room Width</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="width"
                                    value={roomWidth}
                                    onChange={(e) => setRoomWidth(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-dark focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                    placeholder="Enter width"
                                    min="0"
                                    step="0.01"
                                />
                                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-dark/60">m</span>
                            </div>
                        </div>
                    </div>
                    
                    {calculatedQuantity && (
                        <div className="mt-2 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h4 className="text-lg font-semibold text-dark mb-4">Calculation Results</h4>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-dark/60">Total Area:</span>
                                    <span className="font-medium text-dark">{(parseFloat(roomLength) * parseFloat(roomWidth)).toFixed(2)} m²</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-dark/60">Area with 15% wastage:</span>
                                    <span className="font-medium text-dark">{(parseFloat(roomLength) * parseFloat(roomWidth) * 1.15).toFixed(2)} m²</span>
                                </div>
                                <div className="pt-3 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-dark font-medium">Boxes needed:</span>
                                        <span className="text-xl font-bold text-primary">{calculatedQuantity}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Button
                                    variant="gradient"
                                    color="green"
                                    onClick={addToQuote}
                                    className="w-full"
                                >
                                    <span>Add to Quote</span>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogBody>
            <DialogFooter className="flex justify-between items-center gap-2">
                <Button
                    variant="text"
                    color="red"
                    onClick={handleOpenQuote}
                    className="px-4"
                >
                    <span>Cancel</span>
                </Button>
                <Button 
                    variant="gradient" 
                    color="green" 
                    onClick={calculateQuantity}
                    disabled={!roomLength || !roomWidth || !stockInfo?.packSize}
                    className="px-6"
                >
                    <span>Calculate</span>
                </Button>
            </DialogFooter>
        </Dialog>
        <div className='container mx-auto flex flex-col lg:flex-row justify-between items-start gap-10 pt-20 lg:pt-40 pb-20 px-4'>
            <div className='w-full lg:w-6/12 flex flex-col lg:flex-row justify-start items-center gap-2 h-full max-h-[600px]'>
                {product?.images[imageSelected]?.isVideo ? (
                    <div className='w-full lg:w-10/12 aspect-square relative rounded-md overflow-hidden'>
                        {(() => {
                            // Check if product is sanitary-ware
                            const isSanitaryWare = product?.product_category && 
                                typeof product.product_category === 'string' && 
                                product.product_category.includes('Sanitary Ware');

                            const isSlab = product?.product_category &&
                                typeof product.product_category === 'string' &&
                                product.product_category.includes('Slab');
                            
                            // For sanitary-ware: only show when onhand === 0
                            // For other products: show when onhand < 5 (existing behavior)
                            const shouldShowSoldOut = stockInfo?.onhand !== undefined && 
                                (isSanitaryWare ? stockInfo.onhand === 0 : stockInfo.onhand < 5) &&
                                (isSlab ? stockInfo.onhand === 0 : stockInfo.onhand < 5);
                            
                            return shouldShowSoldOut && 
                             !badges.includes('Coming Soon') && 
                             !badges.includes('Backorder') && 
                             !badges.includes('Special Order') &&
                             !(product?.promo && typeof product.promo === 'string' && product.promo.includes('Backorder')) && 
                             !(product?.promo && typeof product.promo === 'string' && product.promo.includes('Coming Soon')) &&
                             !(product?.promo && typeof product.promo === 'string' && product.promo.includes('Special Order')) &&
                             !(product?.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Backorder')) &&
                             !(product?.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Coming Soon')) && (
                                <div className='absolute w-full top-0 left-0 bg-black text-white px-3 py-2 lg:py-2 text-sm font-bold z-20 uppercase text-center'>
                                    Sold Out
                                </div>
                            );
                        })()}
                        {
                            badges.length > 0 && badges.map((badge, index) => {
                                // Offset badges if sold out badge is present
                                // Check if product is sanitary-ware
                                const isSanitaryWare = product?.product_category && 
                                    typeof product.product_category === 'string' && 
                                    product.product_category.includes('Sanitary Ware');

                                const isSlab = product?.product_category && 
                                    typeof product.product_category === 'string' && 
                                    product.product_category.includes('Slab');
                                
                                // For sanitary-ware: only show when onhand === 0
                                // For other products: show when onhand < 5 (existing behavior)
                                const shouldShowSoldOut = stockInfo?.onhand !== undefined && 
                                    (isSanitaryWare ? stockInfo.onhand === 0 : stockInfo.onhand < 5) &&
                                    (isSlab ? stockInfo.onhand === 0 : stockInfo.onhand < 5);
                                
                                const hasTopBadge = shouldShowSoldOut && 
                                                     !badges.includes('Coming Soon') && 
                                                     !badges.includes('Backorder') && 
                                                     !badges.includes('Special Order') &&
                                                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Backorder')) && 
                                                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Coming Soon')) &&
                                                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Special Order')) &&
                                                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Backorder')) &&
                                                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Coming Soon'));
                                const topOffset = hasTopBadge ? (index * 38 + 45) : (index * 38);
                                return (
                                    <div 
                                        key={index}
                                        className='absolute left-0 w-fit z-30 p-2 bg-primaryStiles flex flex-col gap-1 max-w-44'
                                        style={{ top: `${topOffset}px` }}
                                    >
                                        <div className='bg-primaryStiles px-2 py-1 rounded text-center'>
                                            {badgesPendingVisibility ? (
                                                <div className="h-3 w-20 bg-black/20 rounded animate-pulse" />
                                            ) : (
                                                <p className='text-dark text-[10px] font-black uppercase leading-tight'>{badge}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                        <iframe
                            src={`https://www.youtube.com/embed/${product.images[imageSelected].videoId}?autoplay=1`}
                            title={product.images[imageSelected].title}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                ) : (
                    <div className='w-full lg:w-10/12 aspect-square relative rounded-md overflow-hidden'>
                        {(() => {
                            // Check if product is sanitary-ware
                            const isSanitaryWare = product?.product_category && 
                                typeof product.product_category === 'string' && 
                                product.product_category.includes('Sanitary Ware');

                            const isSlab = product?.product_category &&
                                typeof product.product_category === 'string' &&
                                product.product_category.includes('Slab');
                            
                            // For sanitary-ware: only show when onhand === 0
                            // For other products: show when onhand < 5 (existing behavior)
                            const shouldShowSoldOut = stockInfo?.onhand !== undefined && 
                                (isSanitaryWare ? stockInfo.onhand === 0 : stockInfo.onhand < 5) &&
                                (isSlab ? stockInfo.onhand === 0 : stockInfo.onhand < 5);
                            
                            return shouldShowSoldOut && 
                             !badges.includes('Coming Soon') && 
                             !badges.includes('Backorder') && 
                             !badges.includes('Special Order') &&
                             !(product?.promo && typeof product.promo === 'string' && product.promo.includes('Backorder')) && 
                             !(product?.promo && typeof product.promo === 'string' && product.promo.includes('Coming Soon')) &&
                             !(product?.promo && typeof product.promo === 'string' && product.promo.includes('Special Order')) &&
                             !(product?.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Backorder')) &&
                             !(product?.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Coming Soon')) && (
                                <div className='absolute w-full top-0 left-0 bg-black text-white px-3 py-2 lg:py-2 text-sm font-bold z-20 uppercase text-center'>
                                    Sold Out
                                </div>
                            );
                        })()}
                        {
                            badges.length > 0 && badges.map((badge, index) => {
                                // Offset badges if sold out badge is present
                                // Check if product is sanitary-ware
                                const isSanitaryWare = product?.product_category && 
                                    typeof product.product_category === 'string' && 
                                    product.product_category.includes('Sanitary Ware');

                                const isSlab = product?.product_category &&
                                    typeof product.product_category === 'string' &&
                                    product.product_category.includes('Slab');
                                
                                // For sanitary-ware: only show when onhand === 0
                                // For other products: show when onhand < 5 (existing behavior)
                                const shouldShowSoldOut = stockInfo?.onhand !== undefined && 
                                    (isSanitaryWare ? stockInfo.onhand === 0 : stockInfo.onhand < 5) &&
                                    (isSlab ? stockInfo.onhand === 0 : stockInfo.onhand < 5);
                                
                                const hasTopBadge = shouldShowSoldOut && 
                                                     !badges.includes('Coming Soon') && 
                                                     !badges.includes('Backorder') && 
                                                     !badges.includes('Special Order') &&
                                                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Backorder')) && 
                                                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Coming Soon')) &&
                                                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Special Order')) &&
                                                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Backorder')) &&
                                                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Coming Soon'));
                                const topOffset = hasTopBadge ? (index * 38 + 45) : (index * 38);
                                return (
                                    <div 
                                        key={index}
                                        className='absolute left-0 w-fit z-30 p-2 bg-primaryStiles flex flex-col gap-1 max-w-44'
                                        style={{ top: `${topOffset}px` }}
                                    >
                                        <div className='bg-primaryStiles px-2 py-1 rounded text-center'>
                                            {badgesPendingVisibility ? (
                                                <div className="h-3 w-20 bg-black/20 rounded animate-pulse" />
                                            ) : (
                                                <p className='text-dark text-[10px] font-black uppercase leading-tight'>{badge}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        }
                        <img
                            src={product?.images[imageSelected].url + "?v=" + new Date().getTime()}
                            alt={product?.images[imageSelected].alt}
                            title={product?.images[imageSelected].title}
                            className='w-full h-full aspect-square object-cover object-center rounded-md cursor-zoom-in'
                            onClick={() => setLightboxOpen(true)}
                        />
                    </div>
                )}
            <div className="flex flex-row lg:flex-col justify-start items-start gap-2 h-full max-h-[600px] overflow-y-auto">
                    {product?.images.map((image, index) => (
                        <div key={index} onClick={() => setImageSelected(index)} className={`w-12 lg:w-14 aspect-square rounded-md cursor-pointer transition-all ${imageSelected == index ? "opacity-100 border border-dark" : "opacity-60 border border-white hover:opacity-100 hover:border-dark/50"}`}>
                            {image.isVideo ? (
                                <div className="relative w-full h-full">
                                    <img 
                                        src={image.thumbnail} 
                                        alt={image.alt} 
                                        title={image.title} 
                                        className="w-full h-full object-cover object-center rounded-md"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-md">
                                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z"/>
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <img 
                                    src={image.url + "?v=" + new Date().getTime()} 
                                    alt={image.alt} 
                                    title={image.title} 
                                    className="w-full h-full object-cover object-center rounded-md"
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <div className='w-full lg:w-6/12 flex flex-col justify-start items-start gap-1'>
                {isAdmin && (
                    <div className="flex flex-col gap-2 mb-3">
                        {product?.status && product.status !== 'publish' && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-gray-600">Status:</span>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                                        product.status === "publish"
                                            ? "bg-green-100 text-green-800"
                                            : product.status === "private"
                                            ? "bg-gray-100 text-gray-800"
                                            : "bg-yellow-100 text-yellow-800"
                                    }`}
                                >
                                    {product.status === "publish" 
                                        ? "Published" 
                                        : product.status === "private"
                                        ? "Private"
                                        : "Draft"
                                    }
                                </span>
                            </div>
                        )}
                        <button 
                            onClick={() => navigate(`/admin/products?slug=${product?.slug}`)} 
                            className='text-white hover:text-dark hover:bg-blue-100 transition-all text-sm py-2 px-4 rounded bg-blue-600 border border-blue-600'
                        >
                            Edit Product
                        </button>
                    </div>
                )}
                <div className="flex flex-row gap-2 mb-4">
                    <button onClick={() => window.history.back()} className='text-dark/60 hover:text-white hover:bg-black transition-all text-sm py-2 px-4 rounded bg-secondary'>Return to results</button>
                    
                </div>
                <h1 className='font-bold text-xl'>{product?.title}</h1>
                <p className='text-dark/60'><span className='text-dark font-bold'>SKU:</span> {product?.sku}</p>
                <div className="flex flex-row justify-start items-end gap-2">
                    {
                        stockInfo?.promoPrice  == null || stockInfo?.promoPrice == 0 || stockInfo?.promoPrice == '' ?
                        <p className='text-dark text-2xl'>{formatPriceWithUnit(stockInfo?.sellPInc1, getPricingUnit(product, stockInfo))}</p>
                        :
                        <>
                            <p className='text-[#B3B3B3] line-through text-2xl'>{formatPriceWithUnit(stockInfo?.sellPInc1, getPricingUnit(product, stockInfo))}</p>
                            <p className='text-dark text-2xl'>{formatPriceWithUnit(stockInfo?.promoPrice, getPricingUnit(product, stockInfo))}</p>
                        </>
                    }
                    {/* {
                        product?.sale_price  == null || product?.sale_price == 0 || product?.sale_price == '' ?
                        <p className='text-dark text-2xl'>{formatPriceWithUnit(product?.regular_price, getPricingUnit(product))}</p>
                        :
                        <>
                            <p className='text-[#B3B3B3] line-through text-2xl'>{formatPriceWithUnit(product?.regular_price, getPricingUnit(product))}</p>
                            <p className='text-dark text-2xl'>{formatPriceWithUnit(product?.sale_price, getPricingUnit(product))}</p>
                        </>
                    } */}
                </div>
                {/* <p className='italic text-[#B3B3B3]'>(R935.61 per box of tiles)</p> */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2 w-full ">
                    <div className='flex flex-col justify-start items-start gap-1 font-normal'>
                        <div className='flex flex-row justify-start items-center gap-1'>
                            Brand:
                            <a href={"/product-category/brands/" + product?.["attribute:pa_brands"]} className='text-dark underline font-bold'>{decodeHtmlEntities(product?.["attribute:pa_brands"])}</a>
                        </div>
                    </div>
                    <div className='flex flex-row justify-start items-center gap-1 font-bold'>
                        Share Item:
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'
                            onClick={shareOnFacebook}
                        >
                            <FaFacebookF className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'
                            onClick={shareOnTwitter}
                        >
                            <FaXTwitter className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'
                            onClick={shareOnPinterest}
                        >
                            <FaPinterestP className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'
                            onClick={shareOnInstagram}
                        >
                            <FaInstagram className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                        <div 
                            className='size-10 flex justify-center items-center rounded-full bg-white hover:bg-black group transition-all cursor-pointer'
                            onClick={shareOnWhatsApp}
                        >
                            <FaWhatsapp className='fill-dark group-hover:fill-white transition-all' size={18} />
                        </div>
                    </div>
                </div>
                <div className="productdesc flex flex-col gap-2 w-full pb-5">
                    <div dangerouslySetInnerHTML={{ __html: product?.description?.replace(/\[.*?\]/g, '').split('|n|').join('<br />') }} />
                    {brandPdf && (
                        <p className='text-sm text-dark'>
                            <a href={brandPdf.pdf_url} target="_blank" rel="noopener noreferrer" className='underline font-bold'>
                                {decodeHtmlEntities(brandPdf.pdf_text)}
                            </a>
                        </p>
                    )}
                </div>
                <div className='flex flex-col lg:flex-row justify-start items-center gap-2 w-full lg:pb-2'>
                    {
                        !stockInfo ? (
                            <button 
                                className="text-xs bg-gray-400 text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold w-full flex-1 cursor-not-allowed"
                                disabled={true}
                            >
                                UNAVAILABLE RIGHT NOW
                            </button>
                        ) : stockInfo?.model == 'PC' ? (
                            <button 
                                className={`text-xs bg-primary text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold w-full flex-1 ${stockInfo?.sellPInc1 == 0 || stockInfo?.sellPInc1 == null || stockInfo?.sellPInc1 == '' ? "opacity-50" : ""}`}
                                onClick={handleOpenQuote}
                                disabled={stockInfo?.sellPInc1 == 0 || stockInfo?.sellPInc1 == null || stockInfo?.sellPInc1 == ''}
                            >
                                CALCULATE/ADD TO QUOTE
                                <IoAddCircleOutline className='fill-whtie' size={14} />
                            </button>
                        ) : stockInfo?.model == 'SI' ? (
                            <>
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
                                    className={`text-xs bg-primary text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold w-full flex-1 ${stockInfo?.sellPInc1 == 0 || stockInfo?.sellPInc1 == null || stockInfo?.sellPInc1 == '' ? "opacity-50" : ""}`}
                                    onClick={addToCart}
                                    disabled={stockInfo?.sellPInc1 == 0 || stockInfo?.sellPInc1 == null || stockInfo?.sellPInc1 == ''}
                                >
                                    ADD TO QUOTE
                                    <IoAddCircleOutline className='fill-whtie' size={14} />
                                </button>
                            </>
                        ) : (
                            <button 
                                className="text-xs bg-gray-400 text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold w-full flex-1 cursor-not-allowed"
                                disabled={true}
                            >
                                UNAVAILABLE RIGHT NOW
                            </button>
                        )
                    }
                    <div 
                        className={`rounded-full hidden lg:flex justify-center items-center z-10 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 ${isFavourite ? "bg-danger" : "bg-secondary/10"}`}
                        onClick={toggleWishlist}
                    >
                        <FaHeart size={20} className={`transition-all ${isFavourite ? "fill-white" : "fill-dark"}`} />
                    </div>
                </div>
                {product?.pdf_url && (
                    <button 
                        onClick={() => window.open(product.pdf_url, "_blank")} 
                        className='w-full text-xs bg-[#EBEBEB] text-dark rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase lg:mb-1 mt-2'
                    >
                        Technical Specifications
                    </button>
                )}
                {/* <div className="grid w-full grid-cols-1 lg:grid-cols-2 gap-2">
                    <a href="javascript: roomvo.startStandaloneVisualizer();" className='w-full text-xs bg-black text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase'>
                    View this in your room
                    </a>
                    <a href="javascript: roomvo.startStandaloneVisualizer();" className='w-full text-xs bg-black text-white rounded-full py-4 px-5 flex justify-center items-center gap-2 font-semibold uppercase'>
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
        {related && related.length > 0 && (
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
                                <a href={"/product/" + item.slug} key={item.id}>
                                    <ProductCard key={item.id} prod={item.slug} />
                                </a>
                            </SplideSlide>
                        ))
                    }
            </Splide>
        </div>
        )}
        <ProductImageLightbox
            images={product?.images || []}
            startIndex={imageSelected}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
        />
        {/* <SubscribeBanner /> */}
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
            <button className='absolute right-0.5 px-4 h-[42px] hover:bg-primary bg-black hover:text-dark text-white rounded-full lg:rounded-md text-sm font-bold uppercase transition-all'>Subscribe</button>
          </div>
        </div>
      </section>
    )
  }