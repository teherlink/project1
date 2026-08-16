import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';
import Script from 'next/script';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideFooter = router.pathname.startsWith('/app');

  return (
    <>
      <Head>
        <link rel="icon" href="/tether-usdt-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/tether-usdt-logo.png" type="image/png" />
        {/* Mobile viewport optimization */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        {/* Preload critical resources */}
        <link rel="preload" as="font" href="/fonts/inter.woff2" type="font/woff2" crossOrigin="anonymous" />
      </Head>

      {/* Google Analytics - Replace with your tracking ID */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* Structured data for search engines - Global org schema */}
      <Script
        type="application/ld+json"
        id="org-schema"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'Tether Link',
            url: 'https://tetherlink.io',
            logo: 'https://tetherlink.io/tether-usdt-logo.png',
            description: 'USDT staking platform with fixed APY and transparent fees',
            sameAs: [
              'https://twitter.com/tetherlink',
              'https://linkedin.com/company/tetherlink',
            ],
          }),
        }}
      />

      <Component {...pageProps} />
      {!hideFooter && <Footer />}
    </>
  );
}
