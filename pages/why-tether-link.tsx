import Header from '../components/Header';
import Link from 'next/link';
import SEOHead from '../components/SEOHead';
import { generateArticleSchema, generateBreadcrumbSchema, SITE_URL } from '../lib/seo';

export default function WhyTetherLinkPage() {
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Why Tether Link', url: `${SITE_URL}/why-tether-link` },
  ];

  const schemaArticle = generateArticleSchema({
    title: 'Why Choose Tether Link | Safe USDT Staking',
    description: 'Discover why Tether Link is the best platform for USDT staking with professional oversight, transparent 0.5% fees, and experienced team.',
  });

  const schemaBreadcrumb = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="page-shell">
      <SEOHead
        pathName="/why-tether-link"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [schemaArticle, schemaBreadcrumb],
        }}
      />
      <Header />

      <main className="page-content">
        <section className="why-hero">
          <div className="why-hero-copy animate-fade-up">
            <h1>A clear way to stake USDT with professional oversight.</h1>
            <p>
              Tether Link gives you a simple platform for staking USDT with fixed APY products, transparent fees and active capital management.
            </p>
            <ul className="why-hero-list">
              <li>Simple staking products with stated APY.</li>
              <li>Capital managed across global market opportunities.</li>
              <li>Built for clarity, not hype.</li>
            </ul>
          </div>

          <div className="why-hero-graphic">
            <div className="why-hero-visual-placeholder">
              <div className="why-hero-circle">
                <img src="/tether-usdt-logo.svg" alt="Tether" className="why-hero-static-img" />
              </div>
            </div>
          </div>
        </section>

        <section className="card-grid why-grid feature-grid stagger">
          <article className="feature-card feature-card-large">
            <div className="feature-card-top">
              <div className="feature-icon" aria-hidden="true">$
              </div>
              <div>
                <h4>What we do</h4>
                <p className="muted">A simple staking platform for USDT with clear products and professional oversight.</p>
              </div>
            </div>
            <p>We design fixed APY products, publish the terms up front and manage capital across diversified opportunities to pursue steady returns for users who stake USDT.</p>
          </article>

          <article className="feature-card feature-card-large">
            <div className="feature-card-top">
              <div className="feature-icon" aria-hidden="true">⚙️</div>
              <div>
                <h4>How it works</h4>
                <p className="muted">Simple deposit → select product → earn → withdraw flow.</p>
              </div>
            </div>
            <p>Deposit USDT to your wallet address, choose a fixed APY product and monitor earnings in your dashboard. Withdrawal rules are shown before you commit.</p>
          </article>

          <article className="feature-card feature-card-large">
            <div className="feature-card-top">
              <div className="feature-icon" aria-hidden="true">🔒</div>
              <div>
                <h4>Why it matters</h4>
                <p className="muted">Keep funds working with clear terms and transparent fees.</p>
              </div>
            </div>
            <p>Instead of leaving USDT idle, choose a product that suits you — we show APY, duration and fees so you can decide with confidence.</p>
          </article>
        </section>

        <section className="why-details-section">
          <h2>Designed for normal users and serious investors alike.</h2>
          <p>
            Tether Link is for anyone who wants a trusted way to stake USDT without confusing jargon. We focus on clear products, simple terms, and a team that manages the capital responsibly.
          </p>
        </section>

        <section className="card-grid why-card-grid stagger">
          <article className="feature-card">
            <h4>Fixed APY products</h4>
            <p>The APY is shown before you stake, and the terms are easy to review.</p>
          </article>
          <article className="feature-card">
            <h4>Transparent fee structure</h4>
            <p>There is a 0.5% platform fee and withdrawal details are shared clearly.</p>
          </article>
          <article className="feature-card">
            <h4>Experienced team</h4>
            <p>Our platform is supported by traders, analysts, developers and finance professionals.</p>
          </article>
        </section>

        <section className="why-cta-section">
          <div>
            <h2>Ready to stake USDT with clearer terms?</h2>
            <p>Open an account, choose a product, and track your staking from one simple dashboard.</p>
          </div>
          <Link href="/app" className="btn btn-primary">
            Start Staking
          </Link>
        </section>
      </main>
    </div>
  );
}
