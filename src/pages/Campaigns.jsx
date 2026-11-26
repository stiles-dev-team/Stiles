import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import Layout from '../layout/Layout'
import './campaign.css'

const CAMPAIGNS = [
  {
    slug: 'twiggy',
    title: 'The Twiggy Collection',
    excerpt: 'A chromatic story of 10 modern shades, in Matt and Lux finishes.',
    image: '/images/campaigns/twiggy/hero.jpg',
    alt: 'Twiggy tiles in a warm, modern living space',
  },
]

const Campaigns = () => {
  return (
    <Layout>
      <Helmet>
        <title>Campaigns | Stiles</title>
        <meta
          name="description"
          content="Explore Stiles campaigns, including the Twiggy Collection."
        />
      </Helmet>

      <div className="campaign-page">
        <section className="cp-sec campaigns-index">
          <div className="cp-wrap">
            <header className="campaigns-index__head">
              <h1 className="cp-h2">Campaigns</h1>
              <p className="cp-sec-sub">Collections and stories from the Stiles range.</p>
            </header>

            <div className="campaigns-grid">
              {CAMPAIGNS.map((campaign) => (
                <Link className="campaign-card" to={`/campaigns/${campaign.slug}`} key={campaign.slug}>
                  <span className="campaign-card__media">
                    <img src={campaign.image} alt={campaign.alt} />
                  </span>
                  <span className="campaign-card__body">
                    <h2>{campaign.title}</h2>
                    <p>{campaign.excerpt}</p>
                    <span className="cp-btn cp-btn--black">Explore the range</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  )
}

export default Campaigns
