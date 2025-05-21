import Layout from '../layout/Layout'
import ButtonStiles from '../components/ButtonStiles'
import { IoIosArrowDown } from "react-icons/io";
import ProductCard from '../components/ProductCard';
import { BlurFade } from "../components/ui/blur-fade" // Updated import statement

import { Input, Button } from "@material-tailwind/react";

import { Chip } from "@material-tailwind/react";

import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css';
import { AutoScroll } from '@splidejs/splide-extension-auto-scroll'

import { useEffect, useState } from 'react';
import BlogCard from '../components/BlogCard';
import { toast } from 'sonner';

const Home = () => {
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

  // useEffect(() => {
  //   // Check if geolocation is supported
  //   if (!navigator.geolocation) {
  //     alert("Geolocation is not supported in this browser.");
  //     return;
  //   }

  //   // Check if running in a secure context (HTTPS or localhost)
  //   const isSecureContext = window.isSecureContext;
  //   const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
  //   if (!isSecureContext && !isLocalhost) {
  //     alert("Geolocation requires a secure connection (HTTPS). Please access this site via HTTPS.");
  //     return;
  //   }

  //   // Detect iOS device
  //   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  //   const isChromeOnIOS = isIOS && /Chrome/.test(navigator.userAgent);
    
  //   if (isChromeOnIOS) {
  //     alert("On iOS, Chrome has limitations with geolocation. Please use Safari or enable location in Settings > Privacy > Location Services.");
  //     return;
  //   }

  //   // Options for geolocation - optimized for precision
  //   const options = {
  //     enableHighAccuracy: true,  // Request the most accurate position available
  //     timeout: 30000,            // Increased timeout to allow for more accurate readings
  //     maximumAge: 0              // Don't use cached position
  //   };

  //   // Use watchPosition instead of getCurrentPosition for better accuracy
  //   // This will continuously update the position as it becomes more accurate
  //   const watchId = navigator.geolocation.watchPosition(
  //     (position) => {
  //       const { latitude, longitude, accuracy } = position.coords;
  //       setLocation({ latitude, longitude, accuracy });
  //       setLocationError(null);
  //       alert(`Current location: ${latitude}, ${longitude}\nAccuracy: ${accuracy} meters`);
  //     },
  //     (error) => {
  //       let errorMessage = "Error getting location: ";
  //       switch(error.code) {
  //         case error.PERMISSION_DENIED:
  //           if (isIOS) {
  //             errorMessage += "Permission denied. Go to Settings > Privacy > Location Services and enable location for this site.";
  //           } else if (!isSecureContext && !isLocalhost) {
  //             errorMessage += "Permission denied. Geolocation requires a secure connection (HTTPS).";
  //           } else {
  //             errorMessage += "Permission denied. Please enable geolocation on your device to use this feature.";
  //           }
  //           break;
  //         case error.POSITION_UNAVAILABLE:
  //           errorMessage += "Location information unavailable. Check your internet connection.";
  //           break;
  //         case error.TIMEOUT:
  //           errorMessage += "Request timed out. Please try again.";
  //           break;
  //         default:
  //           errorMessage += "Unknown error.";
  //           break;
  //       }
  //       console.log("Geolocation error:", error);
  //       setLocationError(errorMessage);
  //       alert(errorMessage);
  //     },
  //     options
  //   );

  //   // Clean up the watch when component unmounts
  //   return () => {
  //     if (watchId) {
  //       navigator.geolocation.clearWatch(watchId);
  //     }
  //   };
  // }, []);

  return (
    <Layout>
      <main className='w-full flex flex-col justify-start items-start gap-14 lg:gap-28 pb-14 lg:pb-28 '>
        <Hero />
        <WhoWeAre />
        <OurProducts />
        <SubscribeBanner />
        <ShopCategory />
        <WeWorkWithTheBest />
        <Blog />
      </main>
    </Layout>
  )
}

export default Home

const Hero = () => {
  return (
    <section id='heroHome' className='w-full h-lvh relative flex flex-col justify-center items-center'>
      
    {/* <section id='heroHome' className='w-full h-lvh bg-[url("/images/hero.png")] bg-cover bg-center relative flex flex-col justify-center items-center'>
      <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
      <div className='relative z-10 container mx-auto px-4'>
        <h1 className='text-white text-5xl md:text-8xl font-bold uppercase pb-5'>SMART<br />BESPOKE<br />INTERIORS.</h1>
        <ButtonStiles text='Know More' styleType="light" href='#whoweareHome' extraStyle="hidden lg:block" />
      </div>
      <a href='#whoweareHome' className='absolute bottom-5 z-10 lg:hidden text-white font-semibold flex flex-row justify-center items-center gap-2'>KNOW MORE <IoIosArrowDown fill='white' /></a>
    </section> */}
      <Splide className="w-full h-lvh" options={{
        type: 'loop'
      }}>
        <SplideSlide className="w-full h-lvh flex flex-col justify-center items-center">
          <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/30'></div>
          <img src="/images/hero2.jpg" alt="" className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' />
          <div className='relative z-10 container mx-auto px-4'>
            <h1 className='text-white text-4xl md:text-7xl font-bold uppercase pb-5 w-full max-w-3xl'>Quality and Style Specially Handpicked for You</h1>
            <ButtonStiles text='Know More' styleType="light" href='#whoweareHome' extraStyle="hidden lg:block" />
          </div>
        </SplideSlide>
        {/* <SplideSlide className="w-full h-lvh flex flex-col justify-center items-center">
          <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/30'></div>
          <img src="/images/1920x550.webp" alt="" className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' />
          <div className='relative z-10 container mx-auto px-4'>
            <h1 className='text-white text-4xl md:text-7xl font-bold uppercase pb-5 w-full max-w-3xl'>Quality and Style Specially Handpicked for You</h1>
            <ButtonStiles text='Know More' styleType="light" href='#whoweareHome' extraStyle="hidden lg:block" />
          </div>
        </SplideSlide>
        <SplideSlide className="w-full h-lvh flex flex-col justify-center items-center">
          <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/30'></div>
          <img src="/images/hero.png" alt="" className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' />
          <div className='relative z-10 container mx-auto px-4'>
            <h1 className='text-white text-4xl md:text-7xl font-bold uppercase pb-5 w-full max-w-3xl'>Quality and Style Specially Handpicked for You</h1>
            <ButtonStiles text='Know More' styleType="light" href='#whoweareHome' extraStyle="hidden lg:block" />
          </div>
        </SplideSlide> */}
      </Splide>
      <a href='#whoweareHome' className='absolute bottom-5 z-10 lg:hidden text-white font-semibold flex flex-row justify-center items-center gap-2'>KNOW MORE <IoIosArrowDown fill='white' /></a>
    </section>
  )
}

const WhoWeAre = () => {
  return (
    <section id="whoweareHome" className='container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-20'>
      <h2 className='text-4xl lg:text-7xl text-dark font-bold w-full lg:w-4/12'>WE ARE STILES</h2>
      <div className='w-full lg:w-8/12 flex flex-col justify-start items-start gap-5'>
        <p className='text-sm lg:text-base'>We are picky when it comes to our brands and only stock the most stylish tiles and sanitaryware you can find in the country</p>
        <p className='text-sm lg:text-basepb-6'>We love showcasing brands that are exclusively available to us, as well as top quality well-known brands. View our wide selection of brands specially hand-picked for you.</p>
        {/* <ButtonStiles text='About Us' styleType="dark" href='#' respFullWidth={true} /> */}
      </div>
    </section>
  )
}

const OurProducts = () => {
  
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState("Tiles");
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        const res = await fetch(`https://stiles.co.za/api/products.php?category=${category}&limit=6&_=${timestamp}`, {
          headers: {
            'Accept-Encoding': 'gzip, deflate',
            'Accept': 'application/json',
            'Connection': 'keep-alive'
          },
          cache: 'no-store',
          credentials: 'omit'
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        // Get the response as text first
        const text = await res.text();
        
        // Log the response size
        console.log('Response size:', text.length);
        
        // Try to parse the response
        let data;
        try {
          // Clean the response text before parsing
          const cleanText = text.trim();
          data = JSON.parse(cleanText);
        } catch (e) {
          console.error('JSON Parse Error:', e);
          console.error('Response text length:', text.length);
          console.error('First 1000 characters:', text.substring(0, 1000));
          
          // If we get a parse error and haven't retried too many times
          if (retryCount < 3) {
            console.log(`Retrying... Attempt ${retryCount + 1}`);
            setRetryCount(prev => prev + 1);
            return;
          }
          
          throw new Error('Invalid JSON response from server');
        }
        
        // Validate the response structure
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response format');
        }
        
        if (data.status !== 'success' || !Array.isArray(data.data)) {
          throw new Error('Invalid response structure');
        }
        
        // Process the data
        const processedData = data.data.filter(product => {
          return product && 
                 typeof product === 'object' && 
                 product.slug && 
                 product.title;
        });
        
        if (processedData.length === 0) {
          throw new Error('No valid products found');
        }
        
        setProduct(processedData);
        setError(null);
        setRetryCount(0); // Reset retry count on success
        
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
        toast.error('Failed to load products');
        
        // If we get a protocol error, try one more time with different options
        if (err.message.includes('HTTP2_PROTOCOL_ERROR') && retryCount < 3) {
          console.log('HTTP/2 protocol error, retrying with different options...');
          setRetryCount(prev => prev + 1);
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, retryCount]);

  const updateCat = (cat) => {
    setCategory(cat);
    setRetryCount(0); // Reset retry count when changing category
  };

  if (error) {
    return (
      <BlurFade delay={0.2} inView className='w-full'>
        <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
          <div className="flex flex-row justify-between items-end gap-5 w-full">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Products we are proud of</h2>
          </div>
          <div className="w-full py-8 text-center text-red-500">
            Failed to load products. Please try again later.
          </div>
        </section>
      </BlurFade>
    );
  }

  if (isLoading) {
    return (
      <BlurFade delay={0.2} inView className='w-full'>
        <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
          <div className="flex flex-row justify-between items-end gap-5 w-full">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Products we are proud of</h2>
          </div>
          <div className="w-full py-8 text-center">
            Loading products...
          </div>
        </section>
      </BlurFade>
    );
  }

  return (
    <BlurFade delay={0.2} inView className='w-full'>
        <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
          <div className="flex flex-row justify-between items-end gap-5 w-full">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Products we are proud of</h2>
            <a href="/shop" className='hidden lg:block'>VIEW ALL OUR PRODUCTS</a>
          </div>
          <div className="flex flex-row justify-start items-center gap-5 w-full pt-5 max-w-full overflow-x-auto scrollsnap pb-4">
            <button className={category === "Tiles" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Tiles")}>TILES</button>
            <button className={category === "Taps" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Taps")}>Taps</button>
            <button className={category === "Sanitary Ware" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Sanitary Ware")}>sanitaryware</button>
            <button className={category === "Baths" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Baths")}>Baths</button>
            <button className={category === "Basins" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Basins")}>Basins</button>
            <button className={category === "Mosaics" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Mosaics")}>Mosaics</button>
            <button className={category === "Pavers" ? 'underline text-lg font-semibold uppercase underline-offset-4' : 'text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'} onClick={() => updateCat("Pavers")}>Pavers</button>
          </div>
          <div className='pt-6 w-full hidden lg:grid grid-cols-3 gap-6'>
          {
              product && product.map((item, index) => (
                  <ProductCard key={index} onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
              ))
          }
          </div>
        </section>
        <Splide className="lg:hidden w-full mt-5" options={{
          perPage: 1,
          perMove: 1,
          arrows: false,
          gap: '1rem',
          pagination: false,
          padding: '2rem',
          breakpoints: {
            1: {
              perPage: 1,
            },
          },
        }}>
            {
              product && product.map((item, index) => (
                <SplideSlide key={index}>
                  <ProductCard onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
                </SplideSlide>
              ))
            }
        </Splide>
    </BlurFade>
  )
}

const SubscribeBanner = () => {
  const [email, setEmail] = useState("");
  const onChange = ({ target }) => setEmail(target.value);

  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    // Here you would typically send the email to your backend
    // For now, we'll just show a success toast
    toast.success("Thank you for subscribing to our newsletter!");
    setEmail(""); // Clear the input after successful subscription
  };

  return (
    <section className='w-full py-20 lg:py-32 px-4 flex flex-col justify-center items-center bg-[url("/images/bannerhome.png")] bg-cover bg-center relative'>
      <div className='bg-black/40 w-full h-full absolute top-0 left-0 z-0'></div>
      <div className='flex flex-col justify-center items-center gap-6 w-full max-w-5xl z-10 relative'>
        <p className='text-lg leading-tight lg:text-4xl font-medium text-white text-center'>Subscribe to our weekly newsletter to get the latest updates and amazing offers delivered in your inbox</p>
        <form onSubmit={handleSubscribe} className='relative w-full max-w-[460px] flex justify-center items-center'>
          <input 
            type="email" 
            value={email}
            onChange={onChange}
            className='w-full h-12 pl-3 pr-24 rounded-full lg:rounded z-0 placeholder:text-sm lg:placeholder:text-base' 
            placeholder='Email Address' 
          />
          <button 
            type="submit"
            className='absolute right-0.5 px-4 h-[42px] hover:bg-primary bg-dark hover:text-dark text-white rounded-full lg:rounded-md text-sm font-bold uppercase transition-all'
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}

const ShopCategory = () => {
  return (
    <section className='container mx-auto px-0 lg:px-4'>
      <div className="flex flex-row justify-between items-end gap-5 w-full pb-2 lg:pb-5 px-4 lg:px-0">
        <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Shop by category</h2>
        {/* <a href="#" className='hidden lg:block'>VIEW ALL OUR CATEGORIES</a> */}
      </div>
      <div className='lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-4 w-full'>
        <a href="/product-category/tiles/floor-tiles" className="row-span-2 relative hidden lg:block cursor-pointer">
          <img src="/images/floor_tiles.webp" alt="" className='w-full h-full object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Floor Tiles" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold text-dark' />
        </a>
        <a href="/product-category/sanitary-ware/bathroom-accessories" className=' relative hidden lg:block cursor-pointer'>
          <img src="/images/bathrooms.jpg" alt="" className='w-full aspect-[16/12] object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Bathrooms" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold text-dark' />
        </a>
        <a href="/product-category/sanitary-ware/kitchen-sinks" className="col-start-2 row-start-2 relative hidden lg:block cursor-pointer">
          <img src="/images/kitchen_sinks.jpg" alt="" className='w-full aspect-[16/12] object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Kitchen Sinks" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold text-dark' />
        </a>
        <a href="/product-category/tiles/mosaics" className="row-span-2 col-start-3 row-start-1 relative hidden lg:block cursor-pointer">
          <img src="/images/mosaics.png" alt="" className='w-full h-full object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Mosaics" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold text-dark' />
        </a>
        <Splide className="lg:hidden" options={{
          perPage: 1,
          type: 'loop',
          perMove: 1,
          arrows: false,
          pagination: false,
          gap: '1rem',
          padding: '2rem',
          breakpoints: {
            1: {
              perPage: 1,
              type: 'loop',
            },
          },
        }}>
          <SplideSlide>
            <a href="/product-category/tiles/floor-tile" className='w-full relative'>
              <img src="/images/floor_tiles.webp" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Floor Tiles" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold text-dark' />
            </a>
          </SplideSlide>
          <SplideSlide>
            <a href="/product-category/sanitary-ware/bathroom-accessories" className='w-full relative'>
              <img src="/images/bathrooms.jpg" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Bathrooms" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold text-dark' />
            </a>
          </SplideSlide>
          <SplideSlide>
            <a href="/product-category/sanitary-ware/kitchen-sinks" className='w-full relative'>
              <img src="/images/kitchen_sinks.jpg" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Kitchen Sinks" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold text-dark' />
            </a>
          </SplideSlide>
          <SplideSlide>
            <a href="/product-category/tiles/mosaics" className='w-full relative'>
              <img src="/images/mosaics.png" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Mosaics" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold text-dark' />
            </a>
          </SplideSlide>
        </Splide>
      </div>
    </section>
  )
}

const WeWorkWithTheBest = () => {
  return (
    <section id="WeWorkWithTheBest" className='container mx-auto px-4 flex flex-col justify-start items-start gap-5'>
      <div className='flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-20 w-full pb-5'>
        <h2 className='text-3xl lg:text-5xl uppercase text-dark font-bold w-full lg:w-4/12'>We work with the best</h2>
        <div className='w-full lg:w-8/12 flex flex-col justify-start items-start gap-5'>
          <p className='text-sm lg:text-base'>We are picky when it comes to our brands and only stock the most stylish tiles and sanitaryware you can find in the country. A lot of brands are exclusively available to us like Italy's Monocibec and Newform or Spain's Realonda and Brazil's Ceusa. We also pride ourselves in stocking top quality well-known brands like Duravit, Hansgrohe, Blutide and Geberit. To see our full range of brands, Visit our Shop by Brand section.</p>
        </div>
      </div>
      <Splide className="w-full" extensions={{AutoScroll}} options={{
        perPage: 7,
        arrows: false,
        pagination: false,
        gap: '1rem',
        type: 'loop',
        focus: 'center',
        drag: false,
        autoScroll: {
          speed: 0.7,
          pauseOnHover: false,
          pauseOnFocus: false,
        },
        breakpoints: {
          768: {
            perPage: 2,
            type: 'loop',
          },
          1024: {
            perPage: 4,
            type: 'loop',
          }
        },
      }}>
        <SplideSlide>
          <img src="/images/Etienne.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Etienne"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/FunkyTiles.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Funky Tiles"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/Nala.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Nala"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/Nest.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Nest"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/Oak.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Oak"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/partner.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Blutilde"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/monocieb.webp" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Monocibec"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/florim.webp" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Florim"} />
        </SplideSlide>
      </Splide>
    </section>
  )
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    fetch(`/data/blogs.json`)
    .then(res => res.json())
    .then(data => {
      // Sort posts by date in descending order (newest first)
      const sortedPosts = data.sort((a, b) => {
        const dateA = new Date(a.post_date);
        const dateB = new Date(b.post_date);
        return dateB - dateA;
      });
      // Take only the latest 3 posts
      setBlogPosts(sortedPosts.slice(0, 3));
    })
    .catch(err => {
      console.log(err);
    });
  }, []);

  return (
    <div className='w-full'>
      <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
        <div className="flex flex-row justify-between items-end gap-5 w-full">
          <h2 className='font-bold text-3xl lg:text-5xl uppercase'>THE STILES BLOG</h2>
          <a href="/stiles-blog" className='hidden lg:block'>VIEW ALL OUR STORIES</a>
        </div>
        <div className='pt-6 w-full hidden lg:grid grid-cols-3 gap-6'>
          {
            blogPosts && blogPosts.map((post, index) => (
              <BlogCard key={index} title={post.post_title} cat={post.categories} img={post.featured_image} desc={post.desc} slug={post.slug} />
            ))
          }
        </div>
      </section>
      <Splide className="lg:hidden w-full mt-5" options={{
        perPage: 1,
        type: 'loop',
        perMove: 3,
        arrows: false,
        gap: '1rem',
        pagination: false,
        padding: '2rem',
        breakpoints: {
          1: {
            perPage: 1,
            type: 'loop',
          },
        },
      }}>
        {
          blogPosts && blogPosts.map((post, index) => (
            <SplideSlide key={index}>
              <BlogCard title={post.post_title} cat={post.categories} img={post.featured_image} desc={post.desc} slug={post.slug} />
            </SplideSlide>
          ))
        }
      </Splide>
    </div>
  )
}