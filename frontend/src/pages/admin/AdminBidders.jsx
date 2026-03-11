import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/shared/Layout';
import { Coins, Users, RefreshCw, Check, X } from 'lucide-react';

export default function AdminBidders() {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creditInputs, setCreditInputs] = useState({});
  const [bulkCredits, setBulkCredits] = useState('');
  const [assigning, setAssigning] = useState({});

  const load = () => {
    setLoading(true);
    axios.get('/api/admin/bidders').then(r => setBidders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const assignCredits = async (userId, action = 'set') => {
    const val = parseInt(creditInputs[userId]);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid number'); return; }
    setAssigning(a => ({ ...a, [userId]: true }));
    try {
      await axios.post('/api/admin/assign-credits', { userId, credits: val, action });
      toast.success(`Credits ${action === 'add' ? 'added' : 'set'} successfully`);
      setCreditInputs(c => ({ ...c, [userId]: '' }));
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setAssigning(a => ({ ...a, [userId]: false })); }
  };

  const bulkAssign = async () => {
    const val = parseInt(bulkCredits);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid number'); return; }
    if (!confirm(`Set ${val} credits for ALL bidders?`)) return;
    try {
      await axios.post('/api/admin/bulk-assign-credits', { credits: val });
      toast.success(`All bidders set to ${val} credits`);
      setBulkCredits('');
      load();
    } catch { toast.error('Bulk assign failed'); }
  };

  const toggleUser = async (id) => {
    try {
      const r = await axios.put(`/api/admin/bidders/${id}/toggle`);
      toast.success(r.data.message);
      load();
    } catch { toast.error('Failed'); }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Bidders</h1>
            <p className="text-zinc-400 mt-1">Manage bidder accounts and credits</p>
          </div>
          <button onClick={load} className="btn-ghost flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Bulk assign */}
        <div className="card p-5 flex items-center gap-4">
          <Coins className="w-5 h-5 text-brand-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-zinc-100">Bulk Credit Assignment</p>
            <p className="text-xs text-zinc-400">Set the same credit amount for all bidders at once</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="number" value={bulkCredits} onChange={e => setBulkCredits(e.target.value)}
              className="input w-32" placeholder="Amount" min="0" />
            <button onClick={bulkAssign} className="btn-primary">Assign All</button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-400" />
              <span className="font-semibold text-zinc-100">{bidders.length} Bidders</span>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Bidder</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Credits</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider">Assign Credits</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {bidders.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-zinc-500">No bidders registered yet</td></tr>
                )}
                {bidders.map(b => (
                  <tr key={b._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                          {b.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100 text-sm">{b.name}</p>
                          <p className="text-xs text-zinc-500">{b.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-brand-400 font-bold">{b.credits.toLocaleString()}</span>
                      {b.frozenCredits > 0 && (
                        <span className="text-xs text-zinc-500 ml-1">({b.frozenCredits} frozen)</span>
                      )}
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${b.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {b.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <input type="number" value={creditInputs[b._id] || ''} onChange={e => setCreditInputs(c => ({ ...c, [b._id]: e.target.value }))}
                          className="input w-24 py-1.5 text-sm" placeholder="Amount" min="0" />
                        <button onClick={() => assignCredits(b._id, 'set')} disabled={assigning[b._id]}
                          className="px-2.5 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 rounded-lg text-xs font-medium transition-all">
                          Set
                        </button>
                        <button onClick={() => assignCredits(b._id, 'add')} disabled={assigning[b._id]}
                          className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium transition-all">
                          +Add
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleUser(b._id)}
                        className={`p-2 rounded-lg transition-all ${b.isActive ? 'hover:bg-red-500/10 text-zinc-500 hover:text-red-400' : 'hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400'}`}>
                        {b.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
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
