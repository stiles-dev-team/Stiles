import Layout from '../layout/Layout'
import ButtonStiles from '../components/ButtonStiles'
import ProductCard from '../components/ProductCard';
import { BlurFade } from "../components/ui/blur-fade" // Updated import statement
import { Helmet } from 'react-helmet-async';

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
  const [homeContent, setHomeContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);

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

  // Fetch home page content
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin-content.php?page=home`, {
          headers: { Accept: "application/json" },
        });
        const data = await response.json();
        
        if (data.success) {
          setHomeContent(data.content);
        } else {
          console.error("Error fetching home content:", data.message);
        }
      } catch (error) {
        console.error("Error fetching home content:", error);
      } finally {
        setContentLoading(false);
      }
    };

    fetchHomeContent();
  }, []);

  return (
    <Layout>
      <Helmet>
        <title>Tile Retailer | Find The Best Deals On Tiles | Stiles</title>
        <meta name="description" content="Stiles is a top tile retailer in South Africa that adheres to high industry standards in both quality & trends. We sell tiles & sanitaryware." />
        <meta property="og:image" content="/images/favi.webp" />
        <meta property="og:title" content="Tile Retailer | Find The Best Deals On Tiles | Stiles" />
        <meta property="og:description" content="Stiles is a top tile retailer in South Africa that adheres to high industry standards in both quality & trends. We sell tiles & sanitaryware." />
        <meta property="og:url" content="https://stiles.co.za/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Stiles" />
        <meta property="og:locale" content="en_ZA" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Tile Retailer | Find The Best Deals On Tiles | Stiles" />
      </Helmet>
      <main className='w-full flex flex-col justify-start items-start gap-14 lg:gap-28 pb-14 lg:pb-28 '>
        <Hero content={homeContent} />
        <WhoWeAre content={homeContent} />
        <OurProducts />
        <SubscribeBanner />
        <ShopCategory content={homeContent} />
        <WeWorkWithTheBest />
        <Blog />
      </main>
    </Layout>
  )
}

export default Home

const Hero = ({ content }) => {
  
  // const heroContent = content?.hero || {
  //   slides: [
  //     {
  //       id: 1,
  //       title: "Stiles Black November Promo",
  //       subtitle: "",
  //       background_image: "/images/blacknovember.jpg",
  //       background_image_mobile: "/images/blacknovember_resp.jpg",
  //       button_text: "Know More",
  //       button_link: "#whoweareHome"
  //     },
  //     {
  //       id: 2,
  //       title: "Quality and Style Specially Handpicked for You",
  //       subtitle: "",
  //       background_image: "/images/Website_Banners2.jpg",
  //       button_text: "Know More",
  //       button_link: "#whoweareHome"
  //     },
  //     {
  //       id: 3,
  //       title: "Quality and Style Specially Handpicked for You",
  //       subtitle: "",
  //       background_image: "/images/Website_Banners3.jpg",
  //       button_text: "Know More",
  //       button_link: "#whoweareHome"
  //     },
  //     {
  //       id: 4,
  //       title: "Quality and Style Specially Handpicked for You",
  //       subtitle: "",
  //       background_image: "/images/Website_Banners4.jpg",
  //       button_text: "Know More",
  //       button_link: "#whoweareHome"
  //     }
  //   ]
  // };
  const heroContent =  {
    slides: [
          // {
          //   id: 1,
          //   title: "",
          //   subtitle: "",
          //   background_image: "/images/stile-lines-promo-latest.jpg",
          //   button_text: "Shop Now",
          //   button_link: "/promo/styling-between-the-lines"
          // },
          // {
          //   id: 2,
          //   title: "Easter Closure notice!",
          //   subtitle: "Please note all Stiles brances will be closed: Friday 3 April - Monday 6 April\n\nWe reopen Tuesday.\nHappy Easter from the Stiles team.",
          //   background_image: "/images/easter-background.jpg",
          //   button_text: "",
          //   button_link: ""
          // },
          {
            id: 3,
            title: "Quality and Style Specially Handpicked for You",
            subtitle: "",
            background_image: "/images/Website_Banners3.jpg",
            button_text: "Know More",
            button_link: "#whoweareHome"
          },
          {
            id: 4,
            title: "Quality and Style Specially Handpicked for You",
            subtitle: "",
            background_image: "/images/Website_Banners4.jpg",
            button_text: "Know More",
            button_link: "#whoweareHome"
          }
    ]
  };

  return (
    <section id='heroHome' className='w-full h-lvh relative flex flex-col justify-center items-center'>
      <Splide className="w-full h-lvh" options={{
        type: 'loop'
      }}>
        {heroContent.slides.map((slide, index) => (
          <SplideSlide key={slide.id} className="w-full h-lvh flex flex-col justify-center items-center">
            <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/20'></div>
            <picture>
              {
                slide.background_image_mobile && (
                  <source srcSet={slide.background_image_mobile} media="(max-width: 768px)" />
                )
              }
               <img src={slide.background_image} alt={slide.title || "Stiles Home"} className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center-bottom lg:object-center' />
            </picture>
            <div className='relative z-10 container mx-auto px-4'>
              <h1 className='text-white text-4xl md:text-7xl font-bold uppercase pb-5 w-full max-w-3xl'>{slide.title}</h1>
              {slide.subtitle && (
                <p className='text-white text-lg md:text-xl mb-5 w-full max-w-2xl whitespace-pre-line'>{slide.subtitle}</p>
              )}

                <div>
                  <ButtonStiles text={slide.button_text} styleType="light" href={slide.button_link} extraStyle="hidden lg:block" />
                </div>
              {/* {index === 0 ? (
                <div className='w-full flex justify-center mt-12'>
                  <ButtonStiles
                    text={slide.button_text}
                    styleType="light"
                    href={slide.button_link}
                    extraStyle="text-lg px-10 py-5 [animation:promoPulse_2.4s_ease-in-out_infinite] [@keyframes_promoPulse{0%,100%{background:#fff;border-color:#fff;box-shadow:0_8px_20px_rgba(255,255,255,.2)}50%{background:#FFF9D6;border-color:#FFF9D6;box-shadow:0_12px_28px_rgba(255,249,214,.45)}}] hover:bg-black hover:text-white hover:border-black after:content-['→'] after:ml-2"
                  />
                </div>
              ) : (
                <div>
                  <ButtonStiles text={slide.button_text} styleType="light" href={slide.button_link} extraStyle="hidden lg:block" />
                </div>
              )} */}
            </div>
          </SplideSlide>
        ))}
      </Splide>
    </section>
  )
}

const WhoWeAre = ({ content }) => {
  return (
    <section id="whoweareHome" className='container mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-20'>
      <h2 className='text-4xl lg:text-7xl text-dark font-bold w-full lg:w-4/12'>{(content?.whoWeAre?.title) || 'WE ARE STILES'}</h2>
      <div className='w-full lg:w-8/12 flex flex-col justify-start items-start gap-5'>
        <p className='text-sm lg:text-base'>
          At Stiles, we’re all about keeping things stylish, in your home, your office, your restaurant, and any space you can imagine! Our goal at Stiles is to be exclusive and unique, offering only the best quality tiles and sanitaryware in South Africa. Quality and style will always outweigh price when we select products.
        </p>
        <p className='text-sm lg:text-base pb-6'>
          {(content?.whoWeAre?.paragraph2) || "Along with importing products from top tile and sanitaryware factories across the globe, we pride ourselves in being a community-driven South African company. Stiles supports local industry, artisans and artists from South Africa. We believe in the tiles and sanitaryware we market, and employ creative people with an enthusiasm to keep all things stylish, making us leaders in service, technical advice, creative ability and innovative ideas."}
        </p>
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

  // Helper function to check if product should be shown (not sold out)
  const shouldShowProduct = (productData, stockInfo) => {
    // If no stock info, show the product (let ProductCard handle it)
    if (!stockInfo || stockInfo.onhand === undefined) {
      return true;
    }
    
    // If stock is >= 5, always show
    if (stockInfo.onhand >= 5) {
      return true;
    }
    
    // If stock < 5, check if it has Coming Soon or Backorder badges/tags
    // Parse badges from promo
    const badges = [];
    if (productData.promo !== null && productData.promo !== '' && productData.promo.trim() !== '') {
      const promoArray = productData.promo.split(',').map(item => item.trim()).filter(item => item !== '');
      promoArray.forEach(promoItem => {
        if (promoItem.trim()) {
          badges.push(promoItem.trim());
        }
      });
    }
    
    // Check if product has Coming Soon or Backorder
    const hasComingSoon = badges.includes('Coming Soon') || 
                         (productData.promo && typeof productData.promo === 'string' && productData.promo.includes('Coming Soon')) ||
                         (productData.product_tag && typeof productData.product_tag === 'string' && productData.product_tag.includes('Coming Soon'));
    
    const hasBackorder = badges.includes('Backorder') || 
                        (productData.promo && typeof productData.promo === 'string' && productData.promo.includes('Backorder')) ||
                        (productData.product_tag && typeof productData.product_tag === 'string' && productData.product_tag.includes('Backorder'));
    
    // If it has Coming Soon or Backorder, show it (won't show Sold Out tag)
    if (hasComingSoon || hasBackorder) {
      return true;
    }
    
    // Otherwise, it would show Sold Out tag, so don't show it
    return false;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        // Add a timestamp to prevent caching
        const timestamp = new Date().getTime();
        // Fetch more products to account for filtering (fetch 12, filter down to 6)
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products.php?category=${category}&limit=12&_=${timestamp}`, {
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
        
        // Fetch stock info for all products in parallel
        const productsWithStock = await Promise.all(
          processedData.map(async (productItem) => {
            let stockInfo = null;
            
            // Fetch full product data to get SKU and other details
            try {
              const productRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products.php?slug=${productItem.slug}`);
              const productText = await productRes.text();
              const productData = JSON.parse(productText);
              
              if (productData.status === 'success' && productData.data && productData.data.sku) {
                // Fetch stock info
                try {
                  const stockRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/iq_new.php?code=${productData.data.sku}`, {
                    method: 'GET',
                    headers: {
                      'Accept': 'application/json',
                      'Content-Type': 'application/json',
                    },
                    mode: 'cors',
                    credentials: 'omit'
                  });
                  
                  if (stockRes.ok) {
                    const stockData = await stockRes.json();
                    if (stockData && stockData.data) {
                      stockInfo = stockData.data;
                    }
                  }
                } catch (stockErr) {
                  console.error('Error fetching stock info for', productItem.slug, stockErr);
                }
                
                // Check if product should be shown
                return {
                  product: productItem,
                  stockInfo,
                  productData: productData.data,
                  shouldShow: shouldShowProduct(productData.data, stockInfo)
                };
              }
            } catch (err) {
              console.error('Error fetching product details for', productItem.slug, err);
            }
            
            // If we can't fetch product details, show it anyway
            return {
              product: productItem,
              stockInfo: null,
              productData: null,
              shouldShow: true
            };
          })
        );
        
        // Filter products that should be shown and limit to 6
        const filteredProducts = productsWithStock
          .filter(item => item.shouldShow)
          .slice(0, 6)
          .map(item => item.product);
        
        if (filteredProducts.length === 0) {
          // If all products are filtered out, show the first 6 anyway
          setProduct(processedData.slice(0, 6));
        } else {
          setProduct(filteredProducts);
        }
        
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
    <BlurFade delay={0.2} inView className='w-full relative'>
        <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
          <div className="flex flex-row justify-between items-end gap-5 w-full">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Products we are proud of</h2>
            <a href="/product-category/tiles" className='hidden lg:block'>VIEW ALL OUR PRODUCTS</a>
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
                <a href={"/product/" + item.slug} key={item.id}>
                    <ProductCard key={item.id} prod={item.slug} />
                </a>
              ))
          }
          </div>
        </section>
        <Splide className="lg:hidden w-full mt-5" options={{
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
            {
              product && product.map((item, index) => (
                <SplideSlide key={index}>
                  <a href={"/product/" + item.slug} key={item.id}>
                    <ProductCard key={item.id} prod={item.slug} />
                  </a>
                </SplideSlide>
              ))
            }
        </Splide>
    </BlurFade>
  )
}

const SubscribeBanner = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const onChange = ({ target }) => setEmail(target.value);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(email);

  const handleSubscribe = (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    if (!isEmailValid) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);
    
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/everlytic.php?email=${encodeURIComponent(email)}`)
    .then(response => response.json())
    .then(data => {
      console.log(data);
      if (data.error) {
        // Handle the specific API error format
        if (data.error.code === "01001") {
          toast.error("Unable to subscribe at this time. Please try again later.");
        } else if (typeof data.error === 'object' && data.error.message) {
          toast.error(data.error.message);
        } else if (typeof data.error === 'string') {
          toast.error(data.error);
        } else {
          toast.error("Failed to subscribe. Please try again later.");
        }
      } else if (data.collection?.message?.data === 'Creation of duplicate Contact: ignored') {
        toast.info("You're already subscribed to our newsletter!");
        setEmail(""); // Clear the input after duplicate subscription
      } else {
        toast.success("Thank you for subscribing to our newsletter!");
        setEmail(""); // Clear the input after successful subscription
      }
    })
    .catch(err => {
      console.error('Error:', err);
      toast.error('Failed to subscribe. Please try again later.');
    })
    .finally(() => {
      setIsLoading(false);
    });
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
            disabled={isLoading}
          />
          <button 
            type="submit"
            disabled={!isEmailValid || isLoading}
            className='absolute right-0.5 px-4 h-[42px] hover:bg-primary bg-black hover:text-dark text-white rounded-full lg:rounded-md text-sm font-bold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]'
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Subscribe'
            )}
          </button>
        </form>
      </div>
    </section>
  )
}

const ShopCategory = ({ content }) => {
  const shopCategoryContent = content?.shopCategory || {
    title: "Shop by category",
    categories: [
      {
        id: 1,
        name: "Floor Tiles",
        image: "/images/floor_tiles.webp",
        link: "/product-category/tiles/floor-tiles",
        position: "row-span-2"
      },
      {
        id: 2,
        name: "Bathrooms",
        image: "/images/bathrooms.jpg",
        link: "/product-category/sanitary-ware/bathroom-accessories",
        position: "default"
      },
      {
        id: 3,
        name: "Kitchen Sinks",
        image: "/images/kitchen_sinks.jpg",
        link: "/product-category/sanitary-ware/kitchen-sinks",
        position: "col-start-2 row-start-2"
      },
      {
        id: 4,
        name: "Mosaics",
        image: "/images/mosaics.png",
        link: "/product-category/tiles/mosaics",
        position: "row-span-2 col-start-3 row-start-1"
      }
    ]
  };

  const getPositionClass = (position) => {
    switch (position) {
      case "row-span-2":
        return "row-span-2";
      case "col-start-2 row-start-2":
        return "col-start-2 row-start-2";
      case "row-span-2 col-start-3 row-start-1":
        return "row-span-2 col-start-3 row-start-1";
      default:
        return "";
    }
  };

  return (
    <section className='container mx-auto px-0 lg:px-4'>
      <div className="flex flex-row justify-between items-end gap-5 w-full pb-2 lg:pb-5 px-4 lg:px-0">
        <h2 className='font-bold text-3xl lg:text-5xl uppercase'>{shopCategoryContent.title}</h2>
        {/* <a href="#" className='hidden lg:block'>VIEW ALL OUR CATEGORIES</a> */}
      </div>
      <div className='lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-4 w-full'>
        {shopCategoryContent.categories.map((category) => (
          <a 
            key={category.id}
            href={category.link} 
            className={`${getPositionClass(category.position)} relative hidden lg:block cursor-pointer`}
          >
            <img src={category.image} alt={category.name} className='w-full h-full object-cover object-center relative z-0 rounded-2xl' />
            <Chip size="lg" value={category.name} className='w-fit absolute z-10 top-5 left-5 bg-white font-bold text-dark' />
          </a>
        ))}
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
          {shopCategoryContent.categories.map((category) => (
            <SplideSlide key={category.id}>
              <a href={category.link} className='w-full relative block'>
                <img src={category.image} alt={category.name} className='w-full aspect-video object-cover object-center rounded-lg' />
                <div className='absolute inset-0 pointer-events-none'>
                  <div className='absolute top-3 left-3 transform-gpu'>
                    <Chip size="lg" value={category.name} className='w-fit bg-white font-bold text-dark shadow-md' />
                  </div>
                </div>
              </a>
            </SplideSlide>
          ))}
        </Splide>
      </div>
    </section>
  )
}

const WeWorkWithTheBest = () => {
  const brands = [
    { src: '/images/Etienne.png', href: '/product-category/brands/Etienne' },
    { src: '/images/FunkyTiles.png', href: '/product-category/brands/Funky Tiles' },
    { src: '/images/Nala.png', href: '/product-category/brands/Nala Baths' },
    { src: '/images/Nest.png', href: '/product-category/brands/Nest Flooring by KREM' },
    { src: '/images/Oak.png', href: '/product-category/brands/Oak' },
    { src: '/images/hansgrohe_logo.jpg', href: '/product-category/brands/Hansgrohe' },
    { src: '/images/duravit_logo.jpeg', href: '/product-category/brands/Duravit' },
    { src: '/images/monocieb.webp', href: '/product-category/brands/Monocibec' },
    { src: '/images/florim.webp', href: '/product-category/brands/Florim' },
    { src: '/images/buttler_logo.jpg', href: '/product-category/brands/Bathroom Butler' },
  ];

  return (
    <section id="WeWorkWithTheBest" className='container mx-auto px-4 flex flex-col justify-start items-start gap-5'>
      <div className='flex flex-col lg:flex-row justify-between items-start gap-5 lg:gap-20 w-full pb-5'>
        <h2 className='text-3xl lg:text-5xl uppercase text-dark font-bold w-full lg:w-4/12'>We work with the best</h2>
        <div className='w-full lg:w-8/12 flex flex-col justify-start items-start gap-5'>
          <p className='text-sm lg:text-base'>We are picky when it comes to our brands and only stock the most stylish tiles and sanitaryware you can find in the country. We love showcasing brands that are exclusively available to us, as well as top quality well-known brands. View our wide selection of brands specially hand-picked for you.</p>
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
        {brands.map((brand) => (
          <SplideSlide key={brand.src} className="flex items-center justify-center h-20">
            <img
              src={brand.src}
              alt=""
              className="h-30 w-full max-w-full object-contain object-center cursor-pointer p-2 m-2"
              onClick={() => { window.location.href = brand.href; }}
            />
          </SplideSlide>
        ))}
      </Splide>
    </section>
  )
}

const Blog = () => {
  const [blogPosts, setBlogPosts] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/get-blogs.php`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch blogs');
      return res.json();
    })
    .then(data => {
      // Handle both array response and object with blogs property
      const blogs = Array.isArray(data) ? data : (data.blogs || []);
      
      // Sort posts by ID in descending order (newest first)
      const sortedPosts = blogs.sort((a, b) => {
        return b.ID - a.ID;
      });
      // Take only the latest 3 posts
      setBlogPosts(sortedPosts.slice(0, 3));
    })
    .catch(err => {
      console.error('Error fetching blogs:', err);
    });
  }, []);

  return (
    <div className='w-full'>
      <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:justify-between sm:items-end sm:gap-5">
          <h2 className='font-bold text-3xl lg:text-5xl uppercase'>THE STILES BLOG</h2>
          <a href="/stiles-blog" className='shrink-0 text-sm font-semibold uppercase underline underline-offset-4 transition-colors hover:text-dark sm:text-base'>
            VIEW ALL OUR STORIES
          </a>
        </div>
        <div className='pt-6 w-full hidden lg:grid grid-cols-3 gap-6'>
          {
            blogPosts && blogPosts.map((post, index) => (
              <BlogCard key={post.slug || post.ID || index} title={post.post_title} cat={post.categories} img={post.featured_image} desc={post.metadescription} slug={post.slug} />
            ))
          }
        </div>
        <div className='flex w-full flex-col gap-6 pt-6 lg:hidden'>
          {
            blogPosts && blogPosts.map((post, index) => (
              <BlogCard key={post.slug || post.ID || index} title={post.post_title} cat={post.categories} img={post.featured_image} desc={post.metadescription} slug={post.slug} />
            ))
          }
        </div>
      </section>
    </div>
  )
}