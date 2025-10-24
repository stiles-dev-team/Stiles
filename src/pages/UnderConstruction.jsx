import Layout from '../layout/Layout'
import ButtonStiles from '../components/ButtonStiles'
import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';

const UnderConstruction = () => {
  const [homeContent, setHomeContent] = useState(null);
  const [contentLoading, setContentLoading] = useState(true);

  // Fetch home page content for consistent styling
  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const response = await fetch("https://stiles.co.za/api/admin-content.php?page=home", {
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
        <title>Under Construction | Stiles</title>
        <meta name="description" content="This page is currently under construction. Please check back soon for updates." />
        <meta property="og:image" content="/images/favi.webp" />
        <meta property="og:title" content="Under Construction | Stiles" />
        <meta property="og:description" content="This page is currently under construction. Please check back soon for updates." />
        <meta property="og:url" content="https://stiles.co.za/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Stiles" />
        <meta property="og:locale" content="en_ZA" />
      </Helmet>
      <main className='w-full flex flex-col justify-start items-start'>
        <UnderConstructionHero content={homeContent} />
      </main>
    </Layout>
  )
}

export default UnderConstruction

const UnderConstructionHero = ({ content }) => {
  // Use the same background image as the hero component or a construction-themed image
  const backgroundImage = "/images/Website_Banners.jpg"; // You can change this to a construction-themed image
  
  return (
    <section className='w-full h-lvh relative flex flex-col justify-center items-center'>
      <div className='w-full h-lvh absolute z-10 top-0 left-0 bg-black/50'></div>
      <img 
        src={backgroundImage} 
        alt="Under Construction" 
        className='w-full h-lvh absolute top-0 left-0 z-0 object-cover object-center' 
      />
      <div className='relative z-10 container mx-auto px-4 text-center'>
        <h1 className='text-white text-4xl md:text-7xl font-bold uppercase pb-5 w-full max-w-4xl mx-auto'>
          Under Construction
        </h1>
        <p className='text-white text-lg md:text-xl mb-8 w-full max-w-2xl mx-auto'>
          We're working hard to bring you something amazing. This page will be available soon!
        </p>
        <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
          {/* <ButtonStiles 
            text="Go Home" 
            styleType="light" 
            href="/" 
            extraStyle="w-full sm:w-auto" 
          /> */}
          <ButtonStiles 
            text="Contact Us" 
            styleType="dark" 
            href="/contact-us" 
            extraStyle="w-full sm:w-auto" 
          />
        </div>
      </div>
    </section>
  )
}
