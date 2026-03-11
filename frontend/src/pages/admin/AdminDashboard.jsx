import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import { Users, Gavel, TrendingUp, Activity, Coins } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color = 'brand' }) => {
  const colors = {
    brand: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-sm mb-1">{label}</p>
          <p className="text-3xl font-bold text-zinc-100 font-mono">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/admin/stats').then(r => setStats(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-zinc-400 mt-1">Platform overview and live activity</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Bidders" value={stats?.totalBidders ?? 0} color="blue" />
          <StatCard icon={Gavel} label="Total Auctions" value={stats?.totalAuctions ?? 0} color="brand" />
          <StatCard icon={Activity} label="Active Auctions" value={stats?.activeAuctions ?? 0} color="emerald" />
          <StatCard icon={TrendingUp} label="Total Bids" value={stats?.totalBids ?? 0} color="purple" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent bids */}
          <div className="card p-6">
            <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400" /> Live Bid Feed
            </h2>
            <div className="space-y-3">
              {stats?.recentBids?.length === 0 && (
                <p className="text-zinc-500 text-sm">No bids yet</p>
              )}
              {stats?.recentBids?.map(bid => (
                <div key={bid._id} className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
                  <div>
                    <p className="text-sm text-zinc-100 font-medium">{bid.bidder?.name}</p>
                    <p className="text-xs text-zinc-500 truncate max-w-[180px]">{bid.auction?.title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-400 font-mono">{bid.amount?.toLocaleString()} cr</p>
                    <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top bidders */}
          <div className="card p-6">
            <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand-400" /> Top Bidders
            </h2>
            <div className="space-y-3">
              {stats?.topBidders?.length === 0 && (
                <p className="text-zinc-500 text-sm">No bidders yet</p>
              )}
              {stats?.topBidders?.map((b, i) => (
                <div key={b._id} className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-zinc-500 font-mono">#{i + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                    {b.user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-zinc-100 font-medium">{b.user?.name}</p>
                    <p className="text-xs text-zinc-500">{b.totalBids} bids</p>
                  </div>
                  <p className="text-sm font-mono text-brand-400">{b.totalAmount?.toLocaleString()} cr</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Auctions by status */}
        <div className="card p-6">
          <h2 className="font-semibold text-zinc-100 mb-4">Auction Status Breakdown</h2>
          <div className="flex gap-4 flex-wrap">
            {stats?.auctionsByStatus?.map(s => (
              <div key={s._id} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-xl">
                <span className="capitalize text-zinc-300 text-sm">{s._id}</span>
                <span className="text-brand-400 font-bold font-mono text-sm">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
