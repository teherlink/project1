import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo">
            <img src="/tether-usdt-logo.svg" alt="Tether Link logo" />
          </div>
          <div>
            <strong>Tether Link</strong>
            <p>Stable USDT staking products with clear terms.</p>
          </div>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <h4>Product</h4>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/why-tether-link">Why Tether Link</Link>
            <Link href="/transparency">Transparency</Link>
          </div>
          <div className="footer-col">
            <h4>Legal</h4>
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/risk-statement">Risk Statement</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Tether Link</span>
        <div className="footer-social">
          <a href="#" aria-label="Twitter">Twitter</a>
          <a href="#" aria-label="Telegram">Telegram</a>
        </div>
      </div>
    </footer>
  );
}
