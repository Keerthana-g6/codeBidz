import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import { Coins, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Trophy, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const TYPE_CONFIG = {
  credit_purchase:  { icon: ArrowUpRight,  color: 'text-emerald-400', bg: 'bg-emerald-500/10',  label: 'Credits Purchased' },
  bid_placed:       { icon: ArrowDownRight, color: 'text-red-400',     bg: 'bg-red-500/10',      label: 'Bid Placed' },
  bid_returned:     { icon: ArrowUpRight,  color: 'text-blue-400',    bg: 'bg-blue-500/10',     label: 'Bid Returned' },
  auction_won:      { icon: Trophy,         color: 'text-amber-400',   bg: 'bg-amber-500/10',    label: 'Auction Won' },
  admin_assigned:   { icon: ShieldCheck,    color: 'text-purple-400',  bg: 'bg-purple-500/10',   label: 'Admin Assigned' },
  refund:           { icon: ArrowUpRight,  color: 'text-emerald-400', bg: 'bg-emerald-500/10',  label: 'Refund' },
};

export default function Wallet() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/transactions/my').then(r => setTransactions(r.data)).finally(() => setLoading(false));
  }, []);

  const totalIn = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Wallet</h1>
          <p className="text-zinc-400 mt-1">Your credit balance and transaction history</p>
        </div>

        {/* Balance cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-zinc-400">Available Balance</span>
            </div>
            <p className="text-3xl font-bold text-brand-400 font-mono">{user?.credits?.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-zinc-400">Total In</span>
            </div>
            <p className="text-3xl font-bold text-emerald-400 font-mono">+{totalIn.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <span className="text-xs text-zinc-400">Total Out</span>
            </div>
            <p className="text-3xl font-bold text-red-400 font-mono">-{totalOut.toLocaleString()}</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800">
            <h2 className="font-semibold text-zinc-100">Transaction History</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-zinc-500">No transactions yet</div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {transactions.map(t => {
                const config = TYPE_CONFIG[t.type] || TYPE_CONFIG.credit_purchase;
                const Icon = config.icon;
                const isPositive = t.amount > 0;
                return (
                  <div key={t._id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-800/30">
                    <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-100">{config.label}</p>
                      <p className="text-xs text-zinc-500 truncate">{t.description}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}{t.amount.toLocaleString()} cr
                      </p>
                      <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}