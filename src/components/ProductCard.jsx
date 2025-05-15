import React, { useState, useEffect } from 'react'
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import PropTypes from 'prop-types';
import { Spinner } from '@material-tailwind/react';
import { Skeleton } from './ui/skeleton';
import { getPricingUnit, formatPriceWithUnit } from '../utils/pricingUtils';

const ProductCard = ({ onClick, prod }) => {
    const [isFavourite, setIsFavourite] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Check if product is in wishlist on mount
        const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
        setIsFavourite(wishlist.some(item => item.slug === prod));
    }, [prod]);

    useEffect(() => {
        setLoading(true);
        fetch(`/data/products2.json`)
        .then(res => res.json())
        .then(data => {
            const product = data.find(item => item.slug === prod);
            if (product) {
                // Convert comma-separated string to array of image objects
                product.images = product.images.split(',').map(url => ({ url: url.trim() }));
            }
            setProduct(product);
            setTimeout(() => setLoading(false), 1000);
        })
        .catch(err => {
            setLoading(false);
            console.error(err);
        });
    }, [prod]);

    const handleFavoriteClick = () => {
        const newIsFavourite = !isFavourite;
        setIsFavourite(newIsFavourite);
        
        // Get current wishlist
        const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
        
        if (newIsFavourite) {
            // Add to wishlist if not already present
            if (!wishlist.some(item => item.slug === prod)) {
                const wishlistItem = {
                    ...product,
                    slug: prod,
                    dateAdded: new Date().toISOString()
                };
                wishlist.push(wishlistItem);
            }
        } else {
            // Remove from wishlist
            const index = wishlist.findIndex(item => item.slug === prod);
            if (index !== -1) {
                wishlist.splice(index, 1);
            }
        }
        
        // Save updated wishlist
        localStorage.setItem('stiles_wishlist_ls', JSON.stringify(wishlist));
    };

    return (
        <div className='w-full flex flex-col justify-start items-start gap-3 relative rounded-lg lg:rounded-xl overflow-hidden'>
            {
                loading
                ?
                <>
                    <Skeleton className='w-full aspect-square' />
                    <Skeleton className='w-full h-14' />
                    <Skeleton className='w-full h-7' />
                </>
                :
                <>
                    {
                        product.sale_price > 0 && <div className='absolute top-0 left-0 bg-primaryStiles text-dark px-3 py-2 lg:py-2 text-sm font-bold z-20 uppercase rounded-br-lg lg:rounded-br-xl min-w-32 text-center'>Promo</div>
                    }
                    <div 
                        className='relative w-full aspect-square'
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <img 
                            src={product?.images[0].url} 
                            alt="Product Image" 
                            className={`w-full rounded-lg lg:rounded-xl aspect-square object-cover object-center relative z-0 cursor-pointer transition-opacity duration-300 ${isHovered && product?.images.length > 1 ? 'opacity-0' : 'opacity-100'}`} 
                            onClick={onClick} 
                            onError={(e) => {
                                e.target.src = '/images/placeholder-images-image_large.webp';
                            }} 
                        />
                        {product?.images.length > 1 && (
                            <img 
                                src={product?.images[1].url} 
                                alt="Product Image Hover" 
                                className={`absolute top-0 left-0 w-full rounded-lg lg:rounded-xl aspect-square object-cover object-center cursor-pointer transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} 
                                onClick={onClick}
                                onError={(e) => {
                                    e.target.src = '/images/placeholder-images-image_large.webp';
                                }}
                            />
                        )}
                    </div>
                    <div className={`absolute top-3 lg:top-4 right-3 lg:right-6 rounded-full flex justify-center items-center z-10 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 drop-shadow-md ${isFavourite ? "bg-danger" : "bg-white"}`} onClick={handleFavoriteClick}>
                        <FaHeart size={20} className={`transition-all ${isFavourite ? "fill-white" : "fill-dark"}`} />
                    </div>
                    <h3 onClick={onClick} className='font-bold text-xl cursor-pointer'>{product?.title}</h3>
                    <div onClick={onClick} className="flex justify-start items-center gap-3 w-full cursor-pointer">
                        <p className='text-lg font-medium'>{formatPriceWithUnit(product?.regular_price, getPricingUnit(product))}</p>
                        <p className='text-sm text-opaque'>{product?.sku}</p>
                    </div>
                </>
            }
        </div>
    )
}

export default ProductCard