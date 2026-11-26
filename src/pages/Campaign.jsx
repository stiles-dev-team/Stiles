import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from '../layout/Layout'
import ProductCard from '../components/ProductCard'
import { CircularPagination } from '../components/CircularPagination'
import './campaign.css'

const PER_PAGE = 15
const HERO_IMAGE = '/images/campaigns/twiggy/hero.jpg'
const YOUTUBE_ID = 'M7lc1UVf-VE'

const PRODUCTS = [
  'twiggy-carta-zucchero-matt-38x380mm',
  'twiggy-dune-lux-38x380mm',
  'twiggy-dune-matt-38x380mm',
  'twiggy-kajal-matt-38x380mm',
  'twiggy-kajal-lux-38x380mm',
  'twiggy-luna-lux-38x380mm',
  'twiggy-luna-matt-38x380mm',
  'twiggy-menta-lux-38x380mm',
  'twiggy-menta-matt-38x380mm',
  'twiggy-mattone-lux-38x380mm',
  'twiggy-mattone-matt-38x380mm',
  'twiggy-nudo-lux-38x380mm',
  'twiggy-nudo-matt-38x380mm',
  'twiggy-oliva-lux-38x380mm',
  'twiggy-oliva-matt-38x380mm',
  'twiggy-terra-lux-38x380mm',
  'twiggy-blu-petrolio-lux-38x380mm',
  'twiggy-blu-petrolio-matt-38x380mm',
  'twiggy-carta-zucchero-lux-38x380mm',
  'twiggy-terra-matt-38x380mm',
]

const DOWNLOADS = [
  { title: 'Forme Hexagon Catalogue', category: 'Catalogue', type: 'PDF', size: '8.4 MB' },
  { title: 'Forme Technical Info Sheet', category: 'Info sheet', type: 'PDF', size: '1.2 MB' },
  { title: 'Canis Dog Collection Brochure', category: 'Brochure', type: 'PDF', size: '3.9 MB' },
  { title: 'Installation and Care Guide', category: 'Guide', type: 'PDF', size: '2.1 MB' },
  { title: 'Colour and Finish Swatch Sheet', category: 'Info sheet', type: 'PDF', size: '950 KB' },
  { title: 'Price List (per m²)', category: 'Price list', type: 'XLS', size: '180 KB' },
]

const POINTS = [
  { title: 'Exclusive ranges', text: 'Designs you will not find anywhere else in South Africa.' },
  { title: 'Expert advice', text: 'Technical help and creative ideas from our branch teams.' },
  { title: 'Proudly local', text: 'Supporting South African industry, artisans and artists.' },
]

const ArrowRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

const ArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 4v13M6 12l6 6 6-6" />
  </svg>
)

const Campaign = () => {
  const [page, setPage] = useState(1)
  const [playing, setPlaying] = useState(false)

  const total = PRODUCTS.length
  const pages = Math.max(1, Math.ceil(total / PER_PAGE))
  const current = Math.min(Math.max(1, page), pages)
  const start = (current - 1) * PER_PAGE
  const visible = PRODUCTS.slice(start, start + PER_PAGE)

  return (
    <Layout>
      <Helmet>
        <title>The Twiggy Collection | Stiles</title>
        <meta
          name="description"
          content="Twiggy is a chromatic story of 10 modern shades, in Matt and Lux finishes. Explore the range at Stiles."
        />
      </Helmet>

      <div className="campaign-page">
        <section className="cp-hero" aria-label="Featured">
          <div className="cp-hero__media">
            <img src={HERO_IMAGE} alt="Twiggy tiles in a warm, modern living space" />
          </div>
          <div className="cp-wrap cp-hero__copy">
            <h1>The Twiggy Collection</h1>
            <a className="cp-btn cp-btn--white" href="#products">Explore the Range</a>
          </div>
        </section>

        <section className="cp-sec" id="intro">
          <div className="cp-wrap">
            <div className="cp-intro">
              <h2 className="cp-h2">Slender, elongated, and petite</h2>
              <div className="cp-intro__body">
                <p>Color, color, and more color…</p>
                <p>
                  Twiggy is a chromatic story that unfolds through a palette of 10 modern and refined shades. The colors, delicate and harmonious, are designed to be combined with each other, creating always elegant and versatile combinations. Available in both Matt and Lux finishes, Twiggy brings a breath of fresh air to any environment.
                </p>
              </div>
            </div>
            <div className="cp-points">
              {POINTS.map((point, index) => (
                <div className="cp-point" key={point.title}>
                  <span className="cp-point__n">{`0${index + 1}`}</span>
                  <h3>{point.title}</h3>
                  <p>{point.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="cp-sec" id="products">
          <div className="cp-wrap">
            <div className="cp-sec-head">
              <h2 className="cp-h2">Products we are proud of</h2>
              <a className="cp-btn cp-btn--outline" href="#products">View all our products</a>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-5 w-full">
              {visible.map((slug) => (
                <a href={`/product/${slug}`} key={slug}>
                  <ProductCard prod={slug} compactBadges />
                </a>
              ))}
            </div>

            {pages > 1 && (
              <CircularPagination
                totalItems={total}
                itemsPerPage={PER_PAGE}
                currentPage={current}
                onPageChange={setPage}
              />
            )}
          </div>
        </section>

        <section className="cp-sec cp-sec--dark" id="downloads">
          <div className="cp-wrap cp-dl">
            <div className="cp-dl__lead">
              <h2 className="cp-h2">Downloads</h2>
              <p className="cp-sec-sub">Info sheets, catalogues and installation guides for this range.</p>
            </div>
            <div className="cp-drows">
              {DOWNLOADS.map((item) => (
                <a className="cp-drow" href="#downloads" key={item.title} aria-label={`Download ${item.title} (${item.type}, ${item.size})`}>
                  <span className="cp-drow__type" aria-hidden="true">{item.type}</span>
                  <span>
                    <span className="cp-drow__title">{item.title}</span>
                    <span className="cp-drow__meta">{item.category} · {item.size}</span>
                  </span>
                  <span className="cp-drow__go" aria-hidden="true"><ArrowDown /></span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="cp-sec" id="video">
          <div className="cp-wrap cp-video">
            <div className="cp-sec-head cp-sec-head--center">
              <h2 className="cp-h2">See it in action</h2>
            </div>
            <div className="cp-vwrap">
              <div className="cp-player">
                {playing ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_ID}?autoplay=1&rel=0`}
                    title="See it in action"
                    allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <button type="button" className="cp-player__poster" onClick={() => setPlaying(true)} aria-label="Play video">
                    <img src={HERO_IMAGE} alt="" />
                    <span className="cp-player__play">
                      <span>
                        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                          <path d="M6 4l14 8-14 8z" />
                        </svg>
                      </span>
                    </span>
                  </button>
                )}
              </div>
            </div>
            <p className="cp-video__caption">Watch how the Forme range transforms a space.</p>
          </div>
        </section>

        <section className="cp-sec cp-sec--alt cp-cta" id="cta">
          <div className="cp-wrap">
            <div className="cp-cta__inner">
              <h2 className="cp-h2">Talk to a specialist sales consultant</h2>
              <p>Planning a project with Twiggy? Our consultants can help with samples, quantities, pricing and delivery.</p>
              <Link className="cp-btn cp-btn--black cp-btn--lg" to="/contact-us">
                Connect with a consultant
                <ArrowRight />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Campaign
