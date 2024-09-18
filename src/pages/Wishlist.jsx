import React from 'react'
import Layout from '../layout/Layout'

import { Card, Typography, Checkbox } from "@material-tailwind/react";

import { RiHandbagLine } from "react-icons/ri";

const Wishlist = () => {
    return (
        <Layout>
          <main className='w-full flex flex-col justify-start items-start gap-10 lg:gap-20 pb-10 lg:pb-20 '>
            <Hero />
            <Main />
          </main>
        </Layout>
      )
}

export default Wishlist

const Hero = () => {
    return (
      <section id='heroHome' className='w-full h-[45vh] bg-dark relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>Wishlist</h1>
            <p className='uppercase text-white font-bold text-center'>Home / Wishlist</p>
        </div>
      </section>
    )
}

const Main = () => {
    return (
        <section className='container mx-auto px-4'>
            <h2 className='font-bold text-3xl'>Your Wishlist</h2>
            <section className="w-full bg-white pt-6">
                <Card className="h-full w-full border border-gray-300 px-6 hidden lg:block">
                    <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Checkbox ripple={false} color='yellow' />
                            </th>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-bold leading-none"
                                >
                                    PRODUCT NAME
                                </Typography>
                            </th>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-bold leading-none text-center"
                                >
                                    UNIT PRICE
                                </Typography>
                            </th>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-bold leading-none text-center"
                                >
                                    DATE ADDED
                                </Typography>
                            </th>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-bold leading-none text-center"
                                >
                                    STOCK STATUS
                                </Typography>
                            </th>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Typography
                                    variant="small"
                                    color="blue-gray"
                                    className="font-bold leading-none text-center"
                                >
                                    QTY
                                </Typography>
                            </th>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="hover:bg-gray-50">
                            <td>
                                <Checkbox ripple={false} color='yellow' />
                            </td>
                            <td className='flex justify-start items-center gap-2 py-2'>
                                <img src="/images/product_ph.png" className="size-16 object-cover" />
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    R2,399.00 m2
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    July 24, 2024
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Boxes in stock
                                </Typography>
                            </td>
                            <td>
                                <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                    <button className='text-dark font-negro aspect-square w-7'>-</button>
                                    <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                                    <button className='text-dark font-negro aspect-square w-7'>+</button>
                                </div>
                            </td>
                            <td>
                                <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2'>
                                    ADD TO CART
                                    <RiHandbagLine fill='white' size={14} />
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td>
                                <Checkbox ripple={false} color='yellow' />
                            </td>
                            <td className='flex justify-start items-center gap-2 py-2'>
                                <img src="/images/product_ph.png" className="size-16 object-cover" />
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    R2,399.00 m2
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    July 24, 2024
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Boxes in stock
                                </Typography>
                            </td>
                            <td>
                                <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                    <button className='text-dark font-negro aspect-square w-7'>-</button>
                                    <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                                    <button className='text-dark font-negro aspect-square w-7'>+</button>
                                </div>
                            </td>
                            <td>
                                <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2'>
                                    ADD TO CART
                                    <RiHandbagLine fill='white' size={14} />
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td>
                                <Checkbox ripple={false} color='yellow' />
                            </td>
                            <td className='flex justify-start items-center gap-2 py-2'>
                                <img src="/images/product_ph.png" className="size-16 object-cover" />
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    R2,399.00 m2
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    July 24, 2024
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Boxes in stock
                                </Typography>
                            </td>
                            <td>
                                <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                    <button className='text-dark font-negro aspect-square w-7'>-</button>
                                    <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                                    <button className='text-dark font-negro aspect-square w-7'>+</button>
                                </div>
                            </td>
                            <td>
                                <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2'>
                                    ADD TO CART
                                    <RiHandbagLine fill='white' size={14} />
                                </button>
                            </td>
                        </tr>
                        <tr className="hover:bg-gray-50">
                            <td>
                                <Checkbox ripple={false} color='yellow' />
                            </td>
                            <td className='flex justify-start items-center gap-2 py-2'>
                                <img src="/images/product_ph.png" className="size-16 object-cover" />
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    R2,399.00 m2
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    July 24, 2024
                                </Typography>
                            </td>
                            <td>
                                <Typography
                                variant="small"
                                className="font-normal text-gray-600 text-center"
                                >
                                    Boxes in stock
                                </Typography>
                            </td>
                            <td>
                                <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                    <button className='text-dark font-negro aspect-square w-7'>-</button>
                                    <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                                    <button className='text-dark font-negro aspect-square w-7'>+</button>
                                </div>
                            </td>
                            <td>
                                <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2'>
                                    ADD TO CART
                                    <RiHandbagLine fill='white' size={14} />
                                </button>
                            </td>
                        </tr>
                        
                    </tbody>
                    </table>
                </Card>
                <Card className="h-full w-full border border-gray-300 px-3 lg:hidden flex flex-col justify-start items-start gap-2 py-5">
                    <div className='w-full flex flex-col justify-start items-center gap-3 pb-10'>
                        <img src="/images/product_ph.png" className="w-8/12 object-cover aspect-square" />
                        <h2 className='text-center font-normal text-gray-600 text-base'>Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm</h2>
                        <p className='text-center font-normal text-gray-600 text-base'>R2,399.00 m2</p>
                        <p className='text-center font-normal text-gray-600 text-base'>July 24, 2024</p>
                        <p className='text-center font-normal text-gray-600 text-base'>boxes in stock</p>
                        <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                            <button className='text-dark font-negro aspect-square w-7'>-</button>
                            <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                            <button className='text-dark font-negro aspect-square w-7'>+</button>
                        </div>
                        <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2 w-full'>
                            ADD TO CART
                            <RiHandbagLine fill='white' size={14} />
                        </button>
                    </div>
                    <div className='w-full flex flex-col justify-start items-center gap-3 pb-10'>
                        <img src="/images/product_ph.png" className="w-8/12 object-cover aspect-square" />
                        <h2 className='text-center font-normal text-gray-600 text-base'>Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm</h2>
                        <p className='text-center font-normal text-gray-600 text-base'>R2,399.00 m2</p>
                        <p className='text-center font-normal text-gray-600 text-base'>July 24, 2024</p>
                        <p className='text-center font-normal text-gray-600 text-base'>boxes in stock</p>
                        <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                            <button className='text-dark font-negro aspect-square w-7'>-</button>
                            <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                            <button className='text-dark font-negro aspect-square w-7'>+</button>
                        </div>
                        <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2 w-full'>
                            ADD TO CART
                            <RiHandbagLine fill='white' size={14} />
                        </button>
                    </div>
                    <div className='w-full flex flex-col justify-start items-center gap-3 pb-10'>
                        <img src="/images/product_ph.png" className="w-8/12 object-cover aspect-square" />
                        <h2 className='text-center font-normal text-gray-600 text-base'>Funky Tiles Cuore My C Deluxe Cream Gloss Rectified 100x390mm</h2>
                        <p className='text-center font-normal text-gray-600 text-base'>R2,399.00 m2</p>
                        <p className='text-center font-normal text-gray-600 text-base'>July 24, 2024</p>
                        <p className='text-center font-normal text-gray-600 text-base'>boxes in stock</p>
                        <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                            <button className='text-dark font-negro aspect-square w-7'>-</button>
                            <input type="number" className=' border-0 appearance-none text-dark text-center w-24 outline-none' min={1} value={1} />
                            <button className='text-dark font-negro aspect-square w-7'>+</button>
                        </div>
                        <button className='text-xs bg-dark text-white rounded-full py-3 px-5 flex justify-center items-center gap-2 w-full'>
                            ADD TO CART
                            <RiHandbagLine fill='white' size={14} />
                        </button>
                    </div>
                </Card>
            </section>
            <div className='w-full flex flex-col lg:flex-row justify-between items-center pt-10'>
                <button className='text-xs bg-dark text-white rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full lg:w-fit'>
                ASK FOR AN ESTIMATE
                </button>
                <div className='flex flex-col lg:flex-row justify-end items-center gap-3 w-full lg:w-fit pt-3 lg:pt-0'>
                    <button className='text-xs bg-white border border-dark text-dark font-bold rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full lg:w-fit'>
                    ADD SELECTED TO CART
                    </button>
                    <button className='text-xs bg-white border border-dark text-dark font-bold rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full lg:w-fit'>
                    ADD ALL TO CART
                    </button>
                </div>
            </div>
        </section>
    )
}