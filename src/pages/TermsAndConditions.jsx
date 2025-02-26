import React from "react";
import Layout from "../layout/Layout";

const TermsAndConditions = () => {
  return (
    <Layout>
        <section className='w-full bg-dark relative flex flex-col justify-center items-center pt-20 h-[40vh]'>
            <div className='w-full h-full absolute z-0 top-0 left-0 bg-black/30'></div>
            <div className='relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2'>
                <h1 className='text-white font-bold text-5xl text-center drop-shadow-md'>Stiles Terms and Conditions of Sale</h1>
                {/* <div className='!text-white text-center w-full max-w-3xl'>
                    <p className='!text-white'></p>
                </div> */}
            </div>
        </section>
      <div className="container mx-auto px-4 py-20 leading-snug flex flex-col justify-start items-start gap-5">
        <p>
          <strong>Stiles Terms and Conditions of Sale</strong>
        </p>
        <ul className="list-disc list-inside flex flex-col gap-3">
          <li>All prices are exclusive of VAT (unless otherwise stated)</li>
          <li>
            Prices quoted are on current stock items &amp; valid for 5 (five
            days)
          </li>
          <li>Pro-forma invoices are payable on presentation</li>
          <li>
            In the case of “Special Import”, manufactured items and/or special
            orders, the full amount is paid on order
          </li>
          <li>Prices do not include delivery unless otherwise stated</li>
          <li>
            Goods are delivered to site alongside the vehicle and cannot be
            moved beyond this point. No liability whatsoever is accepted or
            assumed for damage to any property whether by negligence or
            otherwise
          </li>
          <li>
            If goods are unable to be delivered for whatever reason, a
            re-delivery charge will be applicable. The re-delivery charge will
            be a minimum of R 450 excl. VAT or the applicable AA rate per
            kilometer to the site
          </li>
          <li>
            Claims for breakages, shortages or defects must be lodged within 24
            hours of receipt of goods
          </li>
          <li>
            Only first grade tiles carry a Manufacturer’s Guarantee. All other
            grades are sold in terms of the Consumer’s Protection Act
          </li>
          <li>
            Before fixing tiles check for tonality and sizing on all grades/
            shades and calibration
          </li>
          <li>
            No claim whatsoever will be considered after tiles have been fixed
          </li>
          <li>
            We are not responsible for any measurements supplied by you or
            calculated by us. We endeavor to do our best at all times, but
            ultimately the responsibility lies with you, your quantity surveyor
            or your builder
          </li>
          <li>
            All quantities should include a 10% excess and in the case of
            bathroom walls or diagonal patterns a 15% excess
          </li>
          <li>Allow a 5% excess for breakage on natural stone products</li>
          <li>
            In the case of natural stone products shades are natural and we do
            not assume responsibility for any particular batch
          </li>
          <li>
            We are entitled to a 15% cancellation fee on cancelled orders. In
            the event of “Special Import”, manufactured items and/or special
            orders, we will negotiate the cancellation fee
          </li>
          <li>
            All prices are subject to major currency fluctuations in Foreign
            exchange rates
          </li>
          <li>
            In order to qualify for settlement discount, your payment must
            reflect on our bank account on the last day of the month, in which
            it is due
          </li>
          <li>The goods remain the property of Stiles until paid in full</li>
          <li>&amp; O.E.</li>
        </ul>
        <p>
          <strong>Returns</strong>
        </p>
        <ul className="list-disc list-inside flex flex-col gap-3">
          <li>
            Returns will only be accepted within 30 (thirty) days from date of
            invoice
          </li>
          <li>
            Returns will only be accepted if the goods are returned in their
            original state
          </li>
          <li>
            Returns will not be accepted on “Special Import”, manufactured items
            and/or special orders
          </li>
          <li>
            Returns will not be accepted on products purchased as “Specials”
          </li>
          <li>
            A 20% handling fee will be charged on all returns, excluding
            specifically mentioned items above
          </li>
        </ul>
        <p>
          <strong>Payment Clearance Periods</strong>
        </p>
        <ul className="list-disc list-inside flex flex-col gap-3">
          <li>Cheques – 7 Working Days</li>
          <li>Internet Transfers – 2 Working Days</li>
          <li>Bank Transfers – 4 Working Days</li>
        </ul>
      </div>
    </Layout>
  );
};

export default TermsAndConditions;
