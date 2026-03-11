import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAuctions from './pages/admin/AdminAuctions';
import AdminCreateAuction from './pages/admin/AdminCreateAuction';
import AdminBidders from './pages/admin/AdminBidders';
import AdminReports from './pages/admin/AdminReports';
import BidderDashboard from './pages/bidder/BidderDashboard';
import BidderAuctions from './pages/bidder/BidderAuctions';
import AuctionDetail from './pages/bidder/AuctionDetail';
import BidderHistory from './pages/bidder/BidderHistory';
import BuyCredits from './pages/bidder/BuyCredits';
import Wallet from './pages/bidder/Wallet';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/bidder'} replace />;
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/bidder') : '/login'} replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/auctions" element={<ProtectedRoute role="admin"><AdminAuctions /></ProtectedRoute>} />
      <Route path="/admin/auctions/create" element={<ProtectedRoute role="admin"><AdminCreateAuction /></ProtectedRoute>} />
      <Route path="/admin/auctions/edit/:id" element={<ProtectedRoute role="admin"><AdminCreateAuction /></ProtectedRoute>} />
      <Route path="/admin/bidders" element={<ProtectedRoute role="admin"><AdminBidders /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />

      {/* Bidder Routes */}
      <Route path="/bidder" element={<ProtectedRoute role="bidder"><BidderDashboard /></ProtectedRoute>} />
      <Route path="/bidder/auctions" element={<ProtectedRoute role="bidder"><BidderAuctions /></ProtectedRoute>} />
      <Route path="/bidder/auctions/:id" element={<ProtectedRoute role="bidder"><AuctionDetail /></ProtectedRoute>} />
      <Route path="/bidder/history" element={<ProtectedRoute role="bidder"><BidderHistory /></ProtectedRoute>} />
      <Route path="/bidder/credits" element={<ProtectedRoute role="bidder"><BuyCredits /></ProtectedRoute>} />
      <Route path="/bidder/wallet" element={<ProtectedRoute role="bidder"><Wallet /></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #3f3f46' },
              success: { iconTheme: { primary: '#f97316', secondary: '#09090b' } },
            }}
          />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
