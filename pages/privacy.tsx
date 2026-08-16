import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { generateArticleSchema, generateBreadcrumbSchema, SITE_URL } from '../lib/seo';

export default function PrivacyPage() {
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Privacy Policy', url: `${SITE_URL}/privacy` },
  ];

  const schemaArticle = generateArticleSchema({
    title: 'Privacy Policy | Tether Link',
    description: 'Read our comprehensive privacy policy to understand how Tether Link collects, uses, and protects your personal data.',
  });

  const schemaBreadcrumb = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="page-shell">
      <SEOHead
        pathName="/privacy"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [schemaArticle, schemaBreadcrumb],
        }}
      />
      <Header />

      <main className="page-content">
        <h1>Privacy Policy</h1>

        <p>This Privacy Policy explains what personal information we collect, how we use it, and your choices regarding that information when using Tether Link.</p>

        <h2>Information We Collect</h2>
        <p>We collect information you provide when creating an account, transactional data (deposits, withdrawals), and usage information from your interactions with the platform.</p>

        <h2>How We Use Information</h2>
        <p>We use collected data to provide and improve our services, verify deposits, process transactions, comply with legal obligations, and for fraud prevention and security.</p>

        <h2>Sharing and Third Parties</h2>
        <p>We may share information with service providers who support our operations, and when required by law. We do not sell personal data.</p>

        <h2>Security</h2>
        <p>We use industry-standard measures to protect data, but no system is completely secure. Follow best practices for account security, including using strong passwords and guarding credentials.</p>

        <h2>Your Rights</h2>
        <p>Depending on your jurisdiction, you may have rights to access, correct or delete your personal data. Contact our support team for requests.</p>

        <h2>Contact</h2>
        <p>For privacy questions contact privacy@tetherlink.example (replace with actual contact in production).</p>
      </main>

      
    </div>
  );
}
