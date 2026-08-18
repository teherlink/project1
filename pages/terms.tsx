import Header from '../components/Header';
import Footer from '../components/Footer';
import SEOHead from '../components/SEOHead';
import { generateArticleSchema, generateBreadcrumbSchema, SITE_URL } from '../lib/seo';

export default function TermsPage() {
  const breadcrumbs = [
    { name: 'Home', url: SITE_URL },
    { name: 'Terms of Service', url: `${SITE_URL}/terms` },
  ];

  const schemaArticle = generateArticleSchema({
    title: 'Terms of Service | Tether Link',
    description: 'Review the complete terms of service for using Tether Link USDT staking platform.',
  });

  const schemaBreadcrumb = generateBreadcrumbSchema(breadcrumbs);

  return (
    <div className="page-shell">
      <SEOHead
        pathName="/terms"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [schemaArticle, schemaBreadcrumb],
        }}
      />
      <Header />

      <main className="page-content terms-content">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h1>Terms of Use</h1>

          <p>These Terms of Use (the "Terms" or the "Contract") govern the use of the <strong>Tether Link</strong> digital platform available on the Internet at <a href="https://tetherlink.io/">https://tetherlink.io/</a> website (the <strong>"Platform"</strong>) owned and operated by <strong>Tether Link</strong> (hereinafter referred to as the "Company", "we") including the website on the Internet, which provides access to the Platform, as well as any services of the Platform.</p>

          <p>These Terms are an offer, by accepting which the User agrees with the provisions contained therein. Acceptance is expressed in your confirmation of registration as a User of the Platform in accordance with these Terms.</p>

          <p>The Terms, together with the Risk Statement, Privacy Policy, and Cookie Policy, form a binding agreement (hereinafter referred to as the "Agreement") between the Company and you as a private user (hereinafter referred to as "you" or "User") for your individual use of the Platform. By registering as a User of the Platform, as well as using the Platform, you confirm your acceptance of the Agreement. If you do not agree with the Terms, Risk Statement, Privacy Policy, and Cookie Policy, you must immediately stop using the Platform.</p>

          <h2>1. DEFINITIONS</h2>
          <p><strong>1.1.</strong> Unless otherwise specified or the context suggests otherwise, all capitalized terms have the meaning given to them in these Terms and other documents making up the Agreement:</p>

          <p><strong>a. "Account"</strong> - an account created by a User who visited the Website and registered with the Company to use the Website and the Platform.</p>

          <p><strong>b. "Website"</strong> - the Company's website at <a href="https://tetherlink.io/">https://tetherlink.io/</a>, providing the User with access to the Platform.</p>

          <p><strong>c. "Platform"</strong> means a digital platform provided by the Company for access to its services and to initiate Transactions, including Transactions executed with Third-Party Service Providers.</p>

          <p><strong>d. "Digital Assets"</strong> means USDT, USDC, BTC, ETH, and other crypto or digital currencies.</p>

          <p><strong>e. "Fiat currencies"</strong> means USD, EUR, and other currencies whose value is provided by the states that issue them and are not digital assets.</p>

          <p><strong>f. "Public Authority"</strong> means any national or governmental authority, the authority of any province or state or any other administrative-territorial entity, or any legal entity, authority, or individual exercising legislative, judicial, regulatory or administrative functions.</p>

          <p><strong>g. "Personal data"</strong> - information transmitted by the User, which can directly or indirectly identify this User.</p>

          <p><strong>h. "Privacy Policy"</strong> - additional conditions that are an integral part of the Agreement and govern the collection, use and disclosure of Personal Data of each User.</p>

          <p><strong>i. "Risk Statement"</strong> - additional conditions that are an integral part of the Agreement and regulate the User's risks associated with the use of the Platform and the Company's responsibility for them.</p>

          <p><strong>j. "Service Notices"</strong> - means one-way notices sent by the Company via email. These notifications are sent to the User in relation to certain information or events related to the Account.</p>

          <p><strong>k. "Third-Party Service Provider"</strong> - means any third party (including exchanges, liquidity providers, custodians, or other service providers) whose services are accessed or used by the Company for the execution of Transactions using User Assets.</p>

          <p><strong>l. "Transaction"</strong> - means any operation, instruction, transfer, or other activity initiated by the User on or through the Platform in connection with the services. The User acknowledges and agrees that the Company may execute Transactions using User Assets strictly in accordance with User Instructions.</p>

          <p><strong>m. "User Assets"</strong> - means any fiat currency, Digital Assets, or other value transferred by the User to the Company and accepted by the Company, for the purpose of executing Transactions in accordance with these Terms.</p>

          <p><strong>n. "User Instructions"</strong> - means any explicit or implicit decision, election, selection, or instruction made by the User through the Platform interface or other functionality provided by the Company.</p>

          <p><strong>o. "User"</strong> - any person who has registered on the Website and created an Account to use the Website and have access to the Platform.</p>

          <p><strong>p. "User Credentials"</strong> - a set of User identifiers, passwords, and any other information provided to the User to access the Account and the Platform.</p>

          <h2>2. LEGAL CAPACITY AND USER REGISTRATION</h2>
          <p><strong>2.1.</strong> To access and use the Account and the Platform, you confirm that you are fully capable and competent to comply with the terms, conditions, obligations, representations, and warranties set forth in these Terms. You must register on the Website to create an Account and access the Platform; you agree to provide complete and accurate information when registering for such use and to keep this information up to date.</p>

          <p><strong>2.2.</strong> By accepting these Terms, the User enters into an Agreement with the Company and accepts the terms of all documents constituting the Agreement, including the following: Risk Statement, Privacy Policy, and Cookie Policy. These documents are available for review on the Website.</p>

          <p><strong>2.3.</strong> Acceptance of these Terms and the Agreement is expressed by confirming your registration on the Platform. By registering as a User of the Platform, you confirm your acceptance of the Agreement. If you do not agree with the Terms, you must immediately stop using the Platform.</p>

          <h2>3. SUBJECT OF THE AGREEMENT AND USER ACCOUNT</h2>
          <p><strong>3.1.</strong> The subject of the Terms is the conditions for the provision by the Company to the User of a digital platform that allows the User to transfer User Assets to the Company and to submit User Instructions via the Platform, under which the Company uses such User Assets strictly in accordance with the User Instructions for the execution of Transactions, for the purpose of enabling the User to pursue potential economic benefits or returns, subject to market risks and the User's own decisions.</p>

          <p><strong>3.2.</strong> The User agrees that the Platform enables the User to transfer User Assets to the Company and submit User Instructions via the Platform, and that the Company executes Transactions using such User Assets strictly in accordance with the User Instructions.</p>

          <p><strong>3.3.</strong> The Company does not provide investment advice, portfolio management, or discretionary asset management. Where the Company executes a Transaction via accounts maintained by the Company with Third-Party Service Providers, the User authorizes the Company to receive User Assets and to transmit, process, and implement the User's User Instructions for the purpose of executing such Transactions through the Platform, on a non-discretionary basis and strictly in accordance with the User Instructions.</p>

          <p><strong>3.4.</strong> In order to use the services of the Platform, you must register and create an Account on the Platform. Connection to the platform takes place after the registration and, where required by the Company, successful completion of the applicable verification procedures in accordance with the terms of these Terms.</p>

          <p><strong>3.5.</strong> The User has the right to withdraw funds from his Account on the Platform, including the accrued profit and the initial payment.</p>

          <p><strong>3.6.</strong> Withdrawal of funds from the Account is possible exclusively by the User and to the details of the User. When withdrawing funds, the User confirms that the wallet or account to which funds are withdrawn belongs to the User. In this case, the User bears all risks for such withdrawal of funds. The Company is not responsible to the User for the safety of funds in such a withdrawal.</p>

          <p><strong>3.7.</strong> The account is not a bank account or brokerage account, and the assets used in connection with the Platform do not constitute a deposit or any other financial product.</p>

          <p><strong>3.8.</strong> The User can replenish his Account by transferring fiat and digital (cryptocurrency) assets to it. There are no charges for funding an Account on the Platform. However, third parties may charge transaction fees or other fees.</p>

          <p><strong>3.9.</strong> You may withdraw all or some of the deposited funds from your Account on the Platform. Withdrawals may take up to 3 (three) days. However, any withdrawal of funds may be delayed by the Company as necessary in accordance with applicable law.</p>

          <h2>4. USER ACCESS TO THE ACCOUNT AND THE PLATFORM</h2>
          <p><strong>4.1.</strong> The User accesses the Platform using User Credentials. Such User Credentials are intended only for his access to the Account. To confirm registration and some actions on the Platform, we may use confirmation codes sent to the email address of the User.</p>

          <p><strong>4.2.</strong> Each User has the right to register on the Platform only one Account. Registering multiple Accounts is a violation of these Terms and may result in the immediate termination of these Terms and the relevant Accounts.</p>

          <p><strong>4.3.</strong> Each User acknowledges that each set of User Credentials is non-transferable and shall only be used by the User to whom it was issued. Such User Credentials shall not be disclosed or transferred to any third party without the written permission of the Company.</p>

          <p><strong>4.4.</strong> Each User must:</p>

          <p><strong>a.</strong> keep his / her Credentials in strict confidence and do not share them with third parties;</p>

          <p><strong>b.</strong> make all reasonable efforts to protect all records relating to its Credentials, including storing such records in a secure location;</p>

          <p><strong>c.</strong> take all reasonable steps to comply with the security instructions provided by the Company;</p>

          <p><strong>d.</strong> immediately notify the Company in the event of: (i) your loss of User Credentials; (ii) disclosure of your Credentials to third parties or if they have otherwise been compromised; (iii) If you have a reasonable suspicion of any unauthorized use of your Credentials;</p>

          <p><strong>e.</strong> create strong passwords (for example, using a combination of letters, numbers, and special characters).</p>

          <p><strong>4.5.</strong> You are responsible and liable for all actions taken by anyone who accesses the Platform using your Credentials. The Company is not liable for any losses that you may incur because of someone else using your Credentials or Account, with or without your knowledge.</p>

          <h2>5. PROHIBITED USE</h2>
          <p><strong>5.1.</strong> You must use the Website and the Platform solely in accordance with these Terms. You shall not sell, rent or otherwise provide access to the Website and the Platform to any third party.</p>

          <p><strong>5.2.</strong> You may not use the Website and Platform in any way that is illegal, discredits other persons, violates any copyright, trademark, or proprietary rights, restricts or prevents any other person from using the Platform, or disables or damages the Platform.</p>

          <h2>6. SAFETY</h2>
          <p><strong>6.1.</strong> While we take reasonable steps to protect the security and privacy of the Platform and your Personal Data in accordance with applicable law, we cannot guarantee the security of all transmissions. To the extent permitted by law, we will notify you of any unauthorized access or use of your Personal Information if we become aware of it.</p>

          <p><strong>6.2.</strong> Digital Assets are volatile and may result in partial or total loss. The Company does not guarantee any profit, yield, or outcome. The Company is not responsible for losses arising from market movements or from acts or omissions of Third-Party Service Providers, except to the extent caused by the Company's willful misconduct or gross negligence.</p>

          <h2>7. SERVICE NOTICES AND PERSONAL DATA</h2>
          <p><strong>7.1.</strong> You agree to receive notices regarding the Platform through Service Notices sent to your email address.</p>

          <p><strong>7.2.</strong> As part of the Platform, the User's Personal Data may be collected, used, transferred, disclosed, and otherwise processed by the Company in accordance with the Privacy Policy. You should read the Privacy Policy carefully before registering and using the Platform.</p>

          <p><strong>7.3.</strong> You agree to provide true, accurate, current, and complete Personal Data. You also agree to maintain and promptly update Personal Data to keep it true, accurate, current and complete.</p>

          <h2>8. INTELLECTUAL PROPERTY</h2>
          <p><strong>8.1.</strong> All title and intellectual property rights in and to the Website, the Platform, and the materials made available through them remain with the Company or its licensors. You agree not to copy, distribute, modify, or extract any materials or information posted on the Website without the permission of the Company.</p>

          <p><strong>8.2.</strong> You agree not to reverse engineer, decompile, or otherwise attempt to discover the source code of the Website, or misrepresent other sites as the Company's website by using visual or text elements from the Website.</p>

          <h2>9. CHANGES TO THE CONTRACT</h2>
          <p><strong>9.1.</strong> We reserve the right to modify, update, or change this Contract and other documents of the Agreement at any time. Any Changes may be posted on the Website or sent to you via email. You acknowledge your acceptance of any changes if you continue to use the Platform after such changes become effective.</p>

          <h2>10. SUSPENSION OR TERMINATION</h2>
          <p><strong>10.1.</strong> Access to the Platform may be suspended or terminated in whole or in part at any time either by the User or by us in accordance with the Terms. We reserve the right to suspend or terminate immediately and without notice any User access to or use of the Account and the Platform if you violate any provision of these Terms.</p>

          <p><strong>10.2.</strong> We may limit, suspend or terminate your Account if: (a) we believe it is necessary to protect the security of the Account; (b) if we become aware or suspect that the funds may be related to illegal activity; (c) we are unable to verify any information you provide; (d) we decide to cease operations; (e) we are directed by any Government agency; or (f) we otherwise decide that it is necessary to terminate or suspend the Account.</p>

          <h2>11. MISCELLANEOUS</h2>
          <p><strong>11.1.</strong> These Terms, together with the Privacy Policy and Risk Statement, constitute the entire and sole agreement between you and the Company with respect to the subject matter. If any provision is held to be unlawful or unenforceable, that provision shall be severable and shall not affect the validity of any remaining provisions.</p>

          <p><strong>11.2.</strong> The Company does not act as a party to any separate terms or agreements that may exist between you and a Third-Party Service Provider. Any such terms apply independently and govern only the relationship between you and the relevant Third-Party Service Provider.</p>

          <h2>12. GOVERNING LAW AND DISPUTES RESOLUTION</h2>
          <p><strong>12.1.</strong> These Terms and other documents constituting the User Agreement are governed by applicable law.</p>

          <p><strong>12.2.</strong> Any dispute arising in connection with or in relation to these Terms or the Platform shall be resolved by the parties through negotiations. If no agreement is reached, the dispute shall be resolved in accordance with applicable law and procedures.</p>

          <h2>13. CONTACT</h2>
          <p><strong>E-mail of the Company:</strong> <a href="mailto:admin@tetherlink.io">admin@tetherlink.io</a></p>
        </div>
      </main>

    </div>
  );
}
