import React from "react";
import Layout from "../layout/Layout";

const EndOfRange = () => {
  return (
    <Layout>
      <section className="w-full bg-black relative flex flex-col justify-center items-center pt-20 h-[40vh]">
        <div className="w-full h-full absolute z-0 top-0 left-0 bg-black/30"></div>
        <div className="relative z-10 container mx-auto px-4 flex flex-col justify-center items-center gap-2">
          <h1 className="text-white font-bold text-5xl text-center drop-shadow-md">
            Stiles End of Range - Terms and Conditions
          </h1>
          {/* <div className='!text-white text-center w-full max-w-3xl'>
                    <p className='!text-white'></p>
                </div> */}
        </div>
      </section>
      <div className="container mx-auto px-4 py-20 leading-snug flex flex-col justify-start items-start gap-5">
        <ul className="list-disc list-inside flex flex-col gap-3">
          <p>
            Please take note of the terms and conditions for selected items for
            Stiles.
          </p>

          <p>
            Stiles items only apply to selected Tiles and Sanware identified as
            Stiles items.
          </p>
          <p>
            Stiles items will be sold while stocks last at respective branches
            or showrooms.
          </p>
          <p>
            Certain items identified as Stiles are only available at certain
            Stiles showrooms and may not be in stock at all Stiles showrooms.
          </p>
          <p>
            Should you request more of the same tile from another warehouse,
            same batch cannot be guaranteed and purchase will be at own risk.
          </p>
          <p>
            Merchandise as per quote and pallet pre-packed is given as is
            (voetstoots) – no breakages on pallets will be credited or replaced
            - and no selection will be allowed.
          </p>
          <p>
            No delivery will be included or available for items identified as
            Stiles items. Customer to arrange their own delivery at own risk and
            cost upfront if not collecting straight from the warehouse where the
            stock is warehoused.
          </p>
          <p>
            Orders placed and opted to pay via EFT will only be released once
            funds reflect in our bank account (Proof of payment can be sent to
            info@stiles.co.za and preferably the sales consultant to reserve
            your stock).
          </p>
          <p>
            No storage longer than 72 (seventy-two) hours will be allowed for
            Stiles items. Failure to collect order within this timeframe will
            result in loss of purchase without refund. For as long as the Stored
            Goods remain in Stiles’ possession, the Customer hereby, as far as
            the law allows, pledges and cedes in securitatem debiti the Stored
            Goods (and all its rights in and to the Stored Goods) to and in
            favour of Stiles as security for all obligations due by it to Stiles
            under this Agreement (including amounts payable). Without limiting
            or derogating from Stiles’ rights under this Agreement or at law, in
            the event that this Agreement is terminated arising from any breach
            or event of default by the Customer, Stiles may, as far as the law
            allows, without notice to the Customer and without first obtaining
            an order of court, sell all or part of the Stored Goods in its
            possession in order to set-off any amounts that the Customer owes
            for storage to Stiles under this Agreement. In this clause, you
            grant a pledge in favour of Stiles as security for your obligations.
            This means that, if you breach this Agreement, Stiles is entitled to
            sell the Stored Goods and apply the proceeds towards settling the
            amounts you owe, as far as the law allows. It may result in you
            losing rights you might otherwise have. Risk in the Stored Goods
            shall pass to the Customer on the Sale Date and, for the duration of
            the Storage Period and for such longer period until Stiles has made
            the Stored Goods available for collection and/or released the Stored
            Goods, the Customer shall bear the risk of damage to, destruction or
            theft of the Stored Goods so stored, as far as the law allows. In
            this clause, as far as the law allows, you assume risk and liability
            for the Stored Goods even while they are in our possession. This may
            limit your rights if you suffer loss.
          </p>

          <ul className="list-disc list-inside flex flex-col gap-3">
            <li>
              Stiles items should be paid for in full at the time of purchase.
            </li>
            <li>
              A no return policy applies to items bought from Stiles and
              identified as Stiles.
            </li>
            <li>Discounted items on Stiles products may end at any point.</li>
            <li>
              Prices are subject to a price change at any point without prior
              communication.
            </li>
            <li>All prices are exclusive of VAT (unless otherwise stated).</li>
            <li>Prices do not include delivery unless otherwise stated.</li>
            <li>
              We are not responsible for any measurements supplied by you or
              calculated by us. We endeavor to do our best at all times, but
              ultimately the responsibility lies with you, your quantity
              surveyor or your builder.
            </li>
            <li>
              We are entitled to a 20% cancellation fee on cancelled orders. In
              the event of “Special Import”, manufactured items and/or special
              orders, we will negotiate the cancellation fee (minimum fee of
              R299).
            </li>
            <li>The goods remain the property of Stiles until paid in full.</li>
          </ul>

          <p>
            <strong>
                Payment Clearance Periods:
            </strong>
        </p>

          <ul className="list-disc list-inside flex flex-col gap-3">
            <li>Credit Card – Immediately</li>
            <li>Internet Transfers – 2 Working Days</li>
            <li>Bank Transfers – 4 Working Days</li>
          </ul>

          <p>
            All payments must be made in full, free of any deduction or set-off.
            Any bank charges, transfer fees, currency conversion costs, or other
            related banking costs incurred in making payment shall be borne by
            the payer. The recipient must receive the full invoiced amount
            without any deduction for such charges.
          </p>
        </ul>
      </div>
    </Layout>
  );
};

export default EndOfRange;
