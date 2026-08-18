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

      <main className="page-content privacy-content">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1>Privacy Policy</h1>
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Latest update: August 18, 2026</p>

          <p>This Privacy Policy (<strong>"Privacy Policy", "Policy"</strong>) governs the manner in which the <strong>Tether Link</strong> platform available on the Internet at <a href="https://tetherlink.io/">https://tetherlink.io/</a> owned and operated by <strong>Tether Link</strong> (hereinafter referred to as the <strong>"Company"</strong>) collects, uses and discloses information received from the User and about the User (hereinafter also – <strong>"You", "User"</strong>) when you visit and use the Website <a href="https://tetherlink.io/">https://tetherlink.io/</a> (hereinafter referred to as the <strong>"Website"</strong>), as well as your ability to control certain uses of this data.</p>

          <p>The Privacy Policy is an integral part of the Terms of Use of the Platform (the <strong>"Terms"</strong>). The Terms, together with the Risk Statement, Cookie Policy, and this Policy form a binding agreement (the <strong>"Agreement"</strong>) between the Company and you for your use of the Website. By registering as a User of the Platform or using the Website, you confirm that you have read this Policy. If you do not agree with the Terms, Cookie Policy, or this Policy, you must stop using the Website.</p>

          <h2>1. GENERAL PROVISIONS</h2>
          <p><strong>1.1.</strong> For the purposes of this Privacy Policy:</p>

          <p><strong>1.1.1. Website</strong> means the digital platform located at <a href="https://tetherlink.io/">https://tetherlink.io/</a>, providing the User with access to services, including staking and cryptocurrency transactions, and documentation such as this Privacy Policy.</p>

          <p><strong>1.1.2. Personal Data</strong> means any information relating to an identified or identifiable individual. It includes information provided directly by the User, such as name, date and place of birth, email address, telephone number, payment details and digital wallet details, as well as information collected automatically when the Website is used, including IP address, page URL and title, client and session identifiers, consent status, interaction events, screen resolution, language, browser, operating system and device information.</p>

          <h2>2. THE INFORMATION COMPANY COLLECTS</h2>
          <p><strong>2.1.</strong> The Company collects personal information about Users that is necessary to render the services. When using the services of the Company through the Website, the following information about the user can be requested and received:</p>

          <ul style={{ marginLeft: '20px' }}>
            <li>Full name</li>
            <li>Date of birth</li>
            <li>Email address</li>
            <li>Mobile phone number</li>
            <li>Payment card details and/or digital wallet details</li>
          </ul>

          <p><strong>2.2.</strong> The Company processes Personal Data for the following purposes: registering and authenticating Users; providing the Website and requested services; processing transactions and administering contracts; complying with legal and regulatory obligations; communicating with Users and providing support; preventing fraud and maintaining security; measuring Website use and performance; improving and developing services; and where the User has consented, analytics and advertising measurement.</p>

          <p><strong>2.3.</strong> When the Website is used, the Company and its approved service providers may automatically collect technical and interaction data through server logs, cookies and similar technologies. This may include IP address, page URL and title, client and session identifiers, consent status, page views, scrolling and engagement events, screen resolution, language, browser, operating system and device information.</p>

          <p><strong>2.4.</strong> The services available on this website are aimed at people aged 18 and over. We do not knowingly collect information from children, nor do we target our website to children. If you become aware that a child has provided us with personal information, please contact us at <a href="mailto:admin@tetherlink.io">admin@tetherlink.io</a>, and we will take steps to delete the information from our records.</p>

          <h2>3. ACCESS TO INFORMATION BY THIRD PARTIES</h2>
          <p><strong>3.1.</strong> The Company may disclose Personal Data to employees, agents, contractors, affiliated companies and external service providers only to the extent reasonably necessary for the purposes described in this Policy. Such recipients may include infrastructure, hosting, security, payment, compliance providers, customer support providers, and analytics providers.</p>

          <p><strong>3.2.</strong> Service providers acting as processors may use Personal Data only for the agreed purposes and subject to confidentiality and security obligations. Where a third-party provider acts as an independent controller, it processes Personal Data under its own privacy terms and applicable law.</p>

          <p><strong>3.3.</strong> Personal Data may be disclosed to third parties only where necessary and proportionate for providing requested services, complying with legal obligations, protecting legal rights, preventing fraud, and maintaining security.</p>

          <h2>4. DISCLOSURE OF PERSONAL INFORMATION</h2>
          <p><strong>4.1.</strong> The Company discloses Personal Data to third parties only where necessary and proportionate for one or more of the following purposes:</p>

          <p><strong>4.1.1. User agreements.</strong> Disclosure is necessary for you to use a particular service or to comply with a particular agreement with a User.</p>

          <p><strong>4.1.2. Legal requirements.</strong> Personal information may be disclosed if required by law or competent authorities.</p>

          <p><strong>4.1.3. Fraud detection and prevention.</strong> Personal information may be shared with law enforcement agencies for fraud prevention purposes.</p>

          <p><strong>4.1.4. Service operation and security.</strong> Disclosure may be necessary to host, maintain, secure and support the Website and to provide requested functionality.</p>

          <p><strong>4.2.</strong> Personal Data is processed only for the period necessary for the relevant purposes and in accordance with the retention rules in Section 7 of this Policy.</p>

          <p><strong>4.3.</strong> In case of loss or disclosure of your Personal Data, we will inform you about such loss or disclosure as required by applicable law.</p>

          <p><strong>4.4.</strong> We take necessary organizational and technical measures to protect your personal data from unauthorized or accidental access, destruction, modification, or distribution.</p>

          <h2>5. COOKIE FILES</h2>
          <p><strong>5.1.</strong> Cookies and similar technologies are small files or data that may store or access information on a User's device. They may collect Personal Data and technical information, including IP address, page URL and title, client and session identifiers, consent status, interaction events, screen resolution, language, browser, operating system and device information.</p>

          <p><strong>5.2.</strong> The Company uses Strictly Necessary Cookies without consent where they are required to operate and secure the Website, maintain sessions, and record the User's cookie consent choices. Functional Cookies are used to remember optional preferences and are activated only after the User provides consent.</p>

          <p><strong>5.3.</strong> Analytical and Marketing Cookies are disabled by default and are activated only after the User provides consent. The User may reject optional technologies or withdraw consent at any time.</p>

          <h2>6. USER'S RIGHTS</h2>
          <p><strong>6.1.</strong> Users have the following rights in relation to Personal Data, to the extent provided by applicable data protection laws:</p>

          <p><strong>6.1.1. Right of access.</strong> If you ask, the Company will confirm whether it processes your personal information and provide you with a copy within a reasonable timeframe. You will be provided with your personal information in a structured format.</p>

          <p><strong>6.1.2. Right to receive information.</strong> Users have the right to ask for confirmation as to whether Personal Data relating to them is being processed and to receive information about the purpose of processing, categories of data processed, and recipients of such data.</p>

          <p><strong>6.1.3. Right to rectification/amendment/deletion.</strong> If the personal information we hold about you is inaccurate or incomplete, you have the right to request its correction, amendment, or deletion.</p>

          <p><strong>6.1.4. Right of deletion.</strong> You can ask the Company to delete your personal information in cases where we no longer need it. You can make such request by email to <a href="mailto:admin@tetherlink.io">admin@tetherlink.io</a>.</p>

          <p><strong>6.1.5. Right to restrict data processing.</strong> You have the right to demand that we restrict processing in certain circumstances.</p>

          <p><strong>6.1.6. The right to object.</strong> Users have the right to object to the processing of personal data relating to them on the basis of applicable law.</p>

          <h2>7. TERM OF DATA STORAGE</h2>
          <p><strong>7.1.</strong> Personal Data is retained only for as long as reasonably necessary for the purposes for which it was collected, including providing services, maintaining security, complying with legal obligations, and resolving disputes. The Company applies documented retention periods based on the category of data, purpose of processing, and applicable legal requirements.</p>

          <p><strong>7.2.</strong> Withdrawal of consent stops future processing that relies on consent. It does not affect processing carried out before withdrawal or processing based on another lawful ground. Personal Data will be deleted or anonymized when no longer required.</p>

          <h2>8. PROTECTION OF PERSONAL INFORMATION</h2>
          <p><strong>8.1.</strong> The Company takes necessary organizational and technical measures to protect your personal information from unauthorized or accidental access, destruction, alteration, blocking, copying, distribution, or other unauthorized access.</p>

          <p><strong>8.2.</strong> The Company restricts access to Personal Data to authorized employees, agents, contractors and service providers who require access for legitimate business purposes. Such recipients are subject to appropriate security and data protection obligations.</p>

          <h2>9. LEGAL INFORMATION</h2>
          <p><strong>9.1.</strong> This Privacy Policy is subject to applicable law.</p>

          <p><strong>9.2.</strong> If any provision of this Policy is held invalid or unenforceable, the remainder of the Policy shall remain in full force and effect.</p>

          <p><strong>9.3.</strong> All disputes arising between the User and Company in relation to this Policy shall be settled by negotiation. In case of failure to resolve disputes through negotiations, the dispute shall be resolved in accordance with applicable law.</p>

          <p><strong>9.4.</strong> We may need to collect and use personal information to comply with legal obligations. This includes undertaking client due diligence and background checks as well as all other anti-money laundering and counter-terrorist financing obligations.</p>

          <h2>10. AMENDMENTS TO THE PRIVACY POLICY</h2>
          <p><strong>10.1.</strong> Company may update and amend the provisions of this Policy at any time. A new version of this Policy will take effect at the time of posting.</p>

          <p><strong>10.2.</strong> Continued use of the Website after an updated Policy is posted constitutes acknowledgement of the updated Policy.</p>

          <p><strong>10.3.</strong> The Company recommends you check this Privacy Policy on a regular basis to review the most current version. The Company is not responsible if you have not read the new terms of the Privacy Policy.</p>

          <h2>11. CONTACT</h2>
          <p><strong>E-mail of the Company:</strong> <a href="mailto:admin@tetherlink.io">admin@tetherlink.io</a></p>
        </div>
      </main>

    </div>
  );
}
