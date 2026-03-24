import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import Layout from '../layout/Layout'
import { Breadcrumbs } from '@material-tailwind/react'
import LocationCard from '../components/LocationCard'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })

  const [locations, setLocations] = useState([])

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log(formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    fetch('/data/stiles-locations.json')
    .then(res => res.json())
    .then(data => {
      setLocations(data.locations)
    })
  }, [])

  return (
    <Layout>
        <Helmet>
          <title>Contact Us | Stiles</title>
          <meta name="description" content="Contact Us | Stiles" />
          <meta property="og:image" content="/images/favi.webp" />
          <meta property="og:title" content="Contact Us | Stiles" />
          <meta property="og:description" content="Contact Us | Stiles" />
          <meta property="og:url" content="https://stiles.co.za/contact-us" />
          <meta property="og:type" content="product" />
          <meta property="og:site_name" content="Stiles" />
          <meta property="og:locale" content="en_ZA" />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="Contact Us | Stiles" />
      </Helmet>
      <section className='w-full bg-dark bg-cover bg-center relative flex flex-col justify-center items-center pt-20 h-[40vh]'>
        <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
        <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
          <h1 className='text-white font-bold text-6xl text-center drop-shadow-md'>Contact Us</h1>
          <Breadcrumbs className='text-white bg-transparent' separator='|'>
            <a href="/" className="text-white hover:text-gray-200">
              Home
            </a>
            <a href="/contact-us" className='text-white hover:text-gray-200'>
              Contact Us
            </a>
          </Breadcrumbs>
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-black/80 transition-colors"
                >
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Head Office</h2>
              <LocationCard location={locations?.find(loc => loc.title === "George")} />
            </div>
          </div>
        </div>
      </section>

      {/* All Locations */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Locations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {locations.filter(loc => loc.title !== "George").map((location, index) => (
              <LocationCard key={index} location={location} />
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default ContactUs