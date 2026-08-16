import Header from "../components/Header";
import Image from "next/image";
import Link from "next/link";
import Typewriter from "../components/Typewriter";
import ProtocolOrbit from "../components/ProtocolOrbit";
import TransparencyVisual from "../components/TransparencyVisual";

export default function Home() {
  return (
    <div>
      <Header />

      <main>
        <section className="hero">
          <div className="hero-left">
            <h1>Tether Link</h1>

            <Typewriter
              phrases={[
                "Stake USDT",
                "Earn Fixed APY",
                "Access Global Markets",
                "Your Tether. Our Expertise.",
              ]}
            />

            <div className="hero-cta">
              <Link href="/app" className="btn btn-primary">
                Start Staking
              </Link>
              <a className="btn btn-ghost" href="/how-it-works">
                How It Works
              </a>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-visual">
              <ProtocolOrbit size={320} />
            </div>
          </div>
        </section>

        <section className="feature-section" id="features">
          <div className="feature-header">
            <h2>The token that is disrupting the global financial industry</h2>
            <p>Stake USDT with a platform focused on clear products, trusted market expertise and simple terms.</p>
          </div>

          <div className="feature-grid">
            <article className="feature-card feature-card-large">
              <div className="feature-card-top">
                <h4>Low minimum entry</h4>
                <span className="feature-icon">👤</span>
              </div>
              <p>Start staking with $100 USDT and keep the experience simple.</p>
              <a href="/how-it-works" className="feature-link">Learn more →</a>
            </article>

            <article className="feature-card feature-card-large">
              <div className="feature-card-top">
                <h4>Transparent fee structure</h4>
                <span className="feature-icon">🛍️</span>
              </div>
              <p>The platform fee is 0.5%, and any withdrawal details are shared up front.</p>
              <a href="/how-it-works" className="feature-link">Learn more →</a>
            </article>

            <article className="feature-card feature-card-large">
              <div className="feature-card-top">
                <h4>Clear withdrawal guidance</h4>
                <span className="feature-icon">📈</span>
              </div>
              <p>Withdrawals follow product terms so you know when funds will be available.</p>
              <a href="/how-it-works" className="feature-link">Learn more →</a>
            </article>
          </div>
        </section>
             <section className="cta-section">
          <div className="cta-copy">
            <h2>Ready to start staking USDT?</h2>
            <p>Open your account, choose a fixed APY product, and let the platform manage the capital with simple terms.</p>
          </div>
          <div className="cta-actions">
            <Link href="/app" className="btn btn-primary">
              Start Staking
            </Link>
            <Link href="/how-it-works" className="btn btn-ghost">
              How It Works
            </Link>
          </div>
        </section>
      </main>

      <section className="feature-transparency">
        <div className="ft-left">
          <h2>Managed staking with clear terms.</h2>
          <p>
            Tether Link offers USDT staking products with fixed APY and
            straightforward platform fees. The team manages capital across
            global opportunities while you can follow progress from your
            dashboard.
          </p>

          <div className="ft-cta">
            <a className="btn btn-ghost" href="/transparency">
              View Transparency
            </a>
          </div>
        </div>

        <div className="ft-right">
          <TransparencyVisual size={420} />
        </div>
      </section>

      <section className="pre-footer">
        <div className="pre-left">
          <div className="pre-visual">
            <ProtocolOrbit size={420} radius={160} count={8} />
          </div>
        </div>

        <div className="pre-right">
          <h2>Put your USDT to work with clarity.</h2>
          <p>
            Tether Link makes it easy to stake USDT with a fixed APY product and
            clear account information. This is a professional platform for users
            who want a simple staking experience backed by experienced market
            professionals.
          </p>

          <div className="pre-cta">
            <a className="btn btn-ghost" href="/how-it-works">
              Learn How It Works
            </a>
          </div>
        </div>
      </section>
      <section className="logo-marquee-section">
        <div className="logo-marquee">
          <h2>Widespread adoption</h2>
          <p>
            From being the first, to the most used, stablecoin, and one of the
            most traded tokens by volume, Tether tokens have come a long way.
            Tether tokens are today the most widely adopted stablecoins across
            major exchanges, OTC desks, and wallets, including:
          </p>
        </div>

        <div className="logo-marquee" aria-label="Trusted by major exchanges">
          <div className="marquee-track">
            {[
              { src: "/BitcoinVN.svg", alt: "BitcoinVN" },
              { src: "/xt.svg", alt: "XT" },
              { src: "/Coinstore.svg", alt: "Coinstore" },
              { src: "/hitbtc.svg", alt: "HitBTC" },
              { src: "/okcoin.svg", alt: "OKCoin" },
            ]
              .concat([
                { src: "/BitcoinVN.svg", alt: "BitcoinVN" },
                { src: "/xt.svg", alt: "XT" },
                { src: "/Coinstore.svg", alt: "Coinstore" },
                { src: "/hitbtc.svg", alt: "HitBTC" },
                { src: "/okcoin.svg", alt: "OKCoin" },
              ])
              .map((logo, index) => (
                <div key={`${logo.alt}-${index}`} className="logo-item">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={180}
                    height={56}
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ))}
          </div>
        </div>
      </section>

              <section className="faq-section">
          <h2>Frequently asked questions</h2>
          <div className="faq-accordion">
            
        
          
            <details className="faq-item">
              <summary>What fee does the platform charge?</summary>
              <p>Tether Link charges a 0.5% platform fee on withdrawals.</p>
            </details>
            <details className="faq-item">
              <summary>How does fixed APY work?</summary>
              <p>The APY is shown before you stake, and each product includes its duration and conditions.</p>
            </details>
           
          
            <details className="faq-item">
              <summary>When was Tether Link launched?</summary>
              <p>The platform launched in 2022.</p>
            </details>
            <details className="faq-item">
              <summary>What markets does Tether Link work with?</summary>
              <p>Capital may be allocated across BTC, ETH, gold, digital assets, selected meme coins, and emerging opportunities.</p>
            </details>
            <details className="faq-item">
              <summary>How does Tether Link manage capital?</summary>
              <p>A professional team studies market conditions and allocates capital with risk and opportunity in mind.</p>
            </details>
            <details className="faq-item">
              <summary>Is Tether Link safe?</summary>
              <p>The platform uses standard security controls and transparency. All investments carry risk and are not guaranteed.</p>
            </details>
            <details className="faq-item">
              <summary>How do I start staking?</summary>
              <p>Create an account, deposit USDT, choose a product, and confirm the terms before staking.</p>
            </details>
          </div>
        </section>

   
    </div>
  );
}

function FeatureCard({
  title,
  children,
  icon,
}: {
  title: string;
  children: any;
  icon?: string;
}) {
  return (
    <article
      style={{
        borderRadius: 12,
        padding: "1.25rem",
        background: "white",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.25rem",
          }}
        >
          {icon}
        </div>
        <h4 style={{ margin: 0 }}>{title}</h4>
      </div>
      <p style={{ marginTop: "0.75rem", color: "#475569" }}>{children}</p>
    </article>
  );
}
