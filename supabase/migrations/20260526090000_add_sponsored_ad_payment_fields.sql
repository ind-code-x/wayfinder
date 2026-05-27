/*
  # Sponsored Ad Payment Fields

  Adds amount/status fields for paid promotion listings.
  Use with Razorpay Payment Pages or Checkout integration.
*/

ALTER TABLE public.sponsored_ads
  ADD COLUMN IF NOT EXISTS payment_amount_inr int NOT NULL DEFAULT 299,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'paid'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS subscription_plan text NOT NULL DEFAULT 'monthly'
    CHECK (subscription_plan IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS subscription_starts_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz NOT NULL DEFAULT (now() + interval '1 month');

CREATE INDEX IF NOT EXISTS sponsored_ads_payment_status_idx
  ON public.sponsored_ads (payment_status, status, created_at DESC);

CREATE INDEX IF NOT EXISTS sponsored_ads_expiry_idx
  ON public.sponsored_ads (status, payment_status, subscription_expires_at);

DROP POLICY IF EXISTS "Anyone can read active sponsored ads" ON public.sponsored_ads;
CREATE POLICY "Anyone can read active sponsored ads"
  ON public.sponsored_ads FOR SELECT
  TO anon, authenticated
  USING (
    status = 'active'
    AND payment_status = 'paid'
    AND subscription_expires_at > now()
  );

CREATE OR REPLACE FUNCTION public.expire_sponsored_ads()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.sponsored_ads
  SET status = 'expired',
      updated_at = now()
  WHERE status = 'active'
    AND subscription_expires_at <= now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.expire_sponsored_ads() TO anon, authenticated;
