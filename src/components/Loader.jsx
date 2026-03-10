import React from 'react'

const Loader = () => {
  return (
    <div className='w-full h-full flex justify-center items-center absolute top-0 left-0 z-9999999 bg-black/50'>
        <div className='w-10 h-10 border-2 border-gray-300 border-t-transparent rounded-full animate-spin'></div>
    </div>
  )
}

export default Loader