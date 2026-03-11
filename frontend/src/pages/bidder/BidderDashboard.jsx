import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import AuctionCard from '../../components/shared/AuctionCard';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Coins, Gavel, Trophy, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BidderDashboard() {
  const { user, refreshUser } = useAuth();
  const { on, off } = useSocket();
  const [auctions, setAuctions] = useState([]);
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('/api/auctions', { params: { status: 'active', limit: 6 } }),
      axios.get('/api/bids/my'),
    ]).then(([aRes, bRes]) => {
      setAuctions(aRes.data.auctions);
      setMyBids(bRes.data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handleOutbid = (data) => {
      toast.error(`You've been outbid on "${data.auctionTitle}"!`, { duration: 5000 });
      refreshUser();
    };
    const handleCredits = () => refreshUser();

    on('bid:outbid', handleOutbid);
    on('credits:updated', handleCredits);
    return () => { off('bid:outbid', handleOutbid); off('credits:updated', handleCredits); };
  }, []);

  const wonBids = myBids.filter(b => b.status === 'won').length;
  const activeBids = myBids.filter(b => b.status === 'active').length;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0]}!</h1>
          <p className="text-zinc-400 mt-1">Here's what's happening with your auctions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Coins, label: 'Available Credits', value: user?.credits?.toLocaleString() ?? 0, color: 'text-brand-400' },
            { icon: Gavel, label: 'Active Bids', value: activeBids, color: 'text-blue-400' },
            { icon: Trophy, label: 'Auctions Won', value: wonBids, color: 'text-amber-400' },
            { icon: TrendingUp, label: 'Total Bids', value: myBids.length, color: 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="card p-5">
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-zinc-400">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Active Auctions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-white">Live Auctions</h2>
            <Link to="/bidder/auctions" className="text-sm text-brand-400 hover:text-brand-300">View all →</Link>
          </div>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : auctions.length === 0 ? (
            <div className="card p-12 text-center">
              <Gavel className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400">No active auctions right now</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctions.map(a => <AuctionCard key={a._id} auction={a} />)}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
