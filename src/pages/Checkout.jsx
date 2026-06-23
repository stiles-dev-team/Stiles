import React, { useState, useEffect } from 'react'
import LayoutDark from '../layout/LayoutDark'
import { Card, Input, Select, Option, Checkbox, Textarea } from "@material-tailwind/react"
import { RiHandbagLine } from "react-icons/ri"
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { formatCurrency } from '../utils/pricingUtils';

const Checkout = () => {
  const { isAuthenticated, token, user } = useAuth()
  const navigate = useNavigate()
  const [cartItems, setCartItems] = useState([])
  const [orderItems, setOrderItems] = useState([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [locations, setLocations] = useState([])
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    shoppingType: '',
    storeLocation: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    orderNotes: '',
    termsAccepted: false
  })
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderStatus, setOrderStatus] = useState(null)

  useEffect(() => {
    // Debug authentication state
    console.log('Auth State:', {
      isAuthenticated,
      token,
      user,
      hasCart: localStorage.getItem('stiles_cart_ls') !== null
    })

    // Only redirect if definitely not authenticated
    if (isAuthenticated === false) {
      console.log('Not authenticated, redirecting to login')
      navigate('/login')
      return
    }

    const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]')
    if (cart.length === 0) {
      console.log('Cart is empty, redirecting to cart')
      navigate('/cart')
      return
    }
    setCartItems(cart)

    // Set user info in shipping form
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || ''
      }))
    }

    // Fetch store locations
    fetch('/data/stiles-locations.json')
      .then(res => res.json())
      .then(data => {
        setLocations(data.locations || [])
      })
      .catch(err => {
        console.error('Error loading store locations:', err)
      })
  }, [isAuthenticated, token, user, navigate])

  const calculateSubtotal = (item) => {
    return item.price * (item.quantity || 1)
  }

  const calculateTotal = () => {
    // Use preserved order total if we're on the success step (step 4)
    if (step === 4 && orderTotal > 0) {
      return orderTotal
    }
    return cartItems.reduce((total, item) => total + calculateSubtotal(item), 0)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setShippingInfo(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleContinue = () => {
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => prev - 1)
  }

  // Validation functions for each step
  const isStep1Valid = () => {
    return shippingInfo.firstName.trim() !== '' &&
           shippingInfo.lastName.trim() !== '' &&
           shippingInfo.phone.trim() !== '' &&
           shippingInfo.email.trim() !== '' &&
           shippingInfo.shoppingType !== ''
  }

  const isStep2Valid = () => {
    return shippingInfo.storeLocation !== '' &&
           shippingInfo.streetAddress.trim() !== '' &&
           shippingInfo.city.trim() !== '' &&
           shippingInfo.state.trim() !== '' &&
           shippingInfo.zipCode.trim() !== ''
  }

  const isStep3Valid = () => {
    return shippingInfo.termsAccepted
  }

  const isCurrentStepValid = () => {
    switch (step) {
      case 1:
        return isStep1Valid()
      case 2:
        return isStep2Valid()
      case 3:
        return isStep3Valid()
      default:
        return true
    }
  }

  const createOrder = async (orderData) => {
    if (!user?.id) {
      console.error('No user ID available');
      throw new Error('User ID required');
    }

    console.log('User ID:', user.id);
    console.log('Sending order data:', orderData);
    
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    console.log('Request headers:', headers);
    
    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-order.php`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                ...orderData,
                userId: user.id
            }),
            mode: 'cors'
        });
        
        const data = await response.json();
        console.log('Order response:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create order');
        }
        
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
  };

  const handlePlaceOrder = async () => {
    if (step === 3 && shippingInfo.termsAccepted) {
      setIsSubmitting(true);
      setOrderStatus('submitting');
      
      try {
        // Save current cart items to orderItems state before clearing
        setOrderItems(cartItems);
        
        // Preserve the order total before clearing cart
        const currentTotal = calculateTotal();
        setOrderTotal(currentTotal);
        
        // Log cart items for debugging
        console.log('Raw cart items:', JSON.stringify(cartItems, null, 2));

        // Prepare items with required fields
        const orderItems = cartItems.map(item => {
          console.log('Processing cart item:', item);
          // Extract product ID from SKU (assuming SKU format is like "004-5062696A")
          const productId = item.sku ? parseInt(item.sku.split('-')[0]) : null;
          
          const preparedItem = {
            id: productId, // Use the extracted product ID
            title: item.title || item.name,
            images: item.images || [],
            regular_price: item.price || item.price,
            quantity: item.quantity || 1,
            sku: item.sku || ''
          };
          console.log('Prepared item:', preparedItem);
          return preparedItem;
        });

        console.log('Final order items:', JSON.stringify(orderItems, null, 2));

        const orderData = {
          ...shippingInfo,
          items: orderItems,
          total: calculateTotal(),
          paymentMethod: shippingInfo.shoppingType
        };
        
        console.log('Final order data:', JSON.stringify(orderData, null, 2));
        
        const result = await createOrder(orderData);
        
        // Clear cart after successful order
        localStorage.removeItem('stiles_cart_ls');
        setCartItems([]);
        
        setOrderStatus('success');
        setStep(4);
      } catch (error) {
        console.error('Error in handlePlaceOrder:', error);
        setOrderStatus('error');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <LayoutDark>
      <Helmet>
        <title>Checkout | Stiles</title>
        <meta name="description" content="Checkout on Stiles" />
      </Helmet>
      <div className='container mx-auto px-4 py-8 pt-40 min-h-[80dvh]'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Section - Form */}
          <div className='w-full lg:w-7/12'>
            <div className='flex items-center justify-center mb-8'>
              <div className='flex items-center'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</div>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-black text-white' : 'bg-gray-200'}`}>3</div>
              </div>
            </div>

            <Card className="p-6">
              {step === 1 && (
                <div className='space-y-4'>
                  <h2 className='text-xl font-bold mb-4'>Personal Information</h2>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <Input
                      type="text"
                      label="First Name"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                    />
                    <Input
                      type="text"
                      label="Last Name"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <Input
                        type="tel"
                        label="Phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                    />
                    <Input
                        type="email"
                        label="Email Address"
                        name="email"
                        value={shippingInfo.email}
                        onChange={handleInputChange}
                    />
                  </div>
                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                    <Input
                        type="text"
                        label="Company Name (Optional)"
                        name="companyName"
                        value={shippingInfo.companyName}
                        onChange={handleInputChange}
                    />
                    <Select 
                        label="How are you Shopping?" 
                        name="shoppingType"
                        value={shippingInfo.shoppingType}
                        onChange={(value) => handleInputChange({ target: { name: 'shoppingType', value }})}
                    >
                        <Option value="in-store">In Store</Option>
                        <Option value="online">Online</Option>
                    </Select>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className='space-y-4'>
                  <h2 className='text-xl font-bold mb-4'>Contact & Delivery Information</h2>
                  <Select 
                    label="Store Location" 
                    name="storeLocation"
                    value={shippingInfo.storeLocation}
                    onChange={(value) => handleInputChange({ target: { name: 'storeLocation', value }})}
                  >
                    {locations.map((location, index) => (
                      <Option key={index} value={location.title}>{location.title}</Option>
                    ))}
                  </Select>
                  <Input
                    type="text"
                    label="Street Address"
                    name="streetAddress"
                    value={shippingInfo.streetAddress}
                    onChange={handleInputChange}
                  />
                  <Input
                    type="text"
                    label="Town/City"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                  />
                  <Input
                    type="text"
                    label="State/Country"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleInputChange}
                  />
                  <Input
                    type="text"
                    label="Postcode/ZIP"
                    name="zipCode"
                    value={shippingInfo.zipCode}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {step === 3 && (
                <div className='space-y-4'>
                  <h2 className='text-xl font-bold mb-4'>Additional Information</h2>
                  <Textarea
                    label="Order Notes (Optional)"
                    name="orderNotes"
                    value={shippingInfo.orderNotes}
                    onChange={handleInputChange}
                  />
                  <div className='flex items-center gap-3'>
                    <Checkbox
                      name="termsAccepted"
                      checked={shippingInfo.termsAccepted}
                      onChange={handleInputChange}
                    />
                    <label className='text-sm'>
                      I have read and agree to the website{' '}
                      <a href="/stiles-terms-and-conditions-of-sale" className='text-dark hover:underline' target="_blank">
                        terms and conditions
                      </a>
                    </label>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className='space-y-4 text-center py-8'>
                  {orderStatus === 'success' ? (
                    <>
                      <div className='text-green-500 text-5xl mb-4'>✓</div>
                      <h2 className='text-2xl font-bold mb-2'>Order Placed Successfully!</h2>
                      <p className='text-gray-600 mb-6'>Thank you for your order. We'll send you a confirmation email shortly.</p>
                      <a 
                        href="/" 
                        className='px-6 py-2 bg-black text-white rounded-full hover:bg-black/90 transition-all inline-block'
                      >
                        Continue Shopping
                      </a>
                    </>
                  ) : orderStatus === 'error' ? (
                    <>
                      <div className='text-red-500 text-5xl mb-4'>✕</div>
                      <h2 className='text-2xl font-bold mb-2'>Order Failed</h2>
                      <p className='text-gray-600 mb-6'>There was an error processing your order. Please try again or contact support.</p>
                      <button 
                        onClick={() => setStep(3)} 
                        className='px-6 py-2 bg-black text-white rounded-full hover:bg-black/90 transition-all'
                      >
                        Go Back
                      </button>
                    </>
                  ) : (
                    <div className='flex flex-col items-center'>
                      <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark mb-4'></div>
                      <p className='text-gray-600'>Processing your order...</p>
                    </div>
                  )}
                </div>
              )}

              {step < 4 && (
                <div className='flex justify-between mt-6'>
                  {step > 1 && (
                    <button
                      onClick={handleBack}
                      className='px-6 py-2 border border-dark text-dark rounded-full hover:bg-black hover:text-white transition-all'
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={step === 3 ? handlePlaceOrder : handleContinue}
                    disabled={!isCurrentStepValid() || isSubmitting}
                    className='px-6 py-2 bg-black text-white rounded-full hover:bg-black/90 transition-all ml-auto disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {step === 3 ? 'Place Order' : 'Continue'}
                  </button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Section - Order Summary */}
          <div className='w-full lg:w-5/12'>
            <Card className="p-6">
              <h2 className='text-xl font-bold mb-4 flex items-center gap-2'>
                <RiHandbagLine className='text-dark' size={24} />
                Order Summary
              </h2>
              <div className='space-y-4'>
                {(step === 4 ? orderItems : cartItems).map((item, index) => (
                  <div key={index} className='flex items-center gap-4 py-3 border-b'>
                    <div className='relative'>
                      <img src={item.images[0].url} alt={item.title} className='w-20 h-20 object-cover rounded' />
                      <span className='absolute -top-2 -right-2 bg-black text-white w-5 h-5 rounded-full flex items-center justify-center text-xs'>
                        {item.quantity || 1}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium'>{item.title}</h3>
                      <p className='text-sm text-gray-600'>{item.sku}</p>
                    </div>
                    <p className='font-medium'>{formatCurrency(calculateSubtotal(item))}</p>
                  </div>
                ))}
                
                <div className='space-y-2 pt-4'>
                  {/* <div className='flex justify-between'>
                    <p className='text-gray-600'>Subtotal</p>
                    <p className='font-medium'>R{calculateTotal()}.00</p>
                  </div> */}
                  {/* <div className='flex justify-between'>
                    <p className='text-gray-600'>Shipping</p>
                    <p className='font-medium'>Calculated at next step</p>
                  </div> */}
                  <div className='flex justify-between pt-0'>
                    <p className='font-bold'>Total</p>
                    <p className='font-bold'>{formatCurrency(calculateTotal())}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </LayoutDark>
  )
}

export default Checkout