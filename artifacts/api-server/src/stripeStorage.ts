import { pool } from "@workspace/db";

export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  metadata: Record<string, string> | null;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string; interval_count: number } | null;
  active: boolean;
  metadata: Record<string, string> | null;
}

export interface ProductWithPrices extends StripeProduct {
  prices: StripePrice[];
}

export async function listProductsWithPrices(): Promise<ProductWithPrices[]> {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT
        p.id as product_id,
        p.name as product_name,
        p.description as product_description,
        p.active as product_active,
        p.metadata as product_metadata,
        pr.id as price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active as price_active,
        pr.metadata as price_metadata
      FROM stripe.products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      WHERE p.active = true
      ORDER BY p.id, pr.unit_amount
    `);

    const map = new Map<string, ProductWithPrices>();
    for (const row of result.rows) {
      if (!map.has(row.product_id)) {
        map.set(row.product_id, {
          id: row.product_id,
          name: row.product_name,
          description: row.product_description,
          active: row.product_active,
          metadata: row.product_metadata,
          prices: [],
        });
      }
      if (row.price_id) {
        map.get(row.product_id)!.prices.push({
          id: row.price_id,
          product: row.product_id,
          unit_amount: row.unit_amount,
          currency: row.currency,
          recurring: row.recurring,
          active: row.price_active,
          metadata: row.price_metadata,
        });
      }
    }
    return Array.from(map.values());
  } finally {
    client.release();
  }
}

export async function getSubscriptionByEmail(email: string) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `
      SELECT
        s.id as subscription_id,
        s.status,
        s.current_period_end,
        c.email,
        c.id as customer_id
      FROM stripe.customers c
      JOIN stripe.subscriptions s ON s.customer = c.id
      WHERE lower(c.email) = lower($1)
        AND s.status IN ('active', 'trialing')
      ORDER BY s.current_period_end DESC
      LIMIT 1
    `,
      [email]
    );
    return result.rows[0] ?? null;
  } finally {
    client.release();
  }
}
