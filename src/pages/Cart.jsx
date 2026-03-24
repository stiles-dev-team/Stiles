import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { Card, Typography, Checkbox } from "@material-tailwind/react";
import { RiHandbagLine } from "react-icons/ri";
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
import { getPricingUnit, formatPriceWithUnit, formatCurrency } from '../utils/pricingUtils';

const Cart = () => {
    return (
        <Layout>
            <Helmet>
                <title>Your Cart | View Items In Your Cart | Stiles</title>
                <meta name="description" content="View and manage your shopping cart at Stiles. Browse your selected items and proceed to checkout." />
                <meta property="og:title" content="Your Cart | View Items In Your Cart | Stiles" />
                <meta property="og:description" content="View and manage your shopping cart at Stiles. Browse your selected items and proceed to checkout." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://stiles.co.za/cart" />
                <meta property="og:site_name" content="Stiles" />
                <meta property="og:locale" content="en_ZA" />
            </Helmet>
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
            <h1 className='text-white font-bold text-5xl text-center'>Request Order</h1>
        </div>
      </section>
    )
}

const Main = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        // Load cart from localStorage
        const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
        setCartItems(cart);
        // Initialize quantities
        const initialQuantities = {};
        cart.forEach(item => {
            initialQuantities[item.slug] = item.quantity || 1;
        });
        setQuantities(initialQuantities);
    }, []);

    const handleQuantityChange = (slug, newValue) => {
        // If newValue is empty string or NaN, default to 1
        const parsedValue = parseFloat(newValue);
        const validValue = isNaN(parsedValue) ? 1 : Math.max(0.1, parsedValue);
        setQuantities(prev => ({
            ...prev,
            [slug]: validValue
        }));
        
        // Update localStorage with new quantity
        const updatedCart = cartItems.map(item => 
            item.slug === slug ? { ...item, quantity: validValue } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('stiles_cart_ls', JSON.stringify(updatedCart));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(cartItems.map(item => item.slug));
        } else {
            setSelectedItems([]);
        }
    };

    const handleSelectItem = (slug) => {
        setSelectedItems(prev => {
            if (prev.includes(slug)) {
                return prev.filter(item => item !== slug);
            } else {
                return [...prev, slug];
            }
        });
    };

    const removeFromCart = (slug) => {
        const newCart = cartItems.filter(item => item.slug !== slug);
        setCartItems(newCart);
        localStorage.setItem('stiles_cart_ls', JSON.stringify(newCart));
        toast.error(`Product removed from cart`);
    };

    const calculateSubtotal = (item) => {
        return item.price * (quantities[item.slug] || 1);
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + calculateSubtotal(item), 0);
    };

    if (cartItems.length === 0) {
        return (
            <section className='container mx-auto px-4'>
                <h2 className='font-bold text-3xl mb-4'>Your Cart</h2>
                <p className='text-gray-600'>Your cart is empty. Add some products to your cart!</p>
            </section>
        );
    }

    return (
        <section className='container mx-auto px-4'>
            <div className='w-full grid grid-cols-1 lg:grid-cols-6 gap-1 lg:gap-10'>                
                <section className="w-full bg-white pt-6 col-span-1 lg:col-span-4">
                    <Card className="w-full border border-gray-300 px-6 block pb-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[640px] table-auto text-left">
                            <thead>
                                <tr>
                                    {/* <th className="border-b border-gray-300 pb-4 pt-4">
                                        <Checkbox 
                                            ripple={false} 
                                            color='yellow'
                                            checked={selectedItems.length === cartItems.length}
                                            onChange={handleSelectAll}
                                        />
                                    </th> */}
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
                                {cartItems.map((item) => (
                                    <tr key={item.slug} className="hover:bg-gray-50">
                                        {/* <td>
                                            <Checkbox 
                                                ripple={false} 
                                                color='yellow'
                                                checked={selectedItems.includes(item.slug)}
                                                onChange={() => handleSelectItem(item.slug)}
                                            />
                                        </td> */}
                                        <td className='flex justify-start items-center gap-2 py-2'>
                                            <a href={"/product/" + item.slug} key={item.id}>
                                                <img src={item.images[0].url} className="size-16 object-cover" alt={item.title} />
                                            </a>
                                            <div className="flex flex-col gap-1">
                                                <a href={"/product/" + item.slug} key={item.id}>
                                                    <Typography
                                                        variant="small"
                                                        className="font-normal text-gray-600 text-left w-full max-w-[200px] lg:max-w-64 cursor-pointer hover:underline"
                                                    >
                                                        {item.title}
                                                    </Typography>
                                                </a>
                                                <button 
                                                    className='text-xs text-danger hover:underline text-left'
                                                    onClick={() => removeFromCart(item.slug)}
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600 text-center"
                                            >
                                                {formatCurrency(item.price, getPricingUnit(item))}
                                            </Typography>
                                        </td>
                                        <td>
                                            <div className="flex flex-row justify-center items-center border border-azul p-2 rounded-md w-full lg:w-fit mx-auto">
                                                <button 
                                                    className='text-dark font-negro aspect-square w-5'
                                                    onClick={() => handleQuantityChange(item.slug, quantities[item.slug] - 1)}
                                                >
                                                    -
                                                </button>
                                                <input 
                                                    type="number" 
                                                    step="0.1"
                                                    min="0.1"
                                                    className='border-0 text-dark text-center outline-none appearance-none' 
                                                    style={{'WebkitAppearance': 'none', 'MozAppearance': 'textfield'}}
                                                    value={quantities[item.slug]} 
                                                    onChange={(e) => handleQuantityChange(item.slug, e.target.value)}
                                                />
                                                <button 
                                                    className='text-dark font-negro aspect-square w-5'
                                                    onClick={() => handleQuantityChange(item.slug, quantities[item.slug] + 1)}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td>
                                            <Typography
                                                variant="small"
                                                className="font-normal text-gray-600 text-center"
                                            >
                                                {formatCurrency(calculateSubtotal(item), getPricingUnit(item))}
                                            </Typography>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    </Card>
                </section>
                <section className="w-full bg-white pt-6 col-span-1 lg:col-span-2">
                    <Card className="h-full w-full border border-gray-300 px-6 block p-4">
                        <h2 className='font-bold text-2xl text-dark'>Cart totals</h2>
                        <br />
                        <div className="w-full flex flex-row justify-between items-center gap-2 py-5 border-b border-b-dark/10">
                            <p className='text-sm font-bold'>Subtotal</p>
                            <p className='text-sm text-dark/70'>{formatCurrency(calculateTotal())}</p>
                        </div>
                        <div className="w-full flex flex-row justify-between items-center gap-2 py-5 border-b border-b-dark/10">
                            <p className='text-sm font-bold'>Shipping</p>
                            <p className='text-sm text-dark/70'>Shipping not Included</p>
                        </div>
                        <div className="w-full flex flex-row justify-between items-center gap-2 py-5 mb-5">
                            <p className='text-lg font-bold'>Total</p>
                            <p className='text-lg text-dark/70'>{formatCurrency(calculateTotal())}</p>
                        </div>
                        <a href="/checkout" className='text-xs bg-dark text-white rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full'>
                            CONFIRM ORDER
                        </a>
                    </Card>
                </section>
            </div>
        </section>
    )
}