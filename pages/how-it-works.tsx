import Header from '../components/Header';

export default function HowItWorksPage() {
  return (
    <div className="page-shell">
      <Header />

      <main className="page-content how-page-content">
        <section className="how-hero">
          <div className="how-hero-copy">
            <h1>What is Tether Link and how does staking work?</h1>
          </div>
          <div className="how-hero-visual" aria-hidden="true">
            <div className="how-hero-circle">
              <div className="how-hero-center">
                <img src="/tether-usdt-logo.svg" alt="Tether" />
              </div>
              <div className="how-hero-shape shape-1"></div>
              <div className="how-hero-shape shape-2"></div>
              <div className="how-hero-shape shape-3"></div>
            </div>
          </div>
        </section>

        <section className="how-card-section">
          <div className="how-card">
            <p className="how-card-lead">Tether Link is a USDT staking platform that offers fixed APY products and active capital management. We aim to make staking clear and easy to understand.</p>
            <p>The platform displays the APY, duration and withdrawal terms for each product before you stake. You choose the product that fits your goals, and the team manages the underlying capital.</p>
            <p>We focus on transparency: fees are shown up front, and account activity is available in your dashboard.</p>
          </div>
        </section>

        <section className="how-split-feature">
          <div className="how-split-left">
            <div className="how-split-shape">
              <div className="how-split-icon">$</div>
            </div>
          </div>
          <div className="how-split-right">
            <h2>Simple steps. Clear terms.</h2>
            <p>Use Tether Link to stake USDT in a few easy steps: open an account, deposit USDT, choose a fixed-APY product, and track your earnings in the dashboard.</p>
          </div>
        </section>

        <section className="how-teal-block">
          <div className="">
            <h2>Fixed APY products</h2>
            <p>Each product shows the fixed APY and the product duration. </p>
          </div>
        </section>

        <section className="how-steps-section">
          <h2 className="how-steps-title">From deposit to withdrawal — the flow</h2>
          <div className="how-steps">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Deposit</h3>
              <p>Deposit USDT to the wallet address assigned to your account. We show supported networks and a clear QR/address for each.</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Choose a product</h3>
              <p>Pick a fixed APY product. Each product displays APY, duration, and explicit withdrawal rules so you can compare options.</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Staking & earning</h3>
              <p>When funds are staked, they are managed per the product terms. Earnings accrue at the stated APY and are visible in your dashboard.</p>
            </div>

            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Withdraw</h3>
              <p>Request a withdrawal according to the product terms. We show any fees and processing times before you confirm.</p>
            </div>
          </div>
        </section>

      
      </main>
    </div>
  );
}
