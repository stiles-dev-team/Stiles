import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube, FaPinterest } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className='w-full bg-dark pt-20 pb-10'>
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-20">
        <div className="flex flex-col justify-start items-center lg:items-start gap-5 lg:col-span-1">
          <img src="/images/logo_white.png" alt="logo" className="h-16" />
          <p className='text-white text-sm text-center lg:text-left'>Lorem ipsum dolor sit amet consectetur. Pretium fermentum aliquet ultrices eget pharetra in porttitor. Molestie est dolor.</p>
          <div className="flex flex-row justify-start items-center gap-6">
            <a href="#"><FaFacebook fill="white" size={20} /></a>
            <a href="#"><FaInstagram fill="white" size={20} /></a>
            <a href="#"><FaLinkedin fill="white" size={20} /></a>
            <a href="#"><FaYoutube fill="white" size={20} /></a>
            <a href="#"><FaPinterest fill="white" size={20} /></a>
          </div>
        </div>
        <div className="flex flex-col justify-start items-center lg:items-start gap-2 lg:col-span-1">
          <h3 className="text-2xl font-bold text-white mb-4">LEGAL</h3>
          <a href="#" className="text-white text-sm text-center lg:text-left">Terms & Conditions</a>
          <a href="#" className="text-white text-sm text-center lg:text-left">Privacy Policy</a>
          <a href="#" className="text-white text-sm text-center lg:text-left">Product Disclaimer</a>
        </div>
        <div className="flex flex-col justify-start items-center lg:items-start gap-2 lg:col-span-2">
          <h3 className="text-2xl font-bold text-white">GET IN TOUCH</h3>
          <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 w-full gap-2">
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
            <a href="#" className="text-white text-sm text-center lg:text-left">Cape Town (P. Eiland): +27 (021) 510 8310</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer