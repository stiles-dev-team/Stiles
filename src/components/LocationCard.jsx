import React from 'react'

const LocationCard = ({ location }) => {
  if (!location) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-gray-500">Loading location information...</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-2">{location.title}</h2>
      <div className="space-y-4 h-full">
        <div>
          <h4 className="text-lg font-semibold mb-1">Phone</h4>
          <p className="text-gray-700">{location.phone}</p>
          {location.phone_after_hours && (
            <p className="text-gray-700">After hours: {location.phone_after_hours}</p>
          )}
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-1">Address</h4>
          <p className="text-gray-700 whitespace-pre-line">{location.address}</p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-1">Email</h4>
          <a href={`mailto:${location.email}`} className="text-blue-600 hover:text-blue-800">
            {location.email}
          </a>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-1">Hours</h4>
          <ul className="text-gray-700">
            {location.hours.map((hour, index) => (
              <li key={index}>{hour}</li>
            ))}
          </ul>
        </div>
        <div className='mt-auto flex flex-col gap-2'>
          <button 
            onClick={() => window.open(location.google_maps, '_blank')} 
            className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-black/80 transition-colors"
          >
            View on Google Maps
          </button>
          <button 
            onClick={() => window.location.href = `tel:${location.phone}`} 
            className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-black/80 transition-colors"
          >
            Call Us
          </button>
        </div>
      </div>
    </div>
  )
}

export default LocationCard 