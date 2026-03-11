import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/shared/Layout';
import { Plus, Edit, Trophy, Trash2, Eye, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const map = {
    active: 'badge-active', upcoming: 'badge-upcoming',
    ended: 'badge-ended', cancelled: 'badge-ended',
  };
  return <span className={map[status] || 'badge-ended'}>{status === 'active' && <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />}{status}</span>;
};

export default function AdminAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = filter ? { status: filter } : {};
    axios.get('/api/auctions', { params }).then(r => setAuctions(r.data.auctions)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter]);

  const declareWinner = async (id) => {
    if (!confirm('Declare winner for this auction?')) return;
    try {
      const r = await axios.post(`/api/auctions/${id}/declare-winner`);
      toast.success(`Winner: ${r.data.winner.name} (${r.data.amount} credits)`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const cancelAuction = async (id) => {
    if (!confirm('Cancel this auction? All credits will be returned.')) return;
    try {
      await axios.delete(`/api/auctions/${id}`);
      toast.success('Auction cancelled');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Auctions</h1>
            <p className="text-zinc-400 mt-1">Manage all auction listings</p>
          </div>
          <Link to="/admin/auctions/create" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Auction
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['', 'active', 'upcoming', 'ended', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-100'}`}>
              {s || 'All'}
            </button>
          ))}
          <button onClick={load} className="ml-auto btn-ghost flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Auction</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Current Bid</th>
                  <th className="text-left px-4 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden lg:table-cell">End Time</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {auctions.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No auctions found</td></tr>
                )}
                {auctions.map(a => (
                  <tr key={a._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {a.image && <img src={a.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <div>
                          <p className="font-medium text-zinc-100 text-sm">{a.title}</p>
                          <p className="text-xs text-zinc-500">{a.totalBids} bids · {a.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="font-mono text-brand-400 font-semibold">
                        {(a.currentBid || a.minimumBid).toLocaleString()} cr
                      </span>
                    </td>
                    <td className="px-4 py-4 hidden lg:table-cell text-xs text-zinc-400">
                      {format(new Date(a.endTime), 'MMM d, HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link to={`/admin/auctions/edit/${a._id}`} className="p-2 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-zinc-100 transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </Link>
                        {(a.status === 'active' || a.status === 'ended') && !a.winnerDeclared && a.totalBids > 0 && (
                          <button onClick={() => declareWinner(a._id)} className="p-2 hover:bg-amber-500/10 rounded-lg text-zinc-400 hover:text-amber-400 transition-colors" title="Declare Winner">
                            <Trophy className="w-4 h-4" />
                          </button>
                        )}
                        {a.status !== 'ended' && a.status !== 'cancelled' && (
                          <button onClick={() => cancelAuction(a._id)} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors" title="Cancel">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
