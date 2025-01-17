import Layout from '../layout/Layout'
import ButtonStiles from '../components/ButtonStiles'
import { IoIosArrowDown } from "react-icons/io";
import ProductCard from '../components/ProductCard';
import { Skeleton } from "../components/ui/skeleton"
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
    <section id='heroHome' className='w-full h-lvh bg-[url("/images/hero.png")] bg-cover bg-center relative flex flex-col justify-center items-center'>
      <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
      <div className='relative z-10 container mx-auto px-4'>
        <h1 className='text-white text-5xl md:text-8xl font-bold uppercase pb-5'>SMART<br />BESPOKE<br />INTERIORS.</h1>
        <ButtonStiles text='Know More' styleType="light" href='#whoweareHome' extraStyle="hidden lg:block" />
      </div>
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

  useEffect(() => {
      fetch(`/data/products.json`)
      .then(res => res.json())
      .then(data => {
          // Shuffle the array
          const shuffledData = data.sort(() => 0.5 - Math.random());
          // Get the first 30 items
          const selectedProducts = shuffledData.slice(0, 6);
          setProduct(selectedProducts);
          setLoading(false);
      })
      .catch(err => {
          console.log(err);
          setLoading(false);
      });
  }, []);
  return (
    <BlurFade delay={0.2} inView className='w-full'>
        <section id="ourproductsHome" className='container mx-auto px-4 flex flex-col justify-start items-start'>
          <div className="flex flex-row justify-between items-end gap-5 w-full">
            <h2 className='font-bold text-3xl lg:text-5xl uppercase'>Products we are proud of</h2>
            <a href="#" className='hidden lg:block'>VIEW ALL OUR PRODUCTS</a>
          </div>
          <div className="flex flex-row justify-start items-center gap-5 w-full pt-5 max-w-full overflow-x-auto scrollsnap">
            <button className='underline text-lg font-semibold uppercase underline-offset-4'>TILES</button>
            <button className='text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'>Taps</button>
            <button className='text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'>sanitaryware</button>
            <button className='text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'>Baths</button>
            <button className='text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'>Basins</button>
            <button className='text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'>Mosaics</button>
            <button className='text-lg font-semibold text-opaque uppercase transition-all hover:text-dark hover:underline underline-offset-4'>Pavers</button>
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
          type: 'loop',
          perMove: 1,
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
            <ProductCard />
          </SplideSlide>
          <SplideSlide>
            <ProductCard />
          </SplideSlide>
          <SplideSlide>
            <ProductCard promo={true} />
          </SplideSlide>
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
        <p className='text-lg leading-tight lg:text-4xl font-medium text-white text-center'>Lorem ipsum dolor sit amet consectetur. Pretium fermentum aliquet ultrices eget pharetra in porttitor. Molestie est dolor.</p>
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
        <a href="#" className='hidden lg:block'>VIEW ALL OUR CATEGORIES</a>
      </div>
      <div className='lg:grid lg:grid-cols-3 lg:grid-rows-2 lg:gap-4 w-full'>
        <div className="row-span-2 relative hidden lg:block">
          <img src="/images/hero.png" alt="" className='w-full h-full object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Kitchen Tiles" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold' />
        </div>
        <div className=' relative hidden lg:block'>
          <img src="/images/hero.png" alt="" className='w-full aspect-[16/12] object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Bathrooms" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold' />
        </div>
        <div className="col-start-2 row-start-2 relative hidden lg:block">
          <img src="/images/hero.png" alt="" className='w-full aspect-[16/12] object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Commercial" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold' />
        </div>
        <div className="row-span-2 col-start-3 row-start-1 relative hidden lg:block">
          <img src="/images/hero.png" alt="" className='w-full h-full object-cover object-center relative z-0 rounded-2xl' />
          <Chip size="lg" value="Fireplaces" className='w-fit absolute z-10 top-5 left-5 bg-white font-bold' />
        </div>
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
            <div className='w-full relative'>
              <img src="/images/hero.png" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Kitchen Tiles" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold' />
            </div>
          </SplideSlide>
          <SplideSlide>
            <div className='w-full relative'>
              <img src="/images/hero.png" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Bathrooms" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold' />
            </div>
          </SplideSlide>
          <SplideSlide>
            <div className='w-full relative'>
              <img src="/images/hero.png" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Commercial" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold' />
            </div>
          </SplideSlide>
          <SplideSlide>
            <div className='w-full relative'>
              <img src="/images/hero.png" alt="" className='w-full aspect-video object-cover object-center relative z-0 rounded-lg' />
              <Chip size="lg" value="Fireplaces" className='w-fit absolute z-10 top-3 left-3 bg-white font-bold' />
            </div>
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
          speed: 1,
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
          <img src="/images/partner.png" alt="" className='w-full object-cover object-center' />
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
          <BlogCard />
          <BlogCard />
          <BlogCard />
        </div>
      </section>
      <Splide className="lg:hidden w-full mt-5" options={{
        perPage: 1,
        type: 'loop',
        perMove: 1,
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
          <BlogCard />
        </SplideSlide>
        <SplideSlide>
          <BlogCard />
        </SplideSlide>
        <SplideSlide>
          <BlogCard />
        </SplideSlide>
      </Splide>
    </div>
  )
}