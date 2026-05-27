import React, { useState, useEffect } from 'react'
import Layout from '../layout/Layout'
import { Card, Typography, Checkbox } from "@material-tailwind/react";
import { RiHandbagLine } from "react-icons/ri";
import { toast } from 'sonner';
import { Helmet } from 'react-helmet-async';
const Wishlist = () => {
    return (
        <Layout>
            <Helmet>
                <title>My Wishlist | Save Your Favorite Tiles | Stiles</title>
                <meta name="description" content="View and manage your saved tile wishlist at Stiles. Save your favorite tiles and easily add them to your cart when ready to purchase." />
                <meta name="keywords" content="wishlist, saved tiles, favorite tiles, Stiles, tile retailer, South Africa" />
                <meta property="og:title" content="My Wishlist | Save Your Favorite Tiles | Stiles" />
                <meta property="og:description" content="View and manage your saved tile wishlist at Stiles. Save your favorite tiles and easily add them to your cart when ready to purchase." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://staging.stiles.co.za/wishlist" />
                <meta property="og:site_name" content="Stiles" />
                <meta property="og:locale" content="en_ZA" />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content="My Wishlist | Save Your Favorite Tiles | Stiles" />
                <meta name="twitter:description" content="View and manage your saved tile wishlist at Stiles. Save your favorite tiles and easily add them to your cart when ready to purchase." />
                <link rel="canonical" href="https://staging.stiles.co.za/wishlist" />
            </Helmet>
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
      <section id='heroHome' className='w-full h-[45vh] bg-black relative flex flex-col justify-center items-center pt-20'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
            <h1 className='text-white font-bold text-5xl text-center'>Wishlist</h1>
            <p className='uppercase text-white font-bold text-center'>Home / Wishlist</p>
        </div>
      </section>
    )
}

const Main = () => {
    const [loading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [quantities, setQuantities] = useState({});

    useEffect(() => {
        // Load wishlist from localStorage
        const wishlist = JSON.parse(localStorage.getItem('stiles_wishlist_ls') || '[]');
        setWishlistItems(wishlist);
        setLoading(false);
        // Initialize quantities
        const initialQuantities = {};
        wishlist.forEach(item => {
            initialQuantities[item.slug] = 1;
        });
        setQuantities(initialQuantities);
    }, []);

    const handleQuantityChange = (slug, newValue) => {
        setQuantities(prev => ({
            ...prev,
            [slug]: Math.max(1, newValue)
        }));
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedItems(wishlistItems.map(item => item.slug));
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

    const removeFromWishlist = (slug) => {
        const newWishlist = wishlistItems.filter(item => item.slug !== slug);
        setWishlistItems(newWishlist);
        localStorage.setItem('stiles_wishlist_ls', JSON.stringify(newWishlist));
        toast.error(`Product removed from wishlist`);
    };

    const addToCart = (item) => {
        const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
        const quantity = quantities[item.slug] || 1;
        
        // Check if item already exists in cart
        const existingItemIndex = cart.findIndex(cartItem => cartItem.slug === item.slug);
        
        if (existingItemIndex !== -1) {
            // Update quantity if item exists
            cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
        } else {
            // Add new item with quantity
            cart.push({
                ...item,
                quantity: quantity
            });
        }
        toast.success(`${item.title} x ${quantity} added to cart`);
        localStorage.setItem('stiles_cart_ls', JSON.stringify(cart));
    };

    const addSelectedToCart = () => {
        const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
        
        selectedItems.forEach(slug => {
            const item = wishlistItems.find(item => item.slug === slug);
            if (item) {
                const quantity = quantities[item.slug] || 1;
                const existingItemIndex = cart.findIndex(cartItem => cartItem.slug === item.slug);
                
                if (existingItemIndex !== -1) {
                    cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
                } else {
                    cart.push({
                        ...item,
                        price: item.regular_price,
                        quantity: quantity
                    });
                }
            }
        });
        toast.success(`All selected items added to cart`);
        localStorage.setItem('stiles_cart_ls', JSON.stringify(cart));
    };

    const addAllToCart = () => {
        const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]');
        
        wishlistItems.forEach(item => {
            const quantity = quantities[item.slug] || 1;
            const existingItemIndex = cart.findIndex(cartItem => cartItem.slug === item.slug);
            
            if (existingItemIndex !== -1) {
                cart[existingItemIndex].quantity = (cart[existingItemIndex].quantity || 1) + quantity;
            } else {
                cart.push({
                    ...item,
                    price: item.regular_price,
                    quantity: quantity
                });
            }
        });
        toast.success(`All items added to cart`);
        localStorage.setItem('stiles_cart_ls', JSON.stringify(cart));
    };

    if (wishlistItems.length === 0) {
        return (
            <section className='container mx-auto px-4'>
                <h2 className='font-bold text-3xl mb-4'>Your Wishlist</h2>
                <p className='text-gray-600'>Your wishlist is empty. Add some products to your wishlist!</p>
            </section>
        );
    }

    return (
        <section className='container mx-auto px-4 relative'>
            <h2 className='font-bold text-3xl'>Your Wishlist</h2>
            <section className="w-full bg-white pt-6">
                <Card className="h-full w-full border border-gray-300 px-6 hidden lg:block">
                    <table className="w-full min-w-max table-auto text-left">
                    <thead>
                        <tr>
                            <th className="border-b border-gray-300 pb-4 pt-10">
                                <Checkbox 
                                    ripple={false} 
                                    color='yellow'
                                    checked={selectedItems.length === wishlistItems.length}
                                    onChange={handleSelectAll}
                                />
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
                        {wishlistItems.map((item) => (
                            <tr key={item.slug} className="hover:bg-gray-50">
                                <td>
                                    <Checkbox 
                                        ripple={false} 
                                        color='yellow'
                                        checked={selectedItems.includes(item.slug)}
                                        onChange={() => handleSelectItem(item.slug)}
                                    />
                                </td>
                                <td className='flex justify-start items-center gap-2 py-2'>
                                    <a href={"/product/" + item.slug} key={item.id}>
                                        <img src={item.images[0].url} className="size-16 object-cover" alt={item.title} />
                                    </a>
                                    <a href={"/product/" + item.slug} key={item.id}>
                                        <Typography
                                            variant="small"
                                            className="font-normal text-gray-600 underline"
                                        >
                                            {item.title}
                                        </Typography>
                                    </a>
                                </td>
                                <td>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600 text-center"
                                    >
                                        R{item.regular_price}.00 m2
                                    </Typography>
                                </td>
                                <td>
                                    <Typography
                                        variant="small"
                                        className="font-normal text-gray-600 text-center"
                                    >
                                        {new Date(item.dateAdded).toLocaleDateString()}
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
                                        <button 
                                            className='text-dark font-negro aspect-square w-7'
                                            onClick={() => handleQuantityChange(item.slug, quantities[item.slug] - 1)}
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            className='border-0 appearance-none text-dark text-center w-24 outline-none' 
                                            min={1} 
                                            value={quantities[item.slug]} 
                                            onChange={(e) => handleQuantityChange(item.slug, parseInt(e.target.value))}
                                        />
                                        <button 
                                            className='text-dark font-negro aspect-square w-7'
                                            onClick={() => handleQuantityChange(item.slug, quantities[item.slug] + 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </td>
                                <td>
                                    <div className='flex flex-col gap-2'>
                                        <button 
                                            className='text-xs bg-black text-white rounded-full py-3 px-5 flex justify-center items-center gap-2'
                                            onClick={() => addToCart(item)}
                                        >
                                            ADD TO CART
                                            <RiHandbagLine fill='white' size={14} />
                                        </button>
                                        <button 
                                            className='text-xs text-danger hover:underline'
                                            onClick={() => removeFromWishlist(item.slug)}
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    </table>
                </Card>

                {/* Mobile View */}
                <Card className="h-full w-full border border-gray-300 px-3 lg:hidden flex flex-col justify-start items-start gap-2 py-5">
                    {wishlistItems.map((item) => (
                        <div key={item.slug} className='w-full flex flex-col justify-start items-center gap-3 pb-10'>
                            <div className='w-full flex justify-center items-center -mb-2'>
                                <Checkbox 
                                    ripple={false} 
                                    color='yellow'
                                    checked={selectedItems.includes(item.slug)}
                                    onChange={() => handleSelectItem(item.slug)}
                                />
                            </div>
                            <a href={"/product/" + item.slug} key={item.id}>
                                <img src={item.images[0].url} className="w-8/12 object-cover aspect-square" alt={item.title} />
                            </a>
                            <a href={"/product/" + item.slug} key={item.id}>
                                <h2 className='text-center font-normal text-gray-600 text-base'>{item.title}</h2>
                            </a>
                            <p className='text-center font-normal text-gray-600 text-base'>R{item.regular_price}.00 m2</p>
                            <p className='text-center font-normal text-gray-600 text-base'>{new Date(item.dateAdded).toLocaleDateString()}</p>
                            <p className='text-center font-normal text-gray-600 text-base'>boxes in stock</p>
                            <div className="flex flex-row justify-between lg:justify-start items-center border border-azul p-2 rounded-md w-full lg:w-fit">
                                <button 
                                    className='text-dark font-negro aspect-square w-7'
                                    onClick={() => handleQuantityChange(item.slug, quantities[item.slug] - 1)}
                                >
                                    -
                                </button>
                                <input 
                                    type="number" 
                                    className='border-0 appearance-none text-dark text-center w-24 outline-none' 
                                    min={1} 
                                    value={quantities[item.slug]}
                                    onChange={(e) => handleQuantityChange(item.slug, parseInt(e.target.value))}
                                />
                                <button 
                                    className='text-dark font-negro aspect-square w-7'
                                    onClick={() => handleQuantityChange(item.slug, quantities[item.slug] + 1)}
                                >
                                    +
                                </button>
                            </div>
                            <div className='flex flex-col gap-2 w-full'>
                                <button 
                                    className='text-xs bg-black text-white rounded-full py-3 px-5 flex justify-center items-center gap-2 w-full'
                                    onClick={() => addToCart(item)}
                                >
                                    ADD TO CART
                                    <RiHandbagLine fill='white' size={14} />
                                </button>
                                <button 
                                    className='text-xs text-danger hover:underline'
                                    onClick={() => removeFromWishlist(item.slug)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </Card>
            </section>
            <div className='w-full flex flex-col lg:flex-row justify-between items-center pt-10'>
                {/* <button className='text-xs bg-black text-white rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full lg:w-fit'>
                    ASK FOR AN ESTIMATE
                </button> */}
                <div className='flex flex-col lg:flex-row justify-end items-center gap-3 w-full lg:w-fit pt-3 lg:pt-0'>
                    <button 
                        className='text-xs bg-white border border-dark text-dark font-bold rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full lg:w-fit'
                        disabled={selectedItems.length === 0}
                        onClick={addSelectedToCart}
                    >
                        ADD SELECTED TO CART
                    </button>
                    <button 
                        className='text-xs bg-white border border-dark text-dark font-bold rounded-full py-4 px-10 flex justify-center items-center gap-2 w-full lg:w-fit'
                        disabled={wishlistItems.length === 0}
                        onClick={addAllToCart}
                    >
                        ADD ALL TO CART
                    </button>
                </div>
            </div>
        </section>
    )
}