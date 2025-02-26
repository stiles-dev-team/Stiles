import React from 'react'
import Layout from '../layout/Layout'

import { Card, Typography, Checkbox } from "@material-tailwind/react";

import { RiHandbagLine } from "react-icons/ri";

const Cart = () => {
    return (
        <Layout>
          <main className='w-full flex flex-col justify-start items-start gap-10 lg:gap-10 pb-10 lg:pb-20 '>
            <Hero />
            <Main />
          </main>
        </Layout>
      )
}

export default Cart

const Hero = () => {
    return (
      <section id='heroHome' className='w-full h-[40vh] bg-dark relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>Generate Quote</h1>
        </div>
      </section>
    )
}

const Main = () => {
    return (
        <section className='container mx-auto px-4'>
            <div className='w-full grid grid-cols-6 gap-10'>                
                <section className="w-full bg-white pt-6 col-span-4">
                    <Card className="w-full border border-gray-300 px-6 block pb-4">
                        <table className="w-full overflow-x-auto table-auto text-left">
                        <thead>
                            <tr>
                                <th className="border-b border-gray-300 pb-4 pt-4">
                                    <Checkbox ripple={false} color='yellow' />
                                </th>
                                <th className="border-b border-gray-300 pb-4 pt-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-bold leading-none"
                                    >
                                        PRODUCT
                                    </Typography>
                                </th>
                                <th className="border-b border-gray-300 pb-4 pt-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-bold leading-none text-center"
                                    >
                                        PRICE
                                    </Typography>
                                </th>
                                <th className="border-b border-gray-300 pb-4 pt-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-bold leading-none text-center"
                                    >
                                        QTY
                                    </Typography>
                                </th>
                                <th className="border-b border-gray-300 pb-4 pt-4">
                                    <Typography
                                        variant="small"
                                        color="blue-gray"
                                        className="font-bold leading-none text-center"
                                    >
                                        SUBTOTAL
                                    </Typography>
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
                                    className="font-normal text-gray-600 text-left w-full max-w-64"
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
                                    <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                        <button className='text-dark font-negro aspect-square w-5'>-</button>
                                        <input type="text" className=' border-0 appearance-none text-dark text-center w-8 outline-none' value={1} />
                                        <button className='text-dark font-negro aspect-square w-5'>+</button>
                                    </div>
                                </td>
                                <td>
                                    <Typography
                                    variant="small"
                                    className="font-normal text-gray-600 text-center"
                                    >
                                        R2,399.00 m2
                                    </Typography>
                                </td>
                            </tr>
                            
                        </tbody>
                        </table>
                    </Card>
                </section>
                <section className="w-full bg-white pt-6 col-span-2">
                    <Card className="h-full w-full border border-gray-300 px-6 block p-4">
                        <h2 className='font-bold text-2xl text-dark'>Cart totals</h2>
                        <br />
                        <div className="w-full flex flex-row justify-between items-center gap-2 py-5 border-b border-b-dark/10">
                            <p className='text-sm font-bold'>Subtotal</p>
                            <p className='text-sm text-dark/70'>R2,399.00 m2</p>
                        </div>
                        <div className="w-full flex flex-row justify-between items-center gap-2 py-5 border-b border-b-dark/10">
                            <p className='text-sm font-bold'>Shipping</p>
                            <p className='text-sm text-dark/70'>Shipping not Included</p>
                        </div>
                        <div className="w-full flex flex-row justify-between items-center gap-2 py-5 mb-5">
                            <p className='text-lg font-bold'>Total</p>
                            <p className='text-lg text-dark/70'>R2,399.00 m2</p>
                        </div>
                        <button className='text-xs bg-dark text-white rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full'>
                        CONFIRM ORDER
                        </button>
                    </Card>
                </section>
            </div>
        </section>
    )
}