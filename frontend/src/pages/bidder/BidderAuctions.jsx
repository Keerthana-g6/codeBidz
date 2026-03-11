import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import AuctionCard from '../../components/shared/AuctionCard';
import { Search, Gavel } from 'lucide-react';

export default function BidderAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (filter) params.status = filter;
    axios.get('/api/auctions', { params }).then(r => setAuctions(r.data.auctions)).finally(() => setLoading(false));
  }, [filter]);

  const filtered = search
    ? auctions.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase()))
    : auctions;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Auctions</h1>
          <p className="text-zinc-400 mt-1">Browse and bid on live auctions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="input pl-10" placeholder="Search auctions..." />
          </div>
          <div className="flex gap-2">
            {['active', 'upcoming', 'ended', ''].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-60">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center">
            <Gavel className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium">No auctions found</p>
            <p className="text-zinc-500 text-sm mt-1">Try changing the filter</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(a => <AuctionCard key={a._id} auction={a} />)}
          </div>
        )}
      </div>
    </Layout>
  );
}
