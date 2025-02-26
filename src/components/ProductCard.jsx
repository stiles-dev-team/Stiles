import React, { useState, useEffect } from 'react'
import { FaRegHeart } from "react-icons/fa";
import { FaHeart } from "react-icons/fa";
import PropTypes from 'prop-types';
import { Spinner } from '@material-tailwind/react';
import { Skeleton } from './ui/skeleton';

const ProductCard = ({ onClick, prod }) => {

    const [isFavourite, setIsFavourite] = useState(false);

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch(`/data/products2.json`)
        .then(res => res.json())
        .then(data => {
            const product = data.find(item => item.slug === prod);
            if (product) {
                const images = product.images.split('|').map(imageBlock => {
                    const [url, alt, title, desc, caption] = imageBlock.split('!').map(str => str.split(':').pop().trim());
                    return { url, alt, title, desc, caption };
                });
                product.images = images;
            }
            setProduct(product);
            setTimeout(() => setLoading(false), 1000);
        })
        .catch(err => {
            setLoading(false);
            console.error(err);
        });
    }, [prod]);
    

  return (
    <div className='w-full flex flex-col justify-start items-start gap-3 relative rounded-lg lg:rounded-xl overflow-hidden'>
        {
            loading
            ?
            <>
                <Skeleton className='w-full aspect-[16/11]' />
                <Skeleton className='w-full h-14' />
                <Skeleton className='w-full h-7' />
            </>
            :
            <>
                {
                    product.sale_price > 0 && <div className='absolute top-0 left-0 bg-primaryStiles text-dark px-3 py-2 lg:py-2 text-sm font-bold z-20 uppercase rounded-br-lg lg:rounded-br-xl min-w-32 text-center'>Promo</div>
                }
                <img src={product?.images[0].url} alt="Product Image" className='w-full rounded-lg lg:rounded-xl aspect-[16/11] object-contain object-center relative z-0 cursor-pointer' onClick={onClick} />
                <div className={`absolute top-3 lg:top-4 right-3 lg:right-6 rounded-full flex justify-center items-center z-10 size-12 cursor-pointer group transition-all scale-90 hover:scale-100 drop-shadow-md ${isFavourite ? "bg-danger" : "bg-white"}`} onClick={() => setIsFavourite(!isFavourite)}>
                    <FaHeart size={20} className={`transition-all ${isFavourite ? "fill-white" : "fill-dark"}`} />
                    
                </div>
                <h3 onClick={onClick} className='font-bold text-xl cursor-pointer'>{product?.title}</h3>
                <div onClick={onClick} className="flex justify-start items-center gap-3 w-full cursor-pointer">
                    <p className='text-lg font-medium'>R{product?.regular_price}.00 m<sup>2</sup></p>
                    <p className='text-sm text-opaque'>{product?.sku}</p>
                </div>
            </>
        }
    </div>
  )
}

export default ProductCard