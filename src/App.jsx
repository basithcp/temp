import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/main.css';

// Components
import { LayoutDashboard, List, LogOut } from 'lucide-react';
import { Login, Signup } from './components/AuthForms';
import Header from './components/Header';
import PaymentForm from './components/PaymentForm'; // Merchant Dashboard
import AdminDashboard from './components/admin/AdminDashboard';

// --- LAYOUTS ---

// Layout for Merchant (Has the top header)
const MerchantLayout = () => (
  <>
    <Header />
    <main className="main-container"><Outlet /></main>
  </>
);

// Layout for Admin (Sidebar)
const AdminLayout = () => {
    const { logout } = useAuth();
    return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
         <div className="sidebar-brand">🛡️ Admin Panel</div>
         <nav className="sidebar-menu">
            <div className="menu-item active"><LayoutDashboard size={20} /> Dashboard</div>
            <div className="menu-item"><List size={20} /> Transactions</div>
         </nav>
         <div className="sidebar-footer">
            <button onClick={logout} className="menu-item" style={{background:'none', border:'none', cursor:'pointer', width:'100%'}}>
                <LogOut size={20}/> Logout
            </button>
         </div>
      </aside>
      <main className="admin-main">
         <div className="admin-header">
             <h1>Fraud Monitoring Overview</h1>
         </div>
         <Outlet />
      </main>
    </div>
    )
};

// --- ROUTE PROTECTION ---
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>; // Or a spinner
  if (!user) return <Navigate to={requiredRole === 'admin' ? '/admin/login' : '/login'} />;
  if (requiredRole && user.role !== requiredRole) {
      // Logged in but wrong role, redirect to their appropriate home
      return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/merchant'} />;
  }
  return children;
};


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin/login" element={<Login />} />
          
          {/* Redirect root to login for now */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Protected Merchant Routes */}
          <Route element={<PrivateRoute requiredRole="merchant"><MerchantLayout /></PrivateRoute>}>
             <Route path="/merchant" element={<PaymentForm />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<PrivateRoute requiredRole="admin"><AdminLayout /></PrivateRoute>}>
             <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;