import { Router, type IRouter } from "express";
import { getUncachableStripeClient } from "../stripeClient";
import {
  listProductsWithPrices,
  getSubscriptionByEmail,
} from "../stripeStorage";

const router: IRouter = Router();

router.get("/membership/products", async (_req, res) => {
  try {
    const products = await listProductsWithPrices();
    res.json({ products });
  } catch (err: any) {
    if (
      err.message?.includes("not connected") ||
      err.message?.includes("Missing Replit") ||
      err.code === "42P01" ||
      err.message?.includes("stripe") ||
      err.message?.includes("schema")
    ) {
      return res.status(503).json({ error: "stripe_not_configured" });
    }
    res.status(500).json({ error: "Failed to load products" });
  }
});

router.post("/membership/checkout", async (req, res) => {
  const { priceId, email } = req.body as {
    priceId: string;
    email?: string;
  };

  if (!priceId) {
    return res.status(400).json({ error: "priceId is required" });
  }

  try {
    const stripe = await getUncachableStripeClient();
    const domain =
      process.env.REPLIT_DOMAINS?.split(",")[0] ?? req.get("host") ?? "";
    const base = `https://${domain}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email || undefined,
      success_url: `${base}/membership/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/membership`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { source: "verdant_page_membership" },
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    if (
      err.message?.includes("not connected") ||
      err.message?.includes("Missing Replit")
    ) {
      return res.status(503).json({ error: "stripe_not_configured" });
    }
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

router.get("/membership/status", async (req, res) => {
  const { email } = req.query as { email?: string };

  if (!email) {
    return res.status(400).json({ error: "email query parameter is required" });
  }

  try {
    const sub = await getSubscriptionByEmail(email);
    if (!sub) {
      return res.json({ active: false });
    }
    res.json({
      active: true,
      status: sub.status,
      currentPeriodEnd: sub.current_period_end,
      customerId: sub.customer_id,
    });
  } catch (err: any) {
    if (err.message?.includes("stripe") || err.code === "42P01") {
      return res.json({ active: false, error: "stripe_not_configured" });
    }
    res.status(500).json({ error: "Failed to check membership status" });
  }
});

router.post("/membership/portal", async (req, res) => {
  const { customerId } = req.body as { customerId: string };

  if (!customerId) {
    return res.status(400).json({ error: "customerId is required" });
  }

  try {
    const stripe = await getUncachableStripeClient();
    const domain =
      process.env.REPLIT_DOMAINS?.split(",")[0] ?? req.get("host") ?? "";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `https://${domain}/membership`,
    });
    res.json({ url: portalSession.url });
  } catch (err: any) {
    if (
      err.message?.includes("not connected") ||
      err.message?.includes("Missing Replit")
    ) {
      return res.status(503).json({ error: "stripe_not_configured" });
    }
    res.status(500).json({ error: "Failed to create portal session" });
  }
});

export default router;
