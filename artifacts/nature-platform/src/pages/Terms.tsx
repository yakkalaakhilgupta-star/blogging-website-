import { Helmet } from "react-helmet-async";

export default function Terms() {
  const lastUpdated = "3 May 2026";

  return (
    <>
      <Helmet>
        <title>Terms of Service | The Verdant Page</title>
        <meta name="description" content="Terms of Service for The Verdant Page — the rules that govern use of this site." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="w-full bg-background pt-16 pb-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-3">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mb-12">Last updated: {lastUpdated}</p>

          <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-base leading-relaxed">
            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">1. Acceptance of terms</h2>
              <p>By accessing or using The Verdant Page ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">2. Use of the Site</h2>
              <p>You may use the Site for personal, non-commercial purposes. You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Reproduce, republish, or redistribute any content without prior written permission.</li>
                <li>Use automated tools to scrape, crawl, or harvest content or data at scale.</li>
                <li>Submit false, misleading, or harmful information through any form on the Site.</li>
                <li>Attempt to gain unauthorised access to any part of the Site or its infrastructure.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">3. Intellectual property</h2>
              <p>All articles, essays, photographs, and other content published on the Site are the intellectual property of The Verdant Page and its author unless otherwise stated. Short quotations with attribution are permitted for journalistic or educational purposes. All other use requires explicit written consent.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">4. Newsletter</h2>
              <p>By subscribing to our newsletter you consent to receive periodic emails about new content and updates. You may unsubscribe at any time using the link included in every email. We will process your data in accordance with our <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">5. Third-party links</h2>
              <p>The Site may contain links to external websites. These links are provided for convenience only. We have no control over the content of those sites and accept no responsibility for them or for any loss or damage that may arise from your use of them.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">6. Disclaimer of warranties</h2>
              <p>The Site and its content are provided "as is" without warranty of any kind. We make no representations that the content is accurate, complete, or up to date, though we strive to ensure it is. Scientific information evolves — always consult primary sources for research purposes.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">7. Limitation of liability</h2>
              <p>To the fullest extent permitted by law, The Verdant Page shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Site or reliance on any content published here.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">8. Governing law</h2>
              <p>These Terms are governed by and construed in accordance with applicable law. Any disputes shall be resolved in the courts of the jurisdiction in which the author is based.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">9. Changes to these terms</h2>
              <p>We reserve the right to modify these Terms at any time. The "Last updated" date at the top of this page reflects the most recent revision. Continued use of the Site after changes are posted constitutes your acceptance of the new Terms.</p>
            </section>

            <section>
              <h2 className="font-serif text-2xl font-semibold mb-3">10. Contact</h2>
              <p>Questions about these Terms? Email <a href="mailto:hello@theverdantpage.com" className="text-primary hover:underline">hello@theverdantpage.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
