import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import { Trophy, TrendingUp, Clock, RotateCcw, Gavel } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatusIcon = ({ status }) => {
  if (status === 'won') return <Trophy className="w-4 h-4 text-amber-400" />;
  if (status === 'active') return <TrendingUp className="w-4 h-4 text-emerald-400" />;
  if (status === 'outbid') return <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />;
  return <RotateCcw className="w-4 h-4 text-zinc-500" />;
};

export default function BidderHistory() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/bids/my').then(r => setBids(r.data)).finally(() => setLoading(false));
  }, []);

  const stats = {
    total: bids.length,
    won: bids.filter(b => b.status === 'won').length,
    active: bids.filter(b => b.status === 'active').length,
    spent: bids.filter(b => b.status === 'won').reduce((s, b) => s + b.amount, 0),
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">My Bid History</h1>
          <p className="text-zinc-400 mt-1">Track all your bids and outcomes</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Bids', value: stats.total, color: 'text-zinc-100' },
            { label: 'Active Bids', value: stats.active, color: 'text-emerald-400' },
            { label: 'Auctions Won', value: stats.won, color: 'text-amber-400' },
            { label: 'Credits Spent', value: stats.spent.toLocaleString(), color: 'text-brand-400' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bids.length === 0 ? (
          <div className="card p-16 text-center">
            <Gavel className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400">No bids yet</p>
            <Link to="/bidder/auctions" className="text-brand-400 hover:text-brand-300 text-sm mt-2 inline-block">Browse auctions →</Link>
          </div>
        ) : (
          <div className="card divide-y divide-zinc-800">
            {bids.map(b => (
              <div key={b._id} className="flex items-center gap-4 p-4 hover:bg-zinc-800/30 transition-colors">
                <StatusIcon status={b.status} />
                <div className="flex-1 min-w-0">
                  <Link to={`/bidder/auctions/${b.auction?._id}`} className="text-sm font-medium text-zinc-100 hover:text-brand-400 transition-colors line-clamp-1">
                    {b.auction?.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className={`text-xs capitalize px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'won' ? 'bg-amber-500/10 text-amber-400' :
                      b.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      b.status === 'outbid' ? 'bg-red-500/10 text-red-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>{b.status}</span>
                    <span className="text-xs text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono font-bold text-brand-400">{b.amount.toLocaleString()} cr</p>
                  <p className="text-xs text-zinc-500 capitalize">{b.auction?.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
