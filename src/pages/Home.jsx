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

const Home = () => {
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
          <img src="/images/hero.png" alt="" className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' />
          <div className='relative z-10 container mx-auto px-4'>
            <h1 className='text-white text-5xl md:text-8xl font-bold uppercase pb-5'>SMART<br />BESPOKE<br />INTERIORS.</h1>
            <ButtonStiles text='Know More' styleType="light" href='#whoweareHome' extraStyle="hidden lg:block" />
          </div>
        </SplideSlide>
        <SplideSlide className="w-full h-lvh flex flex-col justify-center items-center">
          <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/30'></div>
          <img src="/images/1920x550.webp" alt="" className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' />
        </SplideSlide>
        <SplideSlide className="w-full h-lvh flex flex-col justify-center items-center">
          <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/30'></div>
          <img src="/images/Artboard-1-copy-2.webp" alt="" className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' />
        </SplideSlide>
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
        <p className='text-sm lg:text-base'>At Stiles, we’re all about keeping things stylish, in your home, your office, your restaurant, and any space you can imagine! Our goal at Stiles is to be exclusive and unique, offering only the best quality tiles and sanitaryware in South Africa. Quality and style will always outweigh price when we select products.</p>
        <p className='text-sm lg:text-basepb-6'>Along with importing products from top tile and sanitaryware factories across the globe, we pride ourselves in being a community-driven South African company. Stiles supports local industry, artisans and artists from South Africa. We believe in the tiles and sanitaryware we market, and employ creative people with an enthusiasm to keep all things stylish, making us leaders in service, technical advice, creative ability and innovative ideas.</p>
        <ButtonStiles text='About Us' styleType="dark" href='#' respFullWidth={true} />
      </div>
    </section>
  )
}

const OurProducts = () => {

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState("Tiles");

  useEffect(() => {
      fetch(`/data/products2.json`)
      .then(res => res.json())
      .then(data => {
        const selectedData = data.filter(item => item.product_cat.includes("Tiles"));
          // Shuffle the array
          const shuffledData = selectedData.sort(() => 0.5 - Math.random());
          // Get the first 30 items
          const selectedProducts = shuffledData.slice(0, 6);
          setProduct(selectedProducts);
      })
      .catch(err => {
          console.log(err);
      });
  }, []);

  const updateCat = (cat) => {
    setCategory(cat);
    fetch(`/data/products2.json`)
    .then(res => res.json())
    .then(data => {
        const selectedData = data.filter(item => item.product_cat.includes(cat));
        // Shuffle the array
        const shuffledData = selectedData.sort(() => 0.5 - Math.random());
        // Get the first 30 items
        const selectedProducts = shuffledData.slice(0, 6);
        setProduct(selectedProducts);
    })
    .catch(err => {
        console.log(err);
    });
  };
  return (
    <BlurFade delay={0.2} inView className='w-full'>
        <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
          <div className="flex flex-row justify-between items-end gap-5 w-full">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Products we are proud of</h2>
            <a href="#" className='hidden lg:block'>VIEW ALL OUR PRODUCTS</a>
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
                <SplideSlide>
                  <ProductCard key={index} onClick={() => window.location.href = "/product/" + item.slug} prod={item.slug} />
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

  return (
    <section className='w-full py-20 lg:py-32 px-4 flex flex-col justify-center items-center bg-[url("/images/bannerhome.png")] bg-cover bg-center relative'>
      <div className='bg-black/40 w-full h-full absolute top-0 left-0 z-0'></div>
      <div className='flex flex-col justify-center items-center gap-6 w-full max-w-5xl z-10 relative'>
        <p className='text-lg leading-tight lg:text-4xl font-medium text-white text-center'>Subscribe to our weekly newsletter to get the latest updates and amazing offers delivered in your inbox</p>
        <div className='relative w-full max-w-[460px] flex justify-center items-center'>
          <input type="mail" className='w-full h-12 pl-3 pr-24 rounded-full lg:rounded z-0 placeholder:text-sm lg:placeholder:text-base' placeholder='Email Address' />
          <button className='absolute right-0.5 px-4 h-[42px] hover:bg-primary bg-dark hover:text-dark text-white rounded-full lg:rounded-md text-sm font-bold uppercase transition-all'>Subscribe</button>
        </div>
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
          <p className='text-sm lg:text-base'>We are picky when it comes to our brands and only stock the most stylish tiles and sanitaryware you can find in the country. A lot of brands are exclusively available to us like Italy’s Monocibec and Newform or Spain’s Realonda and Brazil’s Ceusa. We also pride ourselves in stocking top quality well-known brands like Duravit, Hansgrohe, Blutide and Geberit. To see our full range of brands, Visit our Shop by Brand section.</p>
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
          <img src="/images/partner.png" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Blutilde"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/ceusa.webp" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Ceusa"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/coem.jpg" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Coem"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/monocieb.webp" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Monocibec"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/newform.webp" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Newform"} />
        </SplideSlide>
        <SplideSlide>
          <img src="/images/florim.webp" alt="" className='w-full object-cover object-center cursor-pointer' onClick={() => window.location.href="/product-category/brands/Florim"} />
        </SplideSlide>
      </Splide>
    </section>
  )
}

const Blog = () => {
  return (
    <div className='w-full'>
      <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
        <div className="flex flex-row justify-between items-end gap-5 w-full">
          <h2 className='font-bold text-3xl lg:text-5xl uppercase'>THE STILES BLOG</h2>
          <a href="#" className='hidden lg:block'>VIEW ALL OUR STORIES</a>
        </div>
        <div className='pt-6 w-full hidden lg:grid grid-cols-3 gap-6'>
          <BlogCard title="The Rise of Green Tiles in South Africa: A Trend Reimagined" cat="DÉCOR INSPIRATION" img="https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/10/Keradom-Home-Brick-Forest-Gloss-60x250mm_Stiles_Lifestyle_Image-1080x1080.webp?resize=1080%2C1080&ssl=1" desc='Gone are the days of the bland beige bathroom. With a tombstone that reads, "Here lies Beige, the inoffensive one...' />
          <BlogCard title="Artful Living, design inspiration for your walls." cat="UNCATEGORIZED" img="https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/08/Stevie-Joubert-scaled-1-1080x1080.jpg?resize=1080%2C1080&ssl=1" desc='“It’s not about a tile. It’s about a lifestyle,” says Stevie Joubert, CEO of tile retailer, Stiles.' />
          <BlogCard title="Elevate Your Home Décor with Matiz: A Guide to Using Pastel Colour Decor Tiles with Stiles Tiles" cat="DÉCOR INSPIRATION" img="https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/01/Portinari-Matiz-BL-Lux-80x250mm_Stiles_Lifestyle_Image-1080x1080.png?resize=1080%2C1080&ssl=1" desc='Are you looking to breathe new life into yo...' />
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
        <SplideSlide>
          <BlogCard title="The Rise of Green Tiles in South Africa: A Trend Reimagined" cat="DÉCOR INSPIRATION" img="https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/10/Keradom-Home-Brick-Forest-Gloss-60x250mm_Stiles_Lifestyle_Image-1080x1080.webp?resize=1080%2C1080&ssl=1" desc='Gone are the days of the bland beige bathroom. With a tombstone that reads, "Here lies Beige, the inoffensive one...' />
        </SplideSlide>
        <SplideSlide>
          <BlogCard title="Artful Living, design inspiration for your walls." cat="UNCATEGORIZED" img="https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/08/Stevie-Joubert-scaled-1-1080x1080.jpg?resize=1080%2C1080&ssl=1" desc='“It’s not about a tile. It’s about a lifestyle,” says Stevie Joubert, CEO of tile retailer, Stiles.' />
        </SplideSlide>
        <SplideSlide>
          <BlogCard title="Elevate Your Home Décor with Matiz: A Guide to Using Pastel Colour Decor Tiles with Stiles Tiles" cat="DÉCOR INSPIRATION" img="https://i0.wp.com/stiles.co.za/wp-content/uploads/2024/01/Portinari-Matiz-BL-Lux-80x250mm_Stiles_Lifestyle_Image-1080x1080.png?resize=1080%2C1080&ssl=1" desc='Are you looking to breathe new life into yo...' />
        </SplideSlide>
      </Splide>
    </div>
  )
}