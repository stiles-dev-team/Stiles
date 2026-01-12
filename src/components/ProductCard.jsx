import { useState, useEffect, useCallback, memo } from 'react'
import { FaHeart } from "react-icons/fa";
import PropTypes from 'prop-types';
import { Skeleton } from './ui/skeleton';
import { getPricingUnit, formatPriceWithUnit } from '../utils/pricingUtils';
// import { toast } from 'sonner';

const ProductCard = memo(({ onClick, prod }) => {
    const [isFavourite, setIsFavourite] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [stockInfo, setStockInfo] = useState(null);
    const [badges, setBadges] = useState([]);

    useEffect(() => {
        const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
        setIsFavourite(wishlist.some(item => item.slug === prod));
    }, [prod]);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        
        fetch(`https://stiles.co.za/api/products.php?slug=${prod}`)
        .then(async res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const text = await res.text(); // Get response as text first
            try {
                return JSON.parse(text); // Try to parse as JSON
            } catch (e) {
                console.error('JSON Parse Error:', e);
                console.error('Response text:', text);
                throw new Error('Invalid JSON response from server');
            }
        })
        .then(data => {
            if (!isMounted) return;
            
            if (data.status === 'success' && data.data) {
                const productData = data.data;
                // Create images array with featured image first
                productData.images = [];
                
                // Add featured image first if it exists
                if (productData.featured_image) {
                    productData.images.push({ url: productData.featured_image });
                }
                
                // Add gallery images if they exist
                if (productData.gallery_images) {
                    const galleryImages = productData.gallery_images.split(',').map(url => ({ url: url.trim() }));
                    productData.images = [...productData.images, ...galleryImages];
                }
                
                setProduct(productData);
                
                // Parse promo string to extract multiple badges
                if (productData.promo !== null && productData.promo !== '' && productData.promo.trim() !== '') {
                    const promoArray = productData.promo.split(',').map(item => item.trim()).filter(item => item !== '');
                    const extractedBadges = [];
                    
                    promoArray.forEach(promoItem => {
                        if (promoItem.trim()) {
                            extractedBadges.push(promoItem.trim());
                        }
                    });
                    
                    setBadges(extractedBadges);
                } else {
                    setBadges([]);
                }

                // Fetch stock info if SKU exists
                if (productData.sku) {
                    fetch(`https://stiles.co.za/api/iq_new.php?code=${productData.sku}`, {
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
                        if (response && response.data) {
                            setStockInfo(response.data);
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching stock info:', err);
                        setStockInfo({
                            sellPInc1: 0,
                            promoPrice: 0,
                            packSize: 0
                        });
                    });
                }
            } else {
                console.error('Product not found:', data.message);
            }
            setLoading(false);
        })
        .catch(err => {
            if (!isMounted) return;
            setLoading(false);
            console.error('Error fetching product:', err);
        });

        return () => {
            isMounted = false;
        };
    }, [prod]);

    const handleFavoriteClick = useCallback((e) => {
        e.stopPropagation();
        const newIsFavourite = !isFavourite;
        setIsFavourite(newIsFavourite);
        
        const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
        
        if (newIsFavourite) {
            if (!wishlist.some(item => item.slug === prod)) {
                const wishlistItem = {
                    ...product,
                    slug: prod,
                    dateAdded: new Date().toISOString()
                };
                wishlist.push(wishlistItem);
            }
        } else {
            const index = wishlist.findIndex(item => item.slug === prod);
            if (index !== -1) {
                wishlist.splice(index, 1);
            }
        }
        
        localStorage.setItem('stiles_wishlist_ls', JSON.stringify(wishlist));
    }, [isFavourite, prod, product]);

    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    if (loading) {
        return (
            <div className='w-full flex flex-col justify-start items-start gap-3 relative rounded-lg lg:rounded-xl overflow-hidden'>
                <Skeleton className='w-full aspect-square' />
                <Skeleton className='w-full h-14' />
                <Skeleton className='w-full h-7' />
            </div>
        );
    }

    if (!product) {
        return null;
    }

    return (
        <div 
            className='w-full flex flex-col justify-start items-start gap-3 relative rounded-lg lg:rounded-xl overflow-hidden'
            onClick={(e) => {
                // Only navigate if the click is not on the favorite button
                if (!e.target.closest('[data-favorite-button]')) {
                    onClick();
                }
            }}
        >
            <div 
                className='relative w-full aspect-square'
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {(() => {
                    // Check if product is sanitary-ware
                    const isSanitaryWare = product.product_category && 
                        typeof product.product_category === 'string' && 
                        product.product_category.includes('Sanitary Ware');
                    
                    // For sanitary-ware: only show when onhand === 0
                    // For other products: show when onhand < 5 (existing behavior)
                    const shouldShowSoldOut = stockInfo?.onhand !== undefined && 
                        (isSanitaryWare ? stockInfo.onhand === 0 : stockInfo.onhand < 5);
                    
                    return shouldShowSoldOut && 
                     !badges.includes('Coming Soon') && 
                     !badges.includes('Backorder') && 
                     !badges.includes('Special Order') &&
                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Backorder')) && 
                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Coming Soon')) &&
                     !(product.promo && typeof product.promo === 'string' && product.promo.includes('Special Order')) &&
                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Backorder')) &&
                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Coming Soon')) &&
                     !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Special Order')) && (
                        <div className='absolute w-full top-0 left-0 bg-black text-white px-3 py-2 lg:py-2 text-sm font-bold z-20 uppercase text-center'>
                            Sold Out
                        </div>
                    );
                })()}
                {/* {product.sale_price > 0 && !(stockInfo?.onhand !== undefined && stockInfo?.onhand < 5) && (
                    <div className='absolute top-0 left-0 bg-primaryStiles text-dark px-3 py-2 lg:py-2 text-sm font-bold z-20 uppercase rounded-br-lg lg:rounded-br-xl min-w-32 text-center'>
                        Promo
                    </div>
                )} */}
                <img 
                    src={product.images[0]?.url ? `${product.images[0].url}?v=${new Date().getTime()}` : '/images/placeholder-images-image_large.webp'} 
                    alt={product.title}
                    loading="lazy"
                    width={414}
                    height={414}
                    className={`w-full rounded-lg lg:rounded-xl aspect-square object-cover object-center relative z-0 cursor-pointer transition-opacity duration-300 ${isHovered && product.images.length > 1 ? 'opacity-0' : 'opacity-100'}`} 
                    onClick={onClick} 
                    onError={(e) => {
                        e.target.src = '/images/placeholder-images-image_large.webp';
                    }} 
                />
                {product.images.length > 1 && (
                    <img 
                        src={product.images[1]?.url ? `${product.images[1].url}?v=${new Date().getTime()}` : '/images/placeholder-images-image_large.webp'} 
                        alt={`${product.title} - Hover`} 
                        className={`absolute top-0 left-0 w-full rounded-lg lg:rounded-xl aspect-square object-cover object-center cursor-pointer transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
                        onClick={onClick}
                        width={414}
                        height={414}
                        onError={(e) => {
                            e.target.src = '/images/placeholder-images-image_large.webp';
                        }}
                    />
                )}
            </div>
            <div 
                className={`absolute top-3 lg:top-4 right-3 lg:right-6 rounded-full flex justify-center items-center z-30 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 drop-shadow-md ${isFavourite ? "bg-danger" : "bg-white"}`} 
                onClick={handleFavoriteClick}
                style={{ pointerEvents: 'auto' }}
                data-favorite-button
            >
                <FaHeart size={20} className={`transition-all ${isFavourite ? "fill-white" : "fill-dark"}`} />
            </div>
                {
                    badges.length > 0 && badges.map((badge, index) => {
                        // Offset badges if sold out badge is present
                        // hasTopBadge should be true only when "Sold Out" badge is actually visible
                        // Check if product is sanitary-ware
                        const isSanitaryWare = product.product_category && 
                            typeof product.product_category === 'string' && 
                            product.product_category.includes('Sanitary Ware');
                        
                        // For sanitary-ware: only show when onhand === 0
                        // For other products: show when onhand < 5 (existing behavior)
                        const shouldShowSoldOut = stockInfo?.onhand !== undefined && 
                            (isSanitaryWare ? stockInfo.onhand === 0 : stockInfo.onhand < 5);
                        
                        const hasTopBadge = shouldShowSoldOut && 
                                             !badges.includes('Coming Soon') && 
                                             !badges.includes('Backorder') && 
                                             !badges.includes('Special Order') &&
                                             !(product.promo && typeof product.promo === 'string' && product.promo.includes('Backorder')) && 
                                             !(product.promo && typeof product.promo === 'string' && product.promo.includes('Coming Soon')) &&
                                             !(product.promo && typeof product.promo === 'string' && product.promo.includes('Special Order')) &&
                                             !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Backorder')) &&
                                             !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Coming Soon')) &&
                                             !(product.product_tag && typeof product.product_tag === 'string' && product.product_tag.includes('Special Order'));
                        const topOffset = hasTopBadge ? (index * 38 + 45) : (index * 38);
                        return (
                            <div 
                                key={index}
                                className='absolute left-0 w-fit z-30 p-2 bg-primaryStiles flex flex-col gap-1 max-w-44'
                                style={{ top: `${topOffset}px` }}
                            >
                                <div className='bg-primaryStiles px-2 py-1 rounded text-center'>
                                    <p className='text-dark text-[10px] font-black uppercase leading-tight'>{badge}</p>
                                </div>
                            </div>
                        );
                    })
                }
            <h3 className='font-bold text-xl cursor-pointer'>{product.title}</h3>
            <div className="flex justify-start items-center gap-3 w-full cursor-pointer flex-wrap">
                {stockInfo?.promoPrice == null || stockInfo?.promoPrice == 0 || stockInfo?.promoPrice == '' ? (
                    <p className='text-lg font-medium'>{formatPriceWithUnit(stockInfo?.sellPInc1, getPricingUnit(product, stockInfo))}</p>
                ) : (
                    <>
                        <p className='text-[#B3B3B3] line-through text-lg'>{formatPriceWithUnit(stockInfo?.sellPInc1, getPricingUnit(product, stockInfo))}</p>
                        <p className='text-lg font-medium'>{formatPriceWithUnit(stockInfo?.promoPrice, getPricingUnit(product, stockInfo))}</p>
                    </>
                )}
                <p className='text-sm text-opaque'>{product.sku}</p>
            </div>
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

ProductCard.propTypes = {
    onClick: PropTypes.func.isRequired,
    prod: PropTypes.string.isRequired
};

export default ProductCard;