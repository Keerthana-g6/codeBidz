import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

import { useState } from 'react';
import {
  Gavel, LayoutDashboard, ListOrdered, Users, BarChart3,
  Plus, History, LogOut, Wifi, WifiOff, Coins, Bell
} from 'lucide-react';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/auctions', icon: ListOrdered, label: 'Auctions' },
  { to: '/admin/auctions/create', icon: Plus, label: 'Create Auction' },
  { to: '/admin/bidders', icon: Users, label: 'Bidders' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

const bidderNav = [
  { to: '/bidder', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/bidder/auctions', icon: Gavel, label: 'Live Auctions' },
  { to: '/bidder/history', icon: History, label: 'My Bids' },
  { to: '/bidder/credits', icon: Coins, label: 'Buy Credits' },
  { to: '/bidder/wallet', icon: History, label: 'Wallet' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { connected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = user?.role === 'admin' ? adminNav : bidderNav;

  const isActive = (item) => item.exact
    ? location.pathname === item.to
    : location.pathname.startsWith(item.to) && (!item.exact || location.pathname === item.to);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transform transition-transform lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Gavel className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-xl font-bold text-white">CodeBidz</span>
          </div>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-100 truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-zinc-600'}`} title={connected ? 'Connected' : 'Offline'} />
          </div>
          {user?.role === 'bidder' && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-brand-500/10 rounded-xl border border-brand-500/20">
              <Coins className="w-4 h-4 text-brand-400" />
              <span className="text-sm font-semibold text-brand-400">{user?.credits?.toLocaleString()} credits</span>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map(item => (
            <Link key={item.to} to={item.to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item)
                  ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden text-zinc-400 hover:text-zinc-100">
            <div className="space-y-1.5">
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current" />
            </div>
          </button>
          <div className="flex items-center gap-3 ml-auto">
            {connected
              ? <span className="flex items-center gap-1.5 text-xs text-emerald-400"><Wifi className="w-3 h-3" /> Live</span>
              : <span className="flex items-center gap-1.5 text-xs text-zinc-500"><WifiOff className="w-3 h-3" /> Offline</span>
            }
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
