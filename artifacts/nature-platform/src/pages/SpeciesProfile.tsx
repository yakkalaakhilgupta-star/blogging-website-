import { useParams, Link } from "wouter";
import { useGetSpecies, getGetSpeciesQueryKey } from "@workspace/api-client-react";
import { ArrowLeft, ExternalLink, Leaf, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Helmet } from "react-helmet-async";

const statusColors: Record<string, string> = {
  LC: "bg-green-500 hover:bg-green-600 text-white",
  NT: "bg-yellow-500 hover:bg-yellow-600 text-white",
  VU: "bg-orange-500 hover:bg-orange-600 text-white",
  EN: "bg-red-500 hover:bg-red-600 text-white",
  CR: "bg-red-900 hover:bg-red-950 text-white",
  EX: "bg-gray-500 hover:bg-gray-600 text-white",
};

const statusNames: Record<string, string> = {
  LC: "Least Concern",
  NT: "Near Threatened",
  VU: "Vulnerable",
  EN: "Endangered",
  CR: "Critically Endangered",
  EX: "Extinct",
};

export default function SpeciesProfile() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";

  const { data: species, isLoading, error } = useGetSpecies(slug, {
    query: {
      enabled: !!slug,
      queryKey: getGetSpeciesQueryKey(slug),
    },
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background pt-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-4 w-24 mb-8" />
          <Skeleton className="h-16 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="aspect-video w-full mb-12 rounded-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
          <div className="space-y-4">
            {[1,2,3].map(i => <Skeleton key={i} className="h-4 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  if (error || !species) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="font-serif text-4xl font-bold mb-4">Species not found</h1>
          <p className="text-muted-foreground mb-8">The species profile you're looking for doesn't exist.</p>
          <Link href="/species"><Button variant="default">Back to all species</Button></Link>
        </div>
      </div>
    );
  }

  const funFacts = species.funFacts ? species.funFacts.split('\n').filter(f => f.trim().length > 0) : [];
  const statusName = species.conservationStatus ? statusNames[species.conservationStatus] : null;
  const pageTitle = `${species.commonName} (${species.scientificName})`;
  const pageDesc = species.description
    ? species.description.slice(0, 160) + "..."
    : `Learn about the ${species.commonName}, its conservation status, habitat, and fascinating facts.`;

  return (
    <>
      <Helmet>
        <title>{pageTitle} | The Verdant Page</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`${window.location.origin}/species/${species.slug}`} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        {species.imageUrl && <meta property="og:image" content={species.imageUrl} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        {species.imageUrl && <meta name="twitter:image" content={species.imageUrl} />}
      </Helmet>

      <article className="w-full bg-background pt-12 pb-32">
        <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center md:text-left">
          <div className="mb-8 flex justify-center md:justify-start">
            <Link href="/species" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to species
            </Link>
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-foreground mb-2">
                {species.commonName}
              </h1>
              <p className="text-2xl md:text-3xl text-muted-foreground italic mb-6">
                {species.scientificName}
              </p>
            </div>

            {species.conservationStatus && (
              <div className="flex flex-col items-center md:items-end gap-2 pb-2">
                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Conservation Status</span>
                <Badge className={`text-lg px-4 py-2 ${statusColors[species.conservationStatus] || "bg-secondary text-secondary-foreground"}`}>
                  {species.conservationStatus}{statusName ? ` — ${statusName}` : ""}
                </Badge>
              </div>
            )}
          </div>
        </header>

        {species.imageUrl && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
            <div className="aspect-[21/9] w-full overflow-hidden bg-muted relative">
              <img
                src={species.imageUrl}
                alt={species.commonName}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
            {species.kingdom && (
              <div className="bg-card border border-border p-4">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Kingdom</div>
                <div className="font-serif text-xl">{species.kingdom}</div>
              </div>
            )}
            {(species as any).class && (
              <div className="bg-card border border-border p-4">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Class</div>
                <div className="font-serif text-xl">{(species as any).class || "—"}</div>
              </div>
            )}
            {(species as any).order && (
              <div className="bg-card border border-border p-4">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Order</div>
                <div className="font-serif text-xl">{(species as any).order || "—"}</div>
              </div>
            )}
            {species.family && (
              <div className="bg-card border border-border p-4">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Family</div>
                <div className="font-serif text-xl">{species.family}</div>
              </div>
            )}
            {species.habitat && (
              <div className="bg-card border border-border p-4 col-span-2">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Habitat</div>
                <div className="font-sans text-foreground">{species.habitat}</div>
              </div>
            )}
            {species.geographicRange && (
              <div className="bg-card border border-border p-4 col-span-2">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Geographic Range</div>
                <div className="font-sans text-foreground">{species.geographicRange}</div>
              </div>
            )}
            {species.diet && (
              <div className="bg-card border border-border p-4 col-span-2 md:col-span-4">
                <div className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">Diet</div>
                <div className="font-sans text-foreground">{species.diet}</div>
              </div>
            )}
          </div>

          {species.description && (
            <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-h2:text-3xl max-w-none mb-16">
              <h2 className="mb-6">About {species.commonName}</h2>
              <div className="whitespace-pre-wrap font-sans text-foreground/90 leading-relaxed text-[17px] md:text-[19px]">
                {species.description}
              </div>
            </div>
          )}

          {funFacts.length > 0 && (
            <div className="mb-16">
              <h2 className="font-serif text-3xl mb-8 flex items-center">
                <Leaf className="h-6 w-6 mr-3 text-primary" />
                Fascinating Facts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {funFacts.map((fact, index) => (
                  <div key={index} className="bg-primary/5 border border-primary/20 p-6">
                    <p className="text-foreground/90 italic leading-relaxed">"{fact}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Species → Article cross-link (#17) */}
          {species.articleId && (
            <div className="mb-16 p-6 bg-card border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Featured In</p>
                <p className="font-serif text-lg text-foreground">This species is featured in an in-depth essay.</p>
              </div>
              <Link href={`/articles`}>
                <Button variant="outline" className="shrink-0">
                  <BookOpen className="h-4 w-4 mr-2" /> Read the Article
                </Button>
              </Link>
            </div>
          )}

          {species.iucnUrl && (
            <div className="flex justify-center border-t border-border pt-12">
              <a
                href={species.iucnUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-14 px-8 text-base font-medium transition-colors bg-card border border-border hover:bg-accent hover:text-accent-foreground hover:border-accent"
              >
                View on IUCN Red List <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </div>
          )}
        </div>
      </article>
    </>
  );
}
