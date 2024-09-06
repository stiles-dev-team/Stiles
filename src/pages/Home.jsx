
import Layout from '../layout/Layout'
import ButtonStiles from '../components/ButtonStiles'
import { IoIosArrowDown } from "react-icons/io";

const Home = () => {
  return (
    <Layout>
      <main className='w-full flex flex-col justify-start items-start gap-28'>
        <Hero />
        <WhoWeAre />
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
    <section id="whoweareHome" className='container mx-auto px-4 flex flex-row justify-between items-center gap-20'>
      <h2></h2>
    </section>
  )
}