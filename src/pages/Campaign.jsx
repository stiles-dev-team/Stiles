import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from '../layout/Layout'

const formatCampaignName = (slug = '') => {
  const label = decodeURIComponent(slug)
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!label) return 'Forme Hexagon'

  return label.replace(/\b\w/g, (char) => char.toUpperCase())
}

const Campaign = () => {
  const { campaignName } = useParams()
  const rangeName = formatCampaignName(campaignName)

  return (
    <Layout>
      <Helmet>
        <title>{rangeName} | Stiles</title>
        <meta
          name="description"
          content="Handpicked tiles and sanitaryware, exclusive ranges and the newest trends, all in one stylish place."
        />
      </Helmet>

      <main className="min-h-screen bg-[#f3f3f1] text-black">
        <section className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col items-center gap-10 px-5 pb-16 pt-28 sm:px-8 lg:flex-row lg:gap-12 lg:px-12 lg:pb-10 lg:pt-32 xl:gap-16 xl:px-16">
          <div className="flex w-full flex-col items-start lg:w-[46%] lg:max-w-[560px] lg:py-8">
            <span className="inline-flex items-center gap-2 rounded-full bg-black px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              <span className="h-2 w-2 rounded-full bg-primaryStiles" />
              Exclusive to Stiles
            </span>

            <h1 className="mt-7 text-[2.7rem] font-bold uppercase leading-[0.92] tracking-[-0.035em] text-black sm:text-6xl lg:text-[4.35rem] xl:text-[5rem]">
              The latest
              <br />
              <span className="bg-primaryStiles px-1.5">Style</span> at your
              <br />
              fingertips
            </h1>

            <p className="mt-7 max-w-md text-[15px] leading-relaxed text-neutral-600 sm:text-base">
              Handpicked tiles and sanitaryware, exclusive ranges and the newest trends, all in one stylish place.
            </p>

            <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Link
                to="/product-category/promo?promo=New%40Stiles&sort=asc&perPage=15&page=1"
                className="inline-flex items-center justify-center rounded-full bg-black px-7 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors hover:bg-neutral-800 sm:text-sm"
              >
                Explore new ranges
              </Link>
              <Link
                to="/contact-us"
                className="inline-flex items-center justify-center rounded-full border border-black bg-transparent px-7 py-3.5 text-center text-xs font-semibold uppercase tracking-[0.08em] text-black transition-colors hover:bg-black hover:text-white sm:text-sm"
              >
                Download catalogue
              </Link>
            </div>

            <p className="mt-12 flex items-center gap-4 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500">
              <span className="h-px w-10 bg-neutral-400" />
              Keeping it stylish since 2000
            </p>
          </div>

          <div className="relative w-full lg:w-[54%]">
            <div className="grid grid-cols-[1.12fr_0.88fr] items-stretch gap-3 sm:gap-4">
              <div className="relative min-h-[420px] overflow-hidden rounded-b-[1.75rem] rounded-t-[180px] sm:min-h-[520px] sm:rounded-t-[240px] lg:min-h-[640px] lg:rounded-b-[2rem] lg:rounded-t-[280px]">
                <img
                  src="/images/home/home-slider-v2.jpg"
                  alt="Terracotta kitchen with a checkerboard tile floor"
                  className="absolute inset-0 h-full w-full object-cover object-[22%_center]"
                />
              </div>

              <div className="flex flex-col gap-3 pt-8 sm:gap-4 sm:pt-12 lg:pt-16">
                <div className="relative h-[38%] min-h-[150px] overflow-hidden rounded-[1.6rem] sm:min-h-[180px] lg:rounded-[1.85rem]">
                  <img
                    src="/images/home/home-slider-v24.jpg"
                    alt="Terracotta fluted shower wall"
                    className="absolute inset-0 h-full w-full object-cover object-[54%_center]"
                  />
                </div>
                <div className="relative min-h-[210px] flex-1 overflow-hidden rounded-[2.4rem] sm:min-h-[250px] lg:rounded-[2.8rem]">
                  <img
                    src="/images/home/home-slider-v23.jpg"
                    alt="Soft pink wall tiles with ceramic cups"
                    className="absolute inset-0 h-full w-full object-cover object-[78%_center]"
                  />
                </div>
              </div>
            </div>

            <div className="absolute bottom-5 left-[18%] z-10 flex max-w-[240px] items-center gap-3 rounded-2xl bg-white px-3.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] sm:bottom-8 sm:left-[30%] sm:max-w-none sm:px-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center">
                <svg viewBox="0 0 44 44" className="h-11 w-11" aria-hidden="true">
                  <polygon points="22,2 40,12 40,32 22,42 4,32 4,12" fill="#F5ED1E" />
                  <polygon
                    points="22,11 33,17.2 33,29.8 22,36 11,29.8 11,17.2"
                    fill="none"
                    stroke="#111111"
                    strokeWidth="1.6"
                  />
                </svg>
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Featured range
                </p>
                <p className="truncate text-[15px] font-bold leading-tight text-black">{rangeName}</p>
                <p className="text-[13px] text-neutral-500">from R1,359.00 per m²</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  )
}

export default Campaign
