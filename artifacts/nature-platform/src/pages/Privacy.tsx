import { Helmet } from "react-helmet-async";

export default function Privacy() {
  const lastUpdated = "3 May 2026";

  return (
    <>
      <Helmet>
        <title>Privacy Policy | The Verdant Page</title>
        <meta name="description" content="Privacy Policy for The Verdant Page — how we collect, use, and protect your data." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full bg-background pt-16 pb-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-base leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">1. Who we are</h2>
              <p>The Verdant Page is a nature writing platform operated by its author. If you have any questions about this policy, contact us at <a href="mailto:hello@theverdantpage.com" className="text-primary hover:underline">hello@theverdantpage.com</a>.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">2. What data we collect</h2>
              <p>We collect only the minimum data necessary to provide our services:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li><strong>Newsletter subscriptions:</strong> your email address, subscription date, and confirmation status.</li>
                <li><strong>Contact form submissions:</strong> your name, email address, and message content.</li>
                <li><strong>Analytics:</strong> page URLs visited, referrer, browser user-agent, and IP address (anonymised). We do not use third-party tracking cookies.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">3. How we use your data</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>To send you the newsletter you subscribed to, and transactional emails (welcome, confirmation, unsubscribe).</li>
                <li>To respond to your contact form enquiries.</li>
                <li>To understand which content resonates with readers, so we can improve the site.</li>
              </ul>
              <p className="mt-2">We do not sell, rent, or share your personal data with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">4. Email service provider</h2>
              <p>Newsletters and transactional emails are sent via <strong>Resend</strong> (resend.com). Your email address is shared with Resend solely to deliver emails on our behalf. Resend acts as a data processor under our instructions and is bound by appropriate data processing agreements.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">5. Cookies and local storage</h2>
              <p>We use browser <strong>localStorage</strong> (not cookies) to store your cookie consent preference and any reading-list bookmarks you save. No data is sent to our servers from localStorage. We do not serve advertising cookies or third-party tracking scripts.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">6. Data retention</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>Newsletter subscribers: retained until you unsubscribe.</li>
                <li>Contact form messages: retained for up to 12 months, then deleted.</li>
                <li>Analytics data: retained for up to 24 months in aggregate form.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">7. Your rights</h2>
              <p>Depending on your jurisdiction you may have the right to access, correct, or delete your personal data. To exercise any of these rights, email <a href="mailto:hello@theverdantpage.com" className="text-primary hover:underline">hello@theverdantpage.com</a> and we will respond within 30 days.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">8. Changes to this policy</h2>
              <p>We may update this policy from time to time. The "Last updated" date at the top of this page will always reflect the most recent revision. Continued use of the site after changes are posted constitutes acceptance of the updated policy.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
