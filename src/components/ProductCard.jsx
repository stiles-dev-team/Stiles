import React from 'react'
import { FaRegHeart } from "react-icons/fa";
import PropTypes from 'prop-types';

const ProductCard = ({ promo }) => {

    ProductCard.propTypes = {
        promo: PropTypes.bool,
    };
    
    // Define default props
    ProductCard.defaultProps = {
        promo: false,
    };

  return (
    <a href="#" className='w-full flex flex-col justify-start items-start gap-3 relative rounded-lg lg:rounded-xl overflow-hidden'>
        {
            promo && <div className='absolute top-0 left-0 bg-primary text-dark px-4 py-2 lg:py-3 text-sm font-bold z-20 uppercase rounded-br-lg lg:rounded-br-xl min-w-32 text-center'>Promo</div>
        }
        <img src="/images/product_ph.png" alt="Product Image" className='w-full rounded-lg lg:rounded-xl aspect-video object-cover object-center relative z-0' />
        <div className='absolute top-3 lg:top-6 right-3 lg:right-6 bg-white rounded-full flex justify-center items-center z-10 size-12 cursor-pointer group transition-all hover:bg-danger'>
            <FaRegHeart size={20} className='transition-all fill-dark group-hover:fill-white' />
        </div>
        <h3 className='font-bold text-xl'>Tuscania Ceramiche Limestone Ice Matt Rectified 1222x1222mm</h3>
        <div className="flex justify-start items-center gap-3 w-full">
            <p className='text-lg font-medium'>R370.00 m<sup>2</sup></p>
            <p className='text-sm text-opaque'>600x1200mm</p>
        </div>
    </a>
  )
}

export default ProductCard