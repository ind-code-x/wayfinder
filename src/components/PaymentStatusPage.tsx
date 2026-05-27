import { AlertCircle, CheckCircle2, Megaphone } from 'lucide-react';
import { PageView } from '../types';

interface PaymentStatusPageProps {
  status: 'success' | 'failed';
  onNavigate: (view: PageView) => void;
}

export default function PaymentStatusPage({ status, onNavigate }: PaymentStatusPageProps) {
  const success = status === 'success';
  const Icon = success ? CheckCircle2 : AlertCircle;

  return (
    <main className="bg-gradient-to-b from-orange-50 via-white to-green-50">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="rounded-3xl border border-gray-100 bg-white p-8 sm:p-10 text-center shadow-sm">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
            <Icon size={34} />
          </div>

          <h1 className="mt-6 text-3xl font-black text-gray-950">
            {success ? 'Payment successful' : 'Payment failed'}
          </h1>

          <p className="mt-3 text-gray-600 leading-relaxed">
            {success
              ? 'Thank you. Your payment is complete. Please return to the advertise form, enter your Razorpay payment ID/reference, and submit your listing details.'
              : 'Your payment was not completed. Please try again or contact support if money was debited.'}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('advertise')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700"
            >
              <Megaphone size={18} />
              {success ? 'Submit listing details' : 'Try payment again'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="rounded-xl border border-gray-200 px-5 py-3 font-bold text-gray-700 hover:border-orange-300"
            >
              Contact support
            </button>
          </div>

          {success && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 text-left text-sm text-green-800">
              Your one-month promotion starts after your listing is submitted and saved. It will stop showing automatically after 30 days without deleting the database record.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
