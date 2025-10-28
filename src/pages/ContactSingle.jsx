import React, { useEffect, useState } from 'react'
import Layout from '../layout/Layout'
import { useParams } from 'react-router-dom'
import LocationCard from '../components/LocationCard'
import { Helmet } from 'react-helmet-async'
const ContactSingle = () => {

    const { slug } = useParams()

    const [location, setLocation] = useState(null)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: ''
    })

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
            const location = data.locations.find(location => location.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') === slug)
            setLocation(location)
        })
    }, [slug])

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(formData)
    }

  return (
    <Layout>
    <Helmet>
      <title>Contact Us{location?.title ? ` | ${location.title}` : ''}</title>
      <meta name="description" content={`Contact Us${location?.title ? ` | ${location.title}` : ''}`} />
      <meta property="og:image" content="/images/favi.webp" />
      <meta property="og:title" content={`Contact Us${location?.title ? ` | ${location.title}` : ''}`} />
      <meta property="og:description" content={`Contact Us${location?.title ? ` | ${location.title}` : ''}`} />
      <meta property="og:url" content={`https://stiles.co.za/contact-us${location?.title ? `/${location.title}` : ''}`} />
      <meta property="og:type" content="product" />
      <meta property="og:site_name" content="Stiles" />
      <meta property="og:locale" content="en_ZA" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`Contact Us${location?.title ? ` | ${location.title}` : ''}`} />
  </Helmet>
        <section className='w-full bg-black bg-cover bg-center relative flex flex-col justify-center items-center pt-20 h-[40vh]'>
            <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
            <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
                <h1 className='text-white font-bold text-6xl text-center drop-shadow-md'>Contact Us{location?.title ? ` | ${location.title}` : ''}</h1>
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
        <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
        <LocationCard location={location} />
      </div>
    </div>
  </div>
</section>
    </Layout>
  )
}

export default ContactSingle