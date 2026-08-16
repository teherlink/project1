import '../styles/globals.css';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Footer from '../components/Footer';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const hideFooter = router.pathname.startsWith('/app');

  return (
    <>
      <Head>
        <link rel="icon" href="/tether-usdt-logo.png" type="image/png" />
      </Head>
      <Component {...pageProps} />
      {!hideFooter && <Footer />}
    </>
  );
}
