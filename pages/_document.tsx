import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx: any) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Web App Manifest for PWA support and mobile optimization */}
          <link rel="manifest" href="/manifest.json" />
          
          {/* Preconnect to external resources for performance */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          
          {/* DNS Prefetch for third-party services */}
          <link rel="dns-prefetch" href="https://cdn.example.com" />
          
          {/* Charset and viewport handled by Next.js but explicit for clarity */}
          <meta charSet="utf-8" />
          
          {/* Additional security headers */}
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
          
          {/* Apple-specific meta tags */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Tether Link" />
          
          {/* Microsoft specific */}
          <meta name="msapplication-TileColor" content="#1a1a1a" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
