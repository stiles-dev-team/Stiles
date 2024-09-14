import React from 'react'

import { Chip } from "@material-tailwind/react";

const BlogCard = () => {
  return (
    <a href="#" className='w-full relative flex flex-col justify-center items-start gap-6'>
        <div className='w-full relative flex flex-col justify-center items-center'>
            <img src="/images/hero.png" alt="Blog Main Image" className='w-full aspect-[10/8] object-cover object-center rounded-lg lg:rounded-2xl relative z-0' />
            <p className="rounded-full absolute z-10 -bottom-4 text-white uppercase bg-dark py-2 px-4 text-xs ">Décor Inspiration</p>
        </div>
        <h2 className='pt-1 font-bold lg:text-lg leading-snug uppercase'>Elevate Your Home Décor with Matiz: A Guide to Using Pastel Colour Decor Tiles with Stiles Tiles</h2>
    </a>
  )
}

export default BlogCard