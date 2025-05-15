import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPinterest } from "react-icons/fa";
import locationData from '/public/data/stiles-locations.json';

const Footer = () => {
  return (
    <footer className='w-full bg-dark pt-20 pb-10'>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-20">
        <div className="flex flex-col justify-start items-center lg:items-start gap-5 lg:col-span-1">
          <img src="/images/logo_white.png" alt="logo" className="h-16" />
          <p className='text-white text-sm text-center lg:text-left'>Stiles, keeping it stylish since the year 2000</p>
          <div className="flex flex-row justify-start items-center gap-6">
            <a href="https://www.facebook.com/StilesZA?_ga=2.182460198.1614544313.1740408143-748394691.1737046589" target="_blank"><FaFacebook fill="white" size={20} /></a>
            <a href="https://www.instagram.com/stiles_tiles_with_style/?_ga=2.182460198.1614544313.1740408143-748394691.1737046589" target="_blank"><FaInstagram fill="white" size={20} /></a>
            <a href="https://za.linkedin.com/company/stilestiles/?_ga=2.182460198.1614544313.1740408143-748394691.1737046589" target="_blank"><FaLinkedin fill="white" size={20} /></a>
            <a href="https://www.youtube.com/channel/UCfobwBHsUj6wk-LYaL6pT-w?_ga=2.182460198.1614544313.1740408143-748394691.1737046589" target="_blank"><FaYoutube fill="white" size={20} /></a>
            <a href="https://za.pinterest.com/Stiles_Tiles_With_Style/_created/?_ga=2.182460198.1614544313.1740408143-748394691.1737046589" target="_blank"><FaPinterest fill="white" size={20} /></a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-center lg:items-start gap-2 lg:col-span-1">
          <h3 className="text-2xl font-bold text-white mb-4">LEGAL</h3>
          <a href="/stiles-terms-and-conditions-of-sale" className="text-white text-sm text-center lg:text-left">Terms & Conditions</a>
          <a href="/privacy-policy-popi-compliance" className="text-white text-sm text-center lg:text-left">Privacy Policy</a>
          <a href="/product-disclaimer" className="text-white text-sm text-center lg:text-left">Product Disclaimer</a>
        </div>
        <div className="flex flex-col justify-start items-center lg:items-start gap-2 lg:col-span-2">
          <h3 className="text-2xl font-bold text-white">GET IN TOUCH</h3>
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 w-full gap-2">
            {locationData.locations.map((location) => (
              <a 
                key={location.title}
                href={`tel:${location.phone.replace(/\s/g, '')}`} 
                target="_blank" 
                className="text-white text-sm text-center lg:text-left"
              >
                {location.title}: {location.phone}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer