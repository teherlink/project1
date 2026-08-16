// SEO utilities and metadata constants

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  structuredData?: any;
}

export const SITE_NAME = 'Tether Link';
export const SITE_DOMAIN = 'tetherlink.io';
export const SITE_URL = 'https://tetherlink.io';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export const PAGES_SEO: Record<string, SEOMetadata> = {
  '/': {
    title: 'USDT Staking Platform | Earn Fixed APY | Tether Link',
    description: 'Stake USDT and earn fixed APY with transparent fees. Simple staking platform with professional oversight, low minimums ($100), and clear withdrawal terms.',
    keywords: 'USDT staking, cryptocurrency staking, fixed APY, stake USDT, earn crypto, DeFi staking, Tether staking, crypto yields',
    ogType: 'website',
  },
  '/how-it-works': {
    title: 'How USDT Staking Works | Tether Link Guide',
    description: 'Learn how to stake USDT on Tether Link. Step-by-step guide: deposit, choose product, earn rewards, withdraw. Fixed APY products with clear terms.',
    keywords: 'how to stake USDT, staking guide, crypto staking tutorial, earn cryptocurrency, USDT yield farming, staking rewards',
    ogType: 'article',
  },
  '/why-tether-link': {
    title: 'Why Choose Tether Link | Safe USDT Staking',
    description: 'Discover why Tether Link is the best platform for USDT staking. Professional oversight, transparent fees (0.5%), experienced team, and simple interface.',
    keywords: 'best crypto staking, USDT staking platform, safe cryptocurrency staking, crypto earnings, professional staking service',
    ogType: 'article',
  },
  '/transparency': {
    title: 'Platform Transparency & Real-Time Metrics | Tether Link',
    description: 'View live platform metrics, verified deposits, and total assets. Transparent USDT staking with real-time data and verification.',
    keywords: 'cryptocurrency transparency, crypto proof of funds, DeFi transparency, blockchain verification, staking metrics',
    ogType: 'article',
  },
  '/privacy': {
    title: 'Privacy Policy | Tether Link',
    description: 'Read our privacy policy to understand how Tether Link collects, uses, and protects your personal data on our USDT staking platform.',
    keywords: 'privacy policy, data protection, GDPR, cryptocurrency privacy',
    ogType: 'website',
  },
  '/terms': {
    title: 'Terms of Service | Tether Link',
    description: 'Review the terms of service for using Tether Link USDT staking platform. Legal agreements and platform rules.',
    keywords: 'terms of service, platform rules, legal agreement',
    ogType: 'website',
  },
};

// Generate structured data (JSON-LD) for SEO
export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/tether-usdt-logo.png`,
    description: 'USDT staking platform with fixed APY, transparent fees, and professional oversight',
    sameAs: [
      'https://twitter.com/tetherlink',
      'https://linkedin.com/company/tetherlink',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@tetherlink.io',
      url: SITE_URL,
    },
  };
}

export function generateWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function generateBreadcrumbSchema(breadcrumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function generateArticleSchema(article: {
  title: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || DEFAULT_OG_IMAGE,
    datePublished: article.datePublished || new Date().toISOString(),
    dateModified: article.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
    },
  };
}

export function generateProductSchema(product: {
  name: string;
  description: string;
  apy: number;
  duration: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    offers: {
      '@type': 'Offer',
      price: 'Call for price',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: 4.8,
      ratingCount: 1000,
    },
  };
}
