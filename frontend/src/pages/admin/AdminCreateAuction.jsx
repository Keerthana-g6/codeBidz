import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Layout from '../../components/shared/Layout';
import { Sparkles, Save, ArrowLeft, Loader } from 'lucide-react';

export default function AdminCreateAuction() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', description: '', image: '', category: 'General',
    minimumBid: '', reservePrice: '', startTime: '', endTime: '', tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/auctions/${id}`).then(r => {
        const a = r.data;
        setForm({
          title: a.title, description: a.description, image: a.image || '',
          category: a.category, minimumBid: a.minimumBid, reservePrice: a.reservePrice || '',
          startTime: new Date(a.startTime).toISOString().slice(0, 16),
          endTime: new Date(a.endTime).toISOString().slice(0, 16),
          tags: a.tags?.join(', ') || '',
        });
      });
    }
  }, [id]);

  const generateDescription = async () => {
    if (!form.title) { toast.error('Enter a title first'); return; }
    setAiLoading(true);
    try {
      const res = await axios.post('/api/ai/generate-description', {
        title: form.title, category: form.category, keywords: form.tags
      });
      setForm(f => ({ ...f, description: res.data.description }));
      toast.success('AI description generated!');
    } catch {
      toast.error('AI generation failed');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        minimumBid: Number(form.minimumBid),
        reservePrice: Number(form.reservePrice) || 0,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (isEdit) {
        await axios.put(`/api/auctions/${id}`, payload);
        toast.success('Auction updated!');
      } else {
        await axios.post('/api/auctions', payload);
        toast.success('Auction created!');
      }
      navigate('/admin/auctions');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const F = ({ label, children }) => (
    <div>
      <label className="block text-sm font-medium text-zinc-300 mb-2">{label}</label>
      {children}
    </div>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin/auctions')} className="text-zinc-400 hover:text-zinc-100">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">{isEdit ? 'Edit Auction' : 'Create Auction'}</h1>
            <p className="text-zinc-400 text-sm">Fill in the details below</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <F label="Auction Title *">
            <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="input" placeholder="e.g. Vintage Rolex Watch 1962" required />
          </F>

          <F label="Description *">
            <div className="relative">
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="input min-h-[100px] resize-none pr-32" placeholder="Describe the item..." required />
              <button type="button" onClick={generateDescription} disabled={aiLoading}
                className="absolute top-2 right-2 flex items-center gap-1.5 text-xs bg-brand-500/20 hover:bg-brand-500/30 text-brand-400 border border-brand-500/30 px-3 py-1.5 rounded-lg transition-all">
                {aiLoading ? <Loader className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                {aiLoading ? 'Generating...' : 'AI Generate'}
              </button>
            </div>
          </F>

          <div className="grid grid-cols-2 gap-4">
            <F label="Category">
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input">
                {['General', 'Electronics', 'Art', 'Jewelry', 'Vehicles', 'Collectibles', 'Fashion', 'Real Estate'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </F>
            <F label="Image URL">
              <input type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                className="input" placeholder="https://..." />
            </F>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <F label="Minimum Bid (credits) *">
              <input type="number" value={form.minimumBid} onChange={e => setForm(f => ({ ...f, minimumBid: e.target.value }))}
                className="input" min="1" required />
            </F>
            <F label="Reserve Price (optional)">
              <input type="number" value={form.reservePrice} onChange={e => setForm(f => ({ ...f, reservePrice: e.target.value }))}
                className="input" min="0" placeholder="0" />
            </F>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <F label="Start Time *">
              <input type="datetime-local" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                className="input" required />
            </F>
            <F label="End Time *">
              <input type="datetime-local" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                className="input" required />
            </F>
          </div>

          <F label="Tags (comma-separated)">
            <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className="input" placeholder="vintage, luxury, rare" />
          </F>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {loading ? 'Saving...' : isEdit ? 'Update Auction' : 'Create Auction'}
            </button>
            <button type="button" onClick={() => navigate('/admin/auctions')} className="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
