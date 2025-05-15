import React, { useState, useEffect } from 'react'
import LayoutDark from '../layout/LayoutDark'
import { Card, Input, Select, Option, Checkbox, Textarea } from "@material-tailwind/react"
import { RiHandbagLine } from "react-icons/ri"

const Checkout = () => {
  const [cartItems, setCartItems] = useState([])
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
    const cart = JSON.parse(localStorage.getItem('stiles_cart_ls') || '[]')
    setCartItems(cart)

    // Fetch store locations
    fetch('/data/stiles-locations.json')
      .then(res => res.json())
      .then(data => {
        setLocations(data.locations || [])
      })
      .catch(err => {
        console.error('Error loading store locations:', err)
      })
  }, [])

  const calculateSubtotal = (item) => {
    return item.regular_price * (item.quantity || 1)
  }

  const calculateTotal = () => {
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

  const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  }

  const createQuote = async () => {
    setIsSubmitting(true)
    setOrderStatus('submitting')
    
    try {
      const orderNumber = generateOrderNumber()
      const currentDate = new Date().toISOString()
      
      const quoteData = {
        orderNumber: orderNumber,
        documentNumber: `DOC-${orderNumber}`,
        internalOrderNumber: `INT-${orderNumber}`,
        currency: "ZAR",
        debtorAccount: "DEFAULT",
        items: cartItems.map(item => ({
          stockCode: item.sku || "N/A",
          stockDescription: item.title || "N/A",
          quantity: item.quantity || 1,
          itemPriceExcl: item.regular_price || 0,
          itemPriceIncl: item.regular_price || 0
        })),
        dAddress1: shippingInfo.streetAddress || "",
        dAddress2: "",
        dAddress3: shippingInfo.city || "",
        dAddress4: shippingInfo.state || "",
        telephone: shippingInfo.phone || "",
        email: shippingInfo.email || "",
        orderDate: currentDate,
        longDescription: shippingInfo.orderNotes || "",
        postalCode: shippingInfo.zipCode || "",
        vatNumber: "",
        salesRepresentativeNumber: 0,
        deliverMTH: "Standard",
        inclusive: false
      }

      // Create base64 encoded credentials
      const credentials = btoa('WebUser1142:e$Ye6!g]I~X@K!D')
      
      const response = await fetch('http://102.37.48.148:5006/Quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify(quoteData)
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Quote created successfully:', data)
      
      // Clear cart after successful order
      localStorage.removeItem('stiles_cart_ls')
      setCartItems([])
      
      setOrderStatus('success')
      setStep(4) // Move to success step
    } catch (error) {
      console.error('Error creating quote:', error)
      setOrderStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePlaceOrder = () => {
    if (step === 3 && shippingInfo.termsAccepted) {
      createQuote()
    }
  }

  return (
    <LayoutDark>
      <div className='container mx-auto px-4 py-8 pt-40 min-h-[80dvh]'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Left Section - Form */}
          <div className='w-full lg:w-7/12'>
            <div className='flex items-center justify-center mb-8'>
              <div className='flex items-center'>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-dark text-white' : 'bg-gray-200'}`}>1</div>
                <div className={`h-1 w-16 ${step >= 2 ? 'bg-dark' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-dark text-white' : 'bg-gray-200'}`}>2</div>
                <div className={`h-1 w-16 ${step >= 3 ? 'bg-dark' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-dark text-white' : 'bg-gray-200'}`}>3</div>
              </div>
            </div>

            <Card className="p-6">
              {step === 1 && (
                <div className='space-y-4'>
                  <h2 className='text-xl font-bold mb-4'>Personal Information</h2>
                  <div className='grid grid-cols-2 gap-4'>
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
                  <div className='grid grid-cols-2 gap-4'>
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
                  <div className='grid grid-cols-2 gap-4'>
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
                      <a href="/terms" className='text-dark hover:underline' target="_blank">
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
                        className='px-6 py-2 bg-dark text-white rounded-full hover:bg-dark/90 transition-all inline-block'
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
                        className='px-6 py-2 bg-dark text-white rounded-full hover:bg-dark/90 transition-all'
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
                      className='px-6 py-2 border border-dark text-dark rounded-full hover:bg-dark hover:text-white transition-all'
                    >
                      Back
                    </button>
                  )}
                  <button
                    onClick={step === 3 ? handlePlaceOrder : handleContinue}
                    disabled={(step === 3 && !shippingInfo.termsAccepted) || isSubmitting}
                    className='px-6 py-2 bg-dark text-white rounded-full hover:bg-dark/90 transition-all ml-auto disabled:opacity-50 disabled:cursor-not-allowed'
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
                {cartItems.map((item, index) => (
                  <div key={index} className='flex items-center gap-4 py-3 border-b'>
                    <div className='relative'>
                      <img src={item.images[0].url} alt={item.title} className='w-20 h-20 object-cover rounded' />
                      <span className='absolute -top-2 -right-2 bg-dark text-white w-5 h-5 rounded-full flex items-center justify-center text-xs'>
                        {item.quantity || 1}
                      </span>
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-medium'>{item.title}</h3>
                      <p className='text-sm text-gray-600'>{item.sku}</p>
                    </div>
                    <p className='font-medium'>R{calculateSubtotal(item)}.00</p>
                  </div>
                ))}
                
                <div className='space-y-2 pt-4'>
                  <div className='flex justify-between'>
                    <p className='text-gray-600'>Subtotal</p>
                    <p className='font-medium'>R{calculateTotal()}.00</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-gray-600'>Shipping</p>
                    <p className='font-medium'>Calculated at next step</p>
                  </div>
                  <div className='flex justify-between pt-4 border-t'>
                    <p className='font-bold'>Total</p>
                    <p className='font-bold'>R{calculateTotal()}.00</p>
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