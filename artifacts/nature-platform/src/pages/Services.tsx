import { Helmet } from "react-helmet-async";
import { CheckCircle2, Feather, Newspaper, Lightbulb, GraduationCap, Send } from "lucide-react";
import { Link } from "wouter";

export default function Services() {
  const services = [
    {
      title: "Feature Articles",
      description: "In-depth, rigorously researched narrative features for magazines and digital publications. Specializing in ecology, wildlife biology, and conservation stories that resonate emotionally.",
      icon: Newspaper,
    },
    {
      title: "Scientific Communication",
      description: "Translating complex research into accessible, engaging narratives for general audiences. Perfect for research institutions, universities, and environmental NGOs.",
      icon: Lightbulb,
    },
    {
      title: "Educational Content",
      description: "Curriculum materials, museum exhibition copy, and interpretive signage that brings natural history to life for learners of all ages.",
      icon: GraduationCap,
    },
    {
      title: "Brand Content & Copywriting",
      description: "Purpose-driven storytelling for sustainable brands, eco-tourism operations, and outdoor companies that need their voice to reflect their values.",
      icon: Feather,
    },
    {
      title: "Email Newsletters",
      description: "Engaging recurring content for organizations looking to build loyal audiences around environmental topics and sustainability.",
      icon: Send,
    }
  ];

  return (
    <div className="w-full bg-background pt-12 pb-32">
      <Helmet>
        <title>Writing Services – The Verdant Page</title>
        <meta name="description" content="Freelance nature writing services: feature articles, scientific communication, educational content, and consulting." />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Writing Services – The Verdant Page" />
        <meta property="og:description" content="Freelance nature writing services: feature articles, scientific communication, educational content, and consulting." />
        <link rel="canonical" href={`${window.location.origin}/services`} />
        <meta property="og:url" content={`${window.location.origin}/services`} />
        <meta property="og:image" content={`${window.location.origin}/opengraph.jpg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Writing Services – The Verdant Page" />
        <meta name="twitter:description" content="Freelance nature writing services: feature articles, scientific communication, educational content, and consulting." />
        <meta name="twitter:image" content={`${window.location.origin}/opengraph.jpg`} />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ProfessionalService",
          "name": "The Verdant Page – Writing Services",
          "url": `${window.location.origin}/services`,
          "description": "Freelance nature writing services: feature articles, scientific communication, educational content, and consulting.",
          "areaServed": "Worldwide",
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Writing Services",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Feature Articles", "description": "In-depth, rigorously researched narrative features for magazines and digital publications." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Scientific Communication", "description": "Translating complex research into accessible, engaging narratives for general audiences." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Educational Content", "description": "Curriculum materials, museum exhibition copy, and interpretive signage that brings natural history to life." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Brand Content & Copywriting", "description": "Purpose-driven storytelling for sustainable brands, eco-tourism operations, and outdoor companies." } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Email Newsletters", "description": "Engaging recurring content for organizations building loyal audiences around environmental topics." } }
            ]
          }
        })}</script>
      </Helmet>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-24">
          <h1 className="font-serif text-5xl md:text-6xl text-foreground mb-6 tracking-tight">Services & Offerings</h1>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Professional writing and communication services connecting complex ecological science with human stories. I help publications, organizations, and brands tell true stories about the natural world.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 mb-32">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="flex flex-col">
                <div className="h-14 w-14 bg-primary/10 flex items-center justify-center mb-6 border border-primary/20">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-medium mb-4 text-foreground">{service.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>

        {/* Approach Section */}
        <div className="bg-card border border-border p-8 md:p-16 max-w-5xl mx-auto mb-24">
          <h2 className="font-serif text-3xl md:text-4xl mb-8">The Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-lg">Scientific Rigor</h4>
                  <p className="text-muted-foreground mt-1">Every piece is thoroughly researched, utilizing peer-reviewed literature and expert interviews.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-lg">Narrative Drive</h4>
                  <p className="text-muted-foreground mt-1">Information is carried by story. Character, setting, and plot are as important as data.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-lg">Field-Tested</h4>
                  <p className="text-muted-foreground mt-1">Whenever possible, reporting happens on the ground, in the environments being written about.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-foreground text-lg">Reliable Delivery</h4>
                  <p className="text-muted-foreground mt-1">Clean copy, properly formatted, delivered on or before deadline. Every time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-serif text-4xl mb-6">Have a project in mind?</h2>
          <p className="text-xl text-muted-foreground mb-10">
            Whether you need a 5,000-word magazine feature or clear copy for your organization's website, I'd love to hear about what you're building.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center h-14 px-10 text-base font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            Get in touch
          </Link>
        </div>

      </div>
    </div>
  );
}
