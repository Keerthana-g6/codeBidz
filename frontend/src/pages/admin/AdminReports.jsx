import { useEffect, useState } from 'react';
import axios from 'axios';
import Layout from '../../components/shared/Layout';
import { BarChart3, Download } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminReports() {
  const [bids, setBids] = useState([]);
  const [auctions, setAuctions] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auctions').then(r => setAuctions(r.data.auctions));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = filter ? { auctionId: filter } : {};
    axios.get('/api/admin/reports', { params }).then(r => setBids(r.data)).finally(() => setLoading(false));
  }, [filter]);

  const totalAmount = bids.reduce((s, b) => s + b.amount, 0);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-white">Reports</h1>
          <p className="text-zinc-400 mt-1">Bidding history and analytics</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card p-5">
            <p className="text-zinc-400 text-sm">Total Bids</p>
            <p className="text-3xl font-bold text-zinc-100 font-mono mt-1">{bids.length}</p>
          </div>
          <div className="card p-5">
            <p className="text-zinc-400 text-sm">Total Credits Bid</p>
            <p className="text-3xl font-bold text-brand-400 font-mono mt-1">{totalAmount.toLocaleString()}</p>
          </div>
          <div className="card p-5">
            <p className="text-zinc-400 text-sm">Avg Bid</p>
            <p className="text-3xl font-bold text-zinc-100 font-mono mt-1">
              {bids.length ? Math.round(totalAmount / bids.length).toLocaleString() : 0}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="input max-w-xs">
            <option value="">All Auctions</option>
            {auctions.map(a => <option key={a._id} value={a._id}>{a.title}</option>)}
          </select>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase">Bidder</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase hidden md:table-cell">Auction</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase hidden lg:table-cell">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase hidden lg:table-cell">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>}
              {!loading && bids.length === 0 && <tr><td colSpan={5} className="text-center py-10 text-zinc-500">No bids found</td></tr>}
              {bids.map(b => (
                <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                  <td className="px-6 py-3">
                    <p className="text-sm text-zinc-100">{b.bidder?.name}</p>
                    <p className="text-xs text-zinc-500">{b.bidder?.email}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-sm text-zinc-300 max-w-[200px] truncate">{b.auction?.title}</td>
                  <td className="px-4 py-3 font-mono text-brand-400 font-semibold text-sm">{b.amount.toLocaleString()} cr</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      b.status === 'won' ? 'bg-amber-500/10 text-amber-400' :
                      b.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                      'bg-zinc-700 text-zinc-400'
                    }`}>{b.status}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-zinc-500">
                    {format(new Date(b.createdAt), 'MMM d, HH:mm:ss')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
