import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { generateArticleSchema, generateBreadcrumbSchema, SITE_URL } from '../lib/seo';

export default function RiskStatementPage() {
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Risk Statement', url: `${SITE_URL}/risk-statement` },
  ];

  const schemaArticle = generateArticleSchema({
    title: 'Risk Statement | Tether Link',
    description: 'Important risk disclosure for Tether Link USDT staking platform. Understand the risks involved in cryptocurrency staking and digital asset transactions.',
  });

  const schemaBreadcrumb = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="page-shell">
      <SEOHead
        pathName="/risk-statement"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [schemaArticle, schemaBreadcrumb],
        }}
      />
      <Header />

      <main className="page-content risk-statement-content">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1>Risk Statement</h1>
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>When using the Tether Link Digital Platform</p>
          <p style={{ color: '#64748b', fontStyle: 'italic' }}>Latest update: August 18, 2026</p>

          <p><strong>Tether Link</strong> (hereinafter referred to as the "Company"), provides services to provide a digital platform for staking and transacting in fiat and digital (cryptocurrency) assets on the <a href="https://tetherlink.io/">https://tetherlink.io/</a> website (<strong>"Website"</strong>).</p>

          <p>This Risk Statement (hereinafter referred to as the "Regulation") when using the <strong>Tether Link</strong> digital platform (hereinafter referred to as the "Platform") is an integral part of the Terms and Conditions of the <strong>Tether Link</strong> digital platform (hereinafter referred to as the "Terms"). The Terms, together with the Privacy Policy, Cookie Policy, and this Regulation form a binding agreement (hereinafter referred to as the "Agreement") between the Company and you, as a private user (hereinafter referred to as "you", "your" or "User") for your individual use of the Platform. By registering as a User of the Platform, as well as using the Platform, you confirm your acceptance of the Agreement. If you do not agree with this Regulation, the Terms and Conditions of the Platform, Cookie Policy, or Privacy Policy, you must immediately stop using the Platform.</p>

          <h2>1. INVESTMENT AND STAKING RISKS</h2>
          <p><strong>1.1.</strong> Staking through the Tether Link Platform involves the use of the Platform by the User for the purpose of executing Transactions by the Company using User Assets transferred to and accepted by the Company, strictly in accordance with the User Instructions. The Company does not provide investment advice, does not manage User Assets on a discretionary basis, and does not guarantee any economic outcome. The Company is not responsible for possible errors, failures, or disruptions associated with the operation of Third-Party Service Providers through which Transactions are executed.</p>

          <p><strong>1.2.</strong> The Company does not provide a guarantee of the stated profitability in the future. The stated returns were determined based on the average results of previous periods. Past performance is not indicative of future results.</p>

          <p><strong>1.3.</strong> All decisions regarding the use of User Assets and the submission of User Instructions must be made by the User independently, without pressure from interested parties, in accordance with the User's own goals and capabilities. The Company does not influence, determine, recommend, or facilitate such decisions, nor does it provide investment advice in any form.</p>

          <p><strong>1.4.</strong> Staking and investments in fiat and digital (cryptocurrency) assets through the use of the Platform are associated with risks of non-receipt of the profitability declared and expected by the User in full, as well as risks of partial or complete loss of the amount of invested funds associated with market changes, regulatory changes, and platform risks.</p>

          <p><strong>1.5.</strong> The information posted on the Company's Website, including any descriptions of Platform functionality or available Transaction structures, does not constitute investment advice, recommendations, or a guide to action and does not imply any coercion to use User Assets in a particular manner.</p>

          <p><strong>1.6.</strong> The decision to stake User Assets or to submit User Instructions through the Platform is made by the User independently. Any structured combinations of Transactions or placement options made available through the Platform are not individual investment programs and do not constitute discretionary asset management or portfolio management by the Company.</p>

          <p><strong>1.7.</strong> By registering as a User of the Platform, you acknowledge and accept all risks referred to in this section of the Regulation and relieve the Company of liability for such risks.</p>

          <h2>2. CRYPTOCURRENCY AND DIGITAL ASSET RISKS</h2>
          <p><strong>2.1.</strong> Digital Assets such as USDT, USDC, BTC, and ETH are volatile and subject to rapid price fluctuations. The value of Digital Assets can decrease significantly and suddenly, resulting in substantial losses.</p>

          <p><strong>2.2.</strong> Cryptocurrency markets operate 24/7 and are subject to extreme volatility. Market prices are influenced by various factors including technological developments, regulatory changes, macroeconomic conditions, and market sentiment, any of which can cause sudden and significant price movements.</p>

          <p><strong>2.3.</strong> Regulatory uncertainty and changes in laws affecting cryptocurrency and digital assets in various jurisdictions may adversely affect the value and functionality of Digital Assets and the Platform.</p>

          <p><strong>2.4.</strong> Staking involves locking your Digital Assets for a specified period. During this period, you may not have access to your funds, and you cannot respond to market changes or liquidate your position quickly.</p>

          <p><strong>2.5.</strong> Smart contract risks: The Platform may utilize smart contracts and blockchain technology. Bugs, vulnerabilities, or failures in smart contracts could result in loss of funds or failure to receive expected returns.</p>

          <p><strong>2.6.</strong> Exchange and counterparty risks: The Platform may utilize Third-Party Service Providers, exchanges, and custodians. Failure, hacking, insolvency, or misconduct by these parties could result in partial or total loss of your funds.</p>

          <h2>3. TECHNICAL RISKS OF THE PLATFORM</h2>
          <p><strong>3.1.</strong> We do not guarantee that all or any part of the Platform will be maintained at any time to be accessible and usable.</p>

          <p><strong>3.2.</strong> The use of the Platform is fraught with risks, including:</p>

          <p><strong>a.</strong> Disclosure of your Personal Data or other information;</p>

          <p><strong>b.</strong> System failures, security restrictions, unauthorized removal of restrictions on use on your device, as well as other violations that may make use impossible; and</p>

          <p><strong>c.</strong> Abuse through manipulation with malware or unauthorized use, including loss or theft of the User's device used to access the Website or the Platform.</p>

          <p><strong>3.3.</strong> We have the right to block or disable the use of the Website if the security features of your device have been compromised (for example, a device that has been "jailbroken" or "rooted"). We do not guarantee functioning on devices that have been modified or do not meet technical requirements.</p>

          <p><strong>3.4.</strong> Each User acknowledges and accepts the risks arising from Internet transactions conducted through open systems. Despite data encryption, connection to the Platform from your personal computer or electronic mobile device via the Internet may be visible to other persons.</p>

          <p><strong>3.5.</strong> We exclude liability for loss or damage caused by transmission errors, technical failures, breakdowns, interruptions, or tampering with the transmission network, IT systems, or any third-party systems.</p>

          <p><strong>3.6.</strong> We may use technologies, services, or authentication or verification measures including multi-factor authentication or biometric information. There is no guarantee that such technologies will be completely secure or successful in preventing unauthorized access or identity theft.</p>

          <p><strong>3.7.</strong> While we take reasonable steps to protect the security and privacy of the Platform and your Personal Data, we cannot guarantee the security of all transmissions or any network storing your information. We will notify you of unauthorized access if we become aware of it, and you are responsible for immediately changing your credentials.</p>

          <p><strong>3.8.</strong> To the maximum extent permitted by law, we and any third party shall not be liable for:</p>

          <ul style={{ marginLeft: '20px' }}>
            <li>Use or misuse of or inability to use the Platform, whether damages are direct, indirect, special, incidental, or consequential;</li>
            <li>Loss of trading profits, information, business interruption, or lost data;</li>
            <li>Any liability under contract, negligence, strict liability, or other liability arising from the Platform or any account on the Platform.</li>
          </ul>

          <p><strong>3.9.</strong> We are not responsible for failure to perform obligations due to events beyond our control, including but not limited to:</p>

          <ul style={{ marginLeft: '20px' }}>
            <li>Bank failures, cryptocurrency market collapses or fluctuations</li>
            <li>Government or regulatory restrictions or changes in legislation</li>
            <li>Natural disasters, war, civil commotions, strikes</li>
            <li>Technical failures, hacking, or infrastructure failures</li>
            <li>Power outages, internet outages, or other events beyond our control</li>
          </ul>

          <p><strong>3.10.</strong> In no event shall our liability exceed the highest aggregate amount paid by you to us in connection with your use of the Platform.</p>

          <h2>4. LIQUIDITY RISKS</h2>
          <p><strong>4.1.</strong> Staking requires locking your Digital Assets for specified periods. You may not be able to withdraw your funds immediately, and liquidity may be limited or unavailable during certain market conditions.</p>

          <p><strong>4.2.</strong> In extreme market conditions or during platform maintenance, withdrawal requests may be delayed or temporarily suspended.</p>

          <h2>5. TAX AND REGULATORY RISKS</h2>
          <p><strong>5.1.</strong> Users are responsible for understanding and complying with all applicable tax obligations in their jurisdiction related to staking and cryptocurrency transactions. The Company does not provide tax advice.</p>

          <p><strong>5.2.</strong> Regulatory treatment of cryptocurrency and staking may vary by jurisdiction and change over time. Changes in regulation could adversely affect your staking rewards or the value of your Digital Assets.</p>

          <h2>6. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
          <p><strong>6.1.</strong> This Regulation and the Terms are governed by applicable law.</p>

          <p><strong>6.2.</strong> Any dispute arising in connection with this Regulation, the Terms, Cookie Policy, and Privacy Policy is resolved by the parties through negotiations. If no agreement is reached, disputes shall be resolved in accordance with applicable law.</p>

          <h2>7. OTHER PROVISIONS</h2>
          <p><strong>7.1.</strong> This Regulation, the Terms, Cookie Policy, and Privacy Policy constitute the entire agreement between you and the Company with respect to the Platform and supersede all prior agreements, representations, and warranties. If any provision is found to be unlawful or unenforceable, that provision shall be severable and shall not affect the validity of remaining provisions.</p>

          <p><strong>7.2.</strong> These documents cannot be changed, canceled, or modified except as provided by the Company. No rights, obligations, or remedies may be granted, transferred, or sublicensed without our prior written consent.</p>

          <h2>8. CRYPTOCURRENCY INVESTMENT DISCLAIMER</h2>
          <p style={{ backgroundColor: '#fff3cd', border: '1px solid #ffc107', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
            <strong>IMPORTANT DISCLAIMER:</strong>
          </p>

          <p><strong>Staking and cryptocurrency investments are HIGH-RISK activities. By using Tether Link, you acknowledge and accept the following:</strong></p>

          <ul style={{ marginLeft: '20px' }}>
            <li><strong>No Guarantees:</strong> Past performance does not guarantee future results. The Company makes no guarantees regarding profitability, returns, or the preservation of capital.</li>
            <li><strong>Total Loss Risk:</strong> You may lose your entire investment. Do not invest money you cannot afford to lose.</li>
            <li><strong>No Insurance:</strong> Your Digital Assets are not insured by any government insurance scheme or the Company. Loss of funds is final and irreversible.</li>
            <li><strong>Volatile Markets:</strong> Cryptocurrency markets are highly volatile. Prices can change dramatically in short periods.</li>
            <li><strong>Not Investment Advice:</strong> Nothing on this Platform constitutes investment advice, financial advice, or a recommendation to buy or sell Digital Assets.</li>
            <li><strong>Regulatory Uncertainty:</strong> Cryptocurrency regulations are evolving. Changes in laws may negatively impact your investment.</li>
            <li><strong>Technical Risks:</strong> The Platform may experience downtime, hacking, or technical failures beyond our control.</li>
            <li><strong>Do Your Own Research:</strong> You are solely responsible for researching and understanding the risks before using this Platform.</li>
            <li><strong>Consult Professionals:</strong> Consult with qualified financial, legal, and tax professionals before making investment decisions.</li>
          </ul>

          <h2>9. CONTACT</h2>
          <p>Should you have any questions or queries about the risks, we would be happy to provide a consultation through our email:</p>

          <p><strong>E-mail of the Company:</strong> <a href="mailto:admin@tetherlink.io">admin@tetherlink.io</a></p>
        </div>
      </main>

    </div>
  );
}
