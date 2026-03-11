import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/shared/Layout';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useCountdown } from '../../hooks/useCountdown';
import {
  Gavel, Clock, TrendingUp, Sparkles, Coins, Trophy,
  AlertCircle, ChevronLeft, Loader, Wifi
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const CountdownBlock = ({ endTime }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(endTime);
  const urgent = !expired && days === 0 && hours === 0 && minutes < 2;
  if (expired) return <div className="text-red-400 font-mono font-bold text-lg">Auction Ended</div>;
  return (
    <div className={`flex items-center gap-3 font-mono ${urgent ? 'text-red-400 countdown-urgent' : 'text-zinc-100'}`}>
      {days > 0 && <><span className="text-2xl font-bold">{days}</span><span className="text-zinc-500 text-sm">d</span></>}
      <span className="text-2xl font-bold">{String(hours).padStart(2, '0')}</span><span className="text-zinc-500 text-sm">h</span>
      <span className="text-2xl font-bold">{String(minutes).padStart(2, '0')}</span><span className="text-zinc-500 text-sm">m</span>
      <span className="text-2xl font-bold">{String(seconds).padStart(2, '0')}</span><span className="text-zinc-500 text-sm">s</span>
    </div>
  );
};

export default function AuctionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { joinAuction, leaveAuction, on, off } = useSocket();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const bidsRef = useRef(null);

  useEffect(() => {
    Promise.all([
      axios.get(`/api/auctions/${id}`),
      axios.get(`/api/auctions/${id}/bids`),
    ]).then(([aRes, bRes]) => {
      setAuction(aRes.data);
      setBids(bRes.data);
    }).catch(() => toast.error('Auction not found')).finally(() => setLoading(false));

    joinAuction(id);
    return () => leaveAuction(id);
  }, [id]);

  useEffect(() => {
    const handleNewBid = ({ bid, auction: updatedAuction }) => {
      setAuction(updatedAuction);
      setBids(prev => [bid, ...prev.slice(0, 49)]);
      refreshUser();
    };
    const handleWinner = ({ winner, amount }) => {
      toast.success(`🏆 Winner: ${winner.name} with ${amount} credits!`, { duration: 6000 });
      axios.get(`/api/auctions/${id}`).then(r => setAuction(r.data));
    };
    const handleCancelled = () => {
      toast.error('This auction has been cancelled');
      axios.get(`/api/auctions/${id}`).then(r => setAuction(r.data));
    };

    on('bid:new', handleNewBid);
    on('auction:winner', handleWinner);
    on('auction:cancelled', handleCancelled);
    return () => { off('bid:new', handleNewBid); off('auction:winner', handleWinner); off('auction:cancelled', handleCancelled); };
  }, [id]);

  const getAiSuggestion = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('/api/ai/bid-suggestion', {
        auctionTitle: auction.title,
        currentBid: auction.currentBid,
        minimumBid: auction.minimumBid,
        endTime: auction.endTime,
        availableCredits: user.credits,
        totalBids: auction.totalBids,
      });
      setAiSuggestion(res.data.suggestion);
    } catch { toast.error('AI suggestion failed'); }
    finally { setAiLoading(false); }
  };

  const getSmartSuggestion = async () => {
    try {
      const res = await axios.get(`/api/bids/smart-suggest/${id}`);
      return res.data;
    } catch { return null; }
  };

  const placeBid = async () => {
    if (!bidAmount || isNaN(Number(bidAmount))) { toast.error('Enter a valid bid amount'); return; }
    setPlacing(true);
    try {
      await axios.post('/api/bids', { auctionId: id, amount: Number(bidAmount) });
      toast.success(`Bid of ${bidAmount} credits placed!`);
      setBidAmount('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bid failed');
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  if (!auction) return <Layout><div className="text-center text-zinc-400 mt-20">Auction not found</div></Layout>;

  const minNextBid = auction.currentBid > 0 ? auction.currentBid + 1 : auction.minimumBid;
  const isActive = auction.status === 'active';
  const isHighestBidder = auction.currentBidder?._id === user._id;
  const canBid = isActive && !isHighestBidder && user.credits >= minNextBid;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 mb-6 text-sm">
          <ChevronLeft className="w-4 h-4" /> Back to auctions
        </button>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Image + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="card overflow-hidden">
              {auction.image ? (
                <img src={auction.image} alt={auction.title} className="w-full h-72 object-cover" />
              ) : (
                <div className="w-full h-72 bg-zinc-800 flex items-center justify-center">
                  <Gavel className="w-16 h-16 text-zinc-700" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="font-display text-2xl font-bold text-white">{auction.title}</h1>
                  <span className={`flex-shrink-0 text-xs font-medium px-3 py-1 rounded-full ${
                    isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-zinc-700 text-zinc-400'
                  }`}>
                    {isActive && <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full mr-1.5 animate-pulse" />}
                    {auction.status}
                  </span>
                </div>
                <p className="text-zinc-400 leading-relaxed">{auction.description}</p>
                {auction.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {auction.tags.map(t => (
                      <span key={t} className="text-xs bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-lg">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live Bid Feed */}
            <div className="card p-6">
              <h2 className="font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-400" /> Live Bid History
                <span className="text-xs text-zinc-500 ml-auto">{auction.totalBids} total bids</span>
              </h2>
              <div ref={bidsRef} className="space-y-2 max-h-64 overflow-y-auto">
                {bids.length === 0 && <p className="text-zinc-500 text-sm">No bids yet. Be the first!</p>}
                {bids.map((b, i) => (
                  <div key={b._id} className={`flex items-center justify-between py-2.5 px-3 rounded-xl ${i === 0 ? 'bg-brand-500/10 border border-brand-500/20 bid-item-enter' : 'bg-zinc-800/50'}`}>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300">
                        {b.bidder?.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-zinc-100">{b.bidder?.name}</span>
                        {i === 0 && <span className="ml-2 text-xs text-brand-400">Leading</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-brand-400 text-sm">{b.amount.toLocaleString()} cr</span>
                      <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(b.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Bid panel */}
          <div className="space-y-4">
            {/* Timer */}
            <div className="card p-5">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-3">
                <Clock className="w-4 h-4" /> Time Remaining
              </div>
              <CountdownBlock endTime={auction.endTime} />
              <p className="text-xs text-zinc-500 mt-2">Ends {format(new Date(auction.endTime), 'MMM d, yyyy HH:mm')}</p>
            </div>

            {/* Current Bid */}
            <div className="card p-5">
              <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                <TrendingUp className="w-4 h-4" /> Current Bid
              </div>
              <p className="text-4xl font-bold text-brand-400 font-mono">
                {(auction.currentBid || auction.minimumBid).toLocaleString()}
                <span className="text-lg font-normal text-zinc-500 ml-1">credits</span>
              </p>
              {auction.currentBidder && (
                <p className="text-sm text-zinc-400 mt-1">by <span className="text-zinc-200">{auction.currentBidder.name}</span></p>
              )}
            </div>

            {/* Credits */}
            <div className="card p-4 flex items-center gap-3">
              <Coins className="w-4 h-4 text-brand-400" />
              <div>
                <p className="text-xs text-zinc-400">Your Credits</p>
                <p className="font-mono font-bold text-zinc-100">{user.credits.toLocaleString()}</p>
              </div>
            </div>

            {/* Winner announcement */}
            {auction.winnerDeclared && (
              <div className="card p-5 bg-amber-500/5 border-amber-500/20">
                <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                  <Trophy className="w-5 h-5" /> Winner
                </div>
                <p className="text-zinc-200">{auction.winner?.name || auction.currentBidder?.name}</p>
                <p className="text-brand-400 font-mono font-bold">{auction.currentBid.toLocaleString()} credits</p>
              </div>
            )}

            {/* Bid form */}
            {isActive && !auction.winnerDeclared && (
              <div className="card p-5 space-y-4">
                {isHighestBidder && (
                  <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-sm">
                    <AlertCircle className="w-4 h-4" /> You're the highest bidder!
                  </div>
                )}

                {!isHighestBidder && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Your Bid (min: <span className="text-brand-400">{minNextBid.toLocaleString()}</span>)
                      </label>
                      <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)}
                        className="input" placeholder={`${minNextBid}`} min={minNextBid} />
                    </div>

                    {/* AI Suggestion */}
                    {aiSuggestion && (
                      <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 text-sm text-brand-300">
                        <div className="flex items-center gap-1.5 text-brand-400 font-medium mb-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Suggestion
                        </div>
                        {aiSuggestion}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={placeBid} disabled={placing || !bidAmount}
                        className="btn-primary flex-1 flex items-center justify-center gap-2">
                        {placing ? <Loader className="w-4 h-4 animate-spin" /> : <Gavel className="w-4 h-4" />}
                        {placing ? 'Placing...' : 'Place Bid'}
                      </button>
                      <button onClick={getAiSuggestion} disabled={aiLoading}
                        className="flex items-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-300 text-sm transition-all"
                        title="Get AI bid suggestion">
                        {aiLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      </button>
                    </div>

                    {user.credits < minNextBid && (
                      <p className="text-red-400 text-xs">Insufficient credits to bid</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Auction info */}
            <div className="card p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-zinc-400">Category</span><span className="text-zinc-200">{auction.category}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Min Bid</span><span className="text-zinc-200 font-mono">{auction.minimumBid.toLocaleString()} cr</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Total Bids</span><span className="text-zinc-200">{auction.totalBids}</span></div>
              <div className="flex justify-between"><span className="text-zinc-400">Start</span><span className="text-zinc-200">{format(new Date(auction.startTime), 'MMM d, HH:mm')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
