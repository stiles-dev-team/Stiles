import React, { useEffect, useState } from 'react'
import Layout from '../layout/Layout'

const TileVisualiser = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    console.log('Starting Roomvo initialization...')

    // Remove any existing Roomvo scripts
    const existingScripts = document.querySelectorAll('script[src*="roomvo.com"]')
    existingScripts.forEach(script => script.remove())

    // Create and load the Roomvo script
    const script = document.createElement('script')
    script.src = 'https://cdn.roomvo.com/static/scripts/b2b/stilescoza.js'
    script.async = false // Load synchronously
    script.defer = true

    // Add data attributes that might be required
    script.setAttribute('data-roomvo-b2b', 'true')
    script.setAttribute('data-roomvo-partner', 'stilescoza')
    script.setAttribute('data-roomvo-mode', 'b2b')

    let initAttempts = 0
    const maxAttempts = 20

    const checkAndStartVisualizer = () => {
      console.log('Checking for Roomvo object, attempt:', initAttempts + 1)
      
      if (window.roomvo && typeof window.roomvo.startStandaloneVisualizer === 'function') {
        console.log('Roomvo object found with startStandaloneVisualizer method')
        try {
          window.roomvo.startStandaloneVisualizer()
          setIsLoading(false)
        } catch (err) {
          console.error('Error starting Roomvo visualizer:', err)
          setError('Failed to start Roomvo visualizer. Please refresh the page.')
        }
      } else {
        initAttempts++
        if (initAttempts >= maxAttempts) {
          console.error('Roomvo object not found after maximum attempts')
          setError('Roomvo failed to initialize. Please refresh the page.')
          return
        }
        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(1.5, initAttempts), 5000)
        setTimeout(checkAndStartVisualizer, delay)
      }
    }

    // Function to handle script load
    const handleScriptLoad = () => {
      console.log('Roomvo script loaded successfully')
      // Wait a bit before starting checks
      setTimeout(() => {
        checkAndStartVisualizer()
      }, 1000)
    }

    // Function to handle script error
    const handleScriptError = (error) => {
      console.error('Failed to load Roomvo script:', error)
      setError('Failed to load Roomvo script. Please check your internet connection and try again.')
    }

    // Add event listeners
    script.addEventListener('load', handleScriptLoad)
    script.addEventListener('error', handleScriptError)

    // Append script to document
    document.head.appendChild(script)

    // Cleanup function
    return () => {
      // Remove event listeners
      script.removeEventListener('load', handleScriptLoad)
      script.removeEventListener('error', handleScriptError)
      
      // Remove the script on cleanup
      const scripts = document.querySelectorAll('script[src*="roomvo.com"]')
      scripts.forEach(script => script.remove())
    }
  }, [])

  const handleStartVisualizer = (e) => {
    e.preventDefault()
    if (window.roomvo && typeof window.roomvo.startStandaloneVisualizer === 'function') {
      window.roomvo.startStandaloneVisualizer()
    } else {
      setError('Roomvo visualizer is not available. Please refresh the page.')
    }
  }

  return (
    <Layout>
      <div className='container mx-auto px-4 min-h-screen pt-40 flex flex-col justify-center items-center'>
        <h1 className="text-3xl font-bold mb-8">Tile Visualizer</h1>
        
        {/* Roomvo Visualization Container */}
        <div className="w-full max-w-5xl h-[600px] bg-gray-100 rounded-lg shadow-lg relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading Roomvo visualization...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-red-600">
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 px-4 py-2 bg-primaryStiles text-dark rounded hover:bg-opacity-90 transition-colors"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <button 
              onClick={handleStartVisualizer}
              className="absolute inset-0 w-full h-full flex items-center justify-center bg-primaryStiles text-white text-xl font-semibold hover:bg-opacity-90 transition-colors cursor-pointer"
            >
              Click to Start Tile Visualizer
            </button>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-lg mb-4">Visualize how our tiles will look in your space</p>
          <p className="text-sm text-gray-500">Use the Roomvo visualizer above to see our tiles in your room</p>
        </div>
      </div>
    </Layout>
  )
}

export default TileVisualiser