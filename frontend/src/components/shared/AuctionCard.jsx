import { Link } from 'react-router-dom';
import { Clock, TrendingUp, Users, Gavel } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

const StatusBadge = ({ status }) => {
  const map = {
    active: 'badge-active',
    upcoming: 'badge-upcoming',
    ended: 'badge-ended',
    cancelled: 'badge-ended',
  };
  return (
    <span className={map[status] || 'badge-ended'}>
      {status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const CountdownDisplay = ({ endTime, status }) => {
  const { days, hours, minutes, seconds, expired } = useCountdown(endTime);
  if (status !== 'active') return null;
  const urgent = !expired && days === 0 && hours === 0 && minutes < 1;
  return (
    <div className={`flex items-center gap-1.5 text-xs font-mono ${urgent ? 'countdown-urgent' : 'text-zinc-400'}`}>
      <Clock className="w-3 h-3" />
      {expired ? 'Ended' : days > 0
        ? `${days}d ${hours}h ${minutes}m`
        : `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`}
    </div>
  );
};

export default function AuctionCard({ auction, linkBase = '/bidder/auctions' }) {
  return (
    <Link to={`${linkBase}/${auction._id}`} className="card overflow-hidden hover:border-zinc-700 transition-all duration-200 group hover:shadow-xl hover:shadow-brand-500/5 block">
      {/* Image */}
      <div className="relative h-44 bg-zinc-800 overflow-hidden">
        {auction.image ? (
          <img src={auction.image} alt={auction.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Gavel className="w-12 h-12 text-zinc-700" />
          </div>
        )}
        <div className="absolute top-3 left-3"><StatusBadge status={auction.status} /></div>
        {auction.category && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur text-xs text-zinc-300 px-2 py-1 rounded-lg">
            {auction.category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-zinc-100 mb-1 line-clamp-1 group-hover:text-brand-400 transition-colors">{auction.title}</h3>
        <p className="text-zinc-500 text-sm line-clamp-2 mb-4">{auction.description}</p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Current Bid</p>
            <p className="text-lg font-bold text-brand-400 font-mono">
              {auction.currentBid > 0 ? auction.currentBid.toLocaleString() : auction.minimumBid.toLocaleString()}
              <span className="text-xs font-normal text-zinc-500 ml-1">credits</span>
            </p>
          </div>
          <div className="text-right">
            <CountdownDisplay endTime={auction.endTime} status={auction.status} />
            <div className="flex items-center gap-1 text-xs text-zinc-500 mt-0.5 justify-end">
              <TrendingUp className="w-3 h-3" />
              {auction.totalBids} bids
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
