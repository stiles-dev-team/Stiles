import React from 'react'
import { Link } from 'react-router-dom'
import { Chip } from "@material-tailwind/react";

const BlogCard = ({ title, cat, img, desc, slug }) => {
  return (
    <Link to={`/stiles-blog/${slug}`} className='w-full relative flex flex-col justify-start items-start gap-6'>
        <div className='w-full relative flex flex-col justify-center items-center'>
            <img src={img} alt="Blog Main Image" className='w-full aspect-square object-cover object-center rounded-lg lg:rounded-2xl relative z-0' />
            <p className="rounded-full absolute z-10 -bottom-4 text-white uppercase bg-dark py-2 px-4 text-xs ">{cat}</p>
        </div>
        <h2 className='pt-1 font-bold lg:text-lg leading-snug uppercase'>
          {title}
        </h2>
        <p className='-mt-4 text-sm text-gray-500'>
          {desc}
        </p>
    </Link>
  )
}

export default BlogCard