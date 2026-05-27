import React from "react";
import Layout from "../layout/Layout";

const ProductDisclaimer = () => {
  return (
    <Layout>
      <section className="w-full bg-black relative flex flex-col justify-center items-center pt-20 h-[40vh]">
        <div className="w-full h-full absolute z-0 top-0 left-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2">
          <h1 className="text-white font-bold text-5xl text-center drop-shadow-md">
            Product Disclaimer
          </h1>
          {/* <div className='!text-white text-center w-full max-w-3xl'>
                    <p className='!text-white'></p>
                </div> */}
        </div>
      </section>
      <div className="container mx-auto px-4 py-20 leading-snug flex flex-col justify-start items-start gap-5">
        <p>
          <strong>Product Disclaimer:</strong>
        </p>
        <p>
          The information provided by Stiles on&nbsp;
          <a
            href="https://staging.stiles.co.za/"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            www.stiles.co.za
          </a>{" "}
          is for general informational purposes only.
        </p>
        <p>
          All information on the&nbsp;
          <a
            href="https://staging.stiles.co.za/"
            target="_blank"
            rel="nofollow noopener noreferrer"
          >
            www.stiles.co.za
          </a>{" "}
          is provided in good faith, however we make no representation or
          warranty of any kind, express or implied, regarding the accuracy,
          adequacy, validity, reliability, availability or completeness of any
          information on the site, specifically with regards to the colour, size
          and shade of tiles as well as batch changes and differences that may
          occur. Please note that lifestyle images shown on the website may not
          always depict the correct size of the tile being sold. It may also
          include other products not sold by Stiles, nor relevant to the product
          being sold. Refer to product image for a better idea of what product
          is being sold. Under no circumstance shall we have any liability to
          you for any loss or damage of any kind incurred as a result of the use
          of the site or reliance on any information provided on the site. Your
          use of the site and your reliance on any information on the site is
          solely at your own risk.
        </p>
      </div>
    </Layout>
  );
};

export default ProductDisclaimer;
