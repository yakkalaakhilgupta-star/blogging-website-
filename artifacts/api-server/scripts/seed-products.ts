import { getUncachableStripeClient } from "../src/stripeClient";

/**
 * Creates The Verdant Page membership products in Stripe.
 * Run once after connecting the Stripe integration:
 *   pnpm --filter @workspace/api-server exec tsx scripts/seed-products.ts
 *
 * Safe to run multiple times — skips creation if products already exist.
 */
async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log("Checking for existing membership products…");
  const existing = await stripe.products.search({
    query: "name:'Verdant Page Membership' AND active:'true'",
  });

  if (existing.data.length > 0) {
    console.log("Membership product already exists — skipping creation.");
    const prices = await stripe.prices.list({
      product: existing.data[0].id,
      active: true,
    });
    console.log("Existing prices:");
    for (const p of prices.data) {
      console.log(
        `  ${p.id}  ${p.unit_amount} ${p.currency.toUpperCase()}/${(p.recurring as any)?.interval ?? "one-time"}`
      );
    }
    return;
  }

  console.log("Creating Verdant Page Membership product…");
  const product = await stripe.products.create({
    name: "Verdant Page Membership",
    description:
      "Unlimited access to all essays, member newsletter, and early-access pieces.",
    images: [],
    metadata: { site: "verdant_page" },
  });
  console.log(`Created product: ${product.id}`);

  const monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: 500,
    currency: "gbp",
    recurring: { interval: "month" },
    nickname: "Monthly",
  });
  console.log(`Created monthly price: ${monthly.id}  £5.00/month`);

  const yearly = await stripe.prices.create({
    product: product.id,
    unit_amount: 4800,
    currency: "gbp",
    recurring: { interval: "year" },
    nickname: "Annual",
  });
  console.log(`Created annual price: ${yearly.id}  £48.00/year`);

  console.log("\n✓ Done. Webhooks will sync these prices to the database.");
  console.log(
    "Restart the API server to run syncBackfill and pick up the new products."
  );
}

seedProducts().catch((err) => {
  console.error("Error seeding products:", err.message);
  process.exit(1);
});
