import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import {
  Coins, Zap, Star, Crown, Rocket,
  Check, Loader, CreditCard, Lock, X, CheckCircle
} from 'lucide-react';

const PACKAGES = [
  { id: 'starter',  credits: 500,  amount: 49,  label: 'Starter Pack',  icon: Zap,    color: { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400',   btn: 'bg-blue-500 hover:bg-blue-600' } },
  { id: 'popular',  credits: 1200, amount: 99,  label: 'Popular Pack',  icon: Star,   color: { bg: 'bg-brand-500/10',  border: 'border-brand-500/30',  text: 'text-brand-400',  btn: 'bg-brand-500 hover:bg-brand-600' } },
  { id: 'pro',      credits: 2500, amount: 199, label: 'Pro Pack',      icon: Crown,  color: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400', btn: 'bg-purple-500 hover:bg-purple-600' } },
  { id: 'ultimate', credits: 6000, amount: 449, label: 'Ultimate Pack', icon: Rocket, color: { bg: 'bg-amber-500/10',  border: 'border-amber-500/20',  text: 'text-amber-400',  btn: 'bg-amber-500 hover:bg-amber-600' } },
];

// ── Payment Modal ──────────────────────────────────────────
function PaymentModal({ pkg, onClose, onSuccess }) {
  const [step, setStep] = useState('form'); // form | processing | success | failed
  const [card, setCard] = useState({ number: '4111 1111 1111 1111', expiry: '12/28', cvv: '123', name: '' });
  const { user } = useAuth();

  const formatCard = (val) => val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (val) => { const v = val.replace(/\D/g, '').slice(0, 4); return v.length >= 3 ? v.slice(0,2) + '/' + v.slice(2) : v; };

  const handlePay = async () => {
    if (!card.name) { toast.error('Enter cardholder name'); return; }
    setStep('processing');
    // Simulate payment processing delay
    await new Promise(r => setTimeout(r, 2500));
    try {
      await axios.post('/api/payments/demo-purchase', { packageId: pkg.id });
      setStep('success');
      setTimeout(() => { onSuccess(); onClose(); }, 2000);
    } catch {
      setStep('failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-md shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-zinc-100 text-sm">CodeBidz Payments</p>
              <p className="text-xs text-zinc-500">Secure checkout</p>
            </div>
          </div>
          {step === 'form' && (
            <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Order summary */}
        <div className="px-5 py-4 bg-zinc-800/50 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-300">{pkg.label}</p>
            <p className="text-xs text-zinc-500">{pkg.credits.toLocaleString()} credits</p>
          </div>
          <p className="text-xl font-bold text-zinc-100 font-mono">₹{pkg.amount}</p>
        </div>

        {/* Form step */}
        {step === 'form' && (
          <div className="p-5 space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-xs text-amber-400 text-center">
              🧪 Test Mode — Card details pre-filled for demo
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Card Number</label>
              <div className="relative">
                <input value={card.number} onChange={e => setCard(c => ({ ...c, number: formatCard(e.target.value) }))}
                  className="input font-mono pr-10" placeholder="1234 5678 9012 3456" />
                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Expiry Date</label>
                <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                  className="input font-mono" placeholder="MM/YY" />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">CVV</label>
                <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.slice(0,4) }))}
                  className="input font-mono" placeholder="123" type="password" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Cardholder Name</label>
              <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))}
                className="input" placeholder={user?.name || 'Your Name'} />
            </div>

            <button onClick={handlePay}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3">
              <Lock className="w-4 h-4" />
              Pay ₹{pkg.amount} Securely
            </button>

            <p className="text-center text-xs text-zinc-600 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> 256-bit SSL encrypted · Demo mode
            </p>
          </div>
        )}

        {/* Processing step */}
        {step === 'processing' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-semibold text-zinc-100">Processing Payment...</p>
            <p className="text-sm text-zinc-400">Please don't close this window</p>
            <div className="space-y-1.5">
              {['Connecting to payment gateway', 'Verifying card details', 'Confirming transaction'].map((s, i) => (
                <p key={i} className="text-xs text-zinc-500 flex items-center justify-center gap-2">
                  <Loader className="w-3 h-3 animate-spin" /> {s}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Success step */}
        {step === 'success' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <p className="font-bold text-xl text-zinc-100">Payment Successful!</p>
            <p className="text-zinc-400 text-sm">
              <span className="text-brand-400 font-bold font-mono">{pkg.credits.toLocaleString()} credits</span> added to your account
            </p>
            <p className="text-xs text-zinc-500">Redirecting...</p>
          </div>
        )}

        {/* Failed step */}
        {step === 'failed' && (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
              <X className="w-8 h-8 text-red-400" />
            </div>
            <p className="font-bold text-xl text-zinc-100">Payment Failed</p>
            <p className="text-zinc-400 text-sm">Something went wrong. Please try again.</p>
            <button onClick={() => setStep('form')} className="btn-primary">Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function BuyCredits() {
  const { user, refreshUser } = useAuth();
  const [selectedPkg, setSelectedPkg] = useState(null);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-white mb-2">Buy Credits</h1>
          <p className="text-zinc-400">Top up your balance to keep bidding on live auctions</p>
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-xl">
            <Coins className="w-4 h-4 text-brand-400" />
            <span className="text-brand-400 font-semibold">
              Current Balance: {user?.credits?.toLocaleString()} credits
            </span>
          </div>
        </div>

        {/* Packages */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PACKAGES.map(pkg => {
            const Icon = pkg.icon;
            const c = pkg.color;
            const isPopular = pkg.id === 'popular';
            return (
              <div key={pkg.id} className={`card p-6 flex flex-col relative ${isPopular ? 'border-brand-500/40 ring-1 ring-brand-500/20' : ''}`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${c.text}`} />
                </div>
                <h3 className="font-semibold text-zinc-100 mb-1">{pkg.label}</h3>
                <p className={`text-3xl font-bold font-mono ${c.text} mb-1`}>
                  {pkg.credits.toLocaleString()}
                  <span className="text-sm font-normal text-zinc-500 ml-1">credits</span>
                </p>
                <p className="text-zinc-400 text-sm mb-6">₹{pkg.amount} INR</p>
                <div className="space-y-2 mb-6 flex-1">
                  {['Instant top-up', 'Never expires', 'Use on any auction'].map(f => (
                    <div key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" /> {f}
                    </div>
                  ))}
                </div>
                <button onClick={() => setSelectedPkg(pkg)}
                  className={`w-full py-2.5 rounded-xl text-white font-semibold text-sm transition-all active:scale-95 ${c.btn}`}>
                  Buy for ₹{pkg.amount}
                </button>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="card p-6">
          <h2 className="font-semibold text-zinc-100 mb-4">How Credits Work</h2>
          <div className="grid sm:grid-cols-3 gap-4 text-sm text-zinc-400">
            {[
              ['1', 'Buy a credit pack — credits are added to your account instantly after payment'],
              ['2', 'Place bids on live auctions — credits are frozen (reserved) when you bid'],
              ['3', "If outbid, credits return instantly. Credits only deduct when you win"],
            ].map(([n, text]) => (
              <div key={n} className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{n}</span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {selectedPkg && (
        <PaymentModal
          pkg={selectedPkg}
          onClose={() => setSelectedPkg(null)}
          onSuccess={() => { refreshUser(); toast.success('Credits added!'); }}
        />
      )}
    </Layout>
  );
}