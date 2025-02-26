import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPinterest } from "react-icons/fa";

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
            <a href="tel:+27(021)5108310" target="_blank" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="tel:+27(087)0943227" target="_blank" className="text-white text-sm text-center lg:text-left">Paarl: +27 (087) 094 3227</a>
            <a href="tel:+27(021)8795657" target="_blank" className="text-white text-sm text-center lg:text-left">Somerset West: +27 (021) 879 5657</a>
            <a href="tel:+27(022)8800310" target="_blank" className="text-white text-sm text-center lg:text-left">West Coast: +27 (022) 880 0310</a>
            <a href="tel:+27(044)8713222" target="_blank" className="text-white text-sm text-center lg:text-left">George: +27 (044) 871 3222</a>
            <a href="tel:+27(044)6951800" target="_blank" className="text-white text-sm text-center lg:text-left">Mossel Bay: +27 (044) 695 1800</a>
            <a href="tel:+27(014)4953040" target="_blank" className="text-white text-sm text-center lg:text-left">Rustenburg: +27 (014) 495 3040</a>
            <a href="tel:+27(012)8804737" target="_blank" className="text-white text-sm text-center lg:text-left">Pretoria (Menlyn Maine): +27 (012) 880 4737</a>
            <a href="tel:+27(012)8840084" target="_blank" className="text-white text-sm text-center lg:text-left">Centurion: +27 (012) 884 0084</a>
            <a href="tel:+27(031)2631192" target="_blank" className="text-white text-sm text-center lg:text-left">Durban: +27 (031) 263 1192</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer