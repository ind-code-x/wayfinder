/*
  # Sponsored Ad Payment Fields

  Adds amount/status fields for paid promotion listings.
  Use with Razorpay Payment Pages or Checkout integration.
*/

ALTER TABLE public.sponsored_ads
  ADD COLUMN IF NOT EXISTS payment_amount_inr int NOT NULL DEFAULT 299,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded'));

CREATE INDEX IF NOT EXISTS sponsored_ads_payment_status_idx
  ON public.sponsored_ads (payment_status, status, created_at DESC);
