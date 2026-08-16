import Head from 'next/head';
import { SEOMetadata, SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE, PAGES_SEO } from '../lib/seo';

interface SEOHeadProps extends Partial<SEOMetadata> {
  pathName?: string;
  children?: React.ReactNode;
}

export default function SEOHead({
  pathName,
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  structuredData,
  children,
}: SEOHeadProps) {
  // Try to get metadata from PAGES_SEO first
  const pageMetadata = pathName ? PAGES_SEO[pathName] : null;
  
  const finalTitle = title || pageMetadata?.title || `${SITE_NAME}`;
  const finalDescription = description || pageMetadata?.description || 'USDT staking platform with fixed APY and transparent fees';
  const finalKeywords = keywords || pageMetadata?.keywords || '';
  const finalOgImage = ogImage || pageMetadata?.ogImage || DEFAULT_OG_IMAGE;
  const finalOgType = ogType || pageMetadata?.ogType || 'website';
  const finalCanonicalUrl = canonicalUrl || (pathName ? `${SITE_URL}${pathName}` : SITE_URL);
  const finalStructuredData = structuredData || pageMetadata?.structuredData;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="30 days" />
      <meta name="author" content={SITE_NAME} />

      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={finalOgType} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={finalCanonicalUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalOgImage} />
      <meta property="twitter:creator" content="@tetherlink" />

      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#1a1a1a" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Structured Data (JSON-LD) */}
      {finalStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(finalStructuredData) }}
        />
      )}

      {/* Favicon and App Icons */}
      <link rel="icon" href="/tether-usdt-logo.png" type="image/png" />
      <link rel="apple-touch-icon" href="/tether-usdt-logo.png" type="image/png" />

      {/* Preload critical resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />

      {children}
    </Head>
  );
}
