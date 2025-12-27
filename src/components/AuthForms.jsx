import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginUser, registerMerchant } from '../services/api';

export const Login = () => {
  const [formData, setData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const isAdminRoute = location.pathname.includes('admin');
  const roleTarget = isAdminRoute ? 'admin' : 'merchant';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await loginUser(formData.username, formData.password, roleTarget);
      login(user);
      navigate(isAdminRoute ? '/admin/dashboard' : '/merchant');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={handleSubmit}>
        <h2>{isAdminRoute ? 'Admin Portal' : 'Merchant Login'}</h2>
        {error && <p style={{color:'red', fontSize:'0.9rem'}}>{error}</p>}
        <input type="text" placeholder="Username" required value={formData.username} onChange={e=>setData({...formData, username:e.target.value})} />
        <input type="password" placeholder="Password" required value={formData.password} onChange={e=>setData({...formData, password:e.target.value})} />
        <button type="submit" className="btn-primary">Login</button>
        {!isAdminRoute && (
           <div className="auth-link">New here? <Link to="/signup">Create Account</Link></div>
        )}
      </form>
    </div>
  );
};

export const Signup = () => {
    const [formData, setData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      try {
        const user = await registerMerchant(formData.username, formData.password);
        login(user);
        // Add some dummy data for this new user automatically so admin has something to see
        import('../services/api').then(mod => {
             mod.analyzeRisk({Amount: 150.00, V1: 0.5}, user);
             mod.analyzeRisk({Amount: 9500.00, V1: -2.5}, user);
        });
        navigate('/merchant');
      } catch (err) {
        setError(err.message);
      }
    };
  
    return (
      <div className="auth-container">
        <form className="auth-box" onSubmit={handleSubmit}>
          <h2>Create Merchant Account</h2>
          {error && <p style={{color:'red', fontSize:'0.9rem'}}>{error}</p>}
          <input type="text" placeholder="Username" required value={formData.username} onChange={e=>setData({...formData, username:e.target.value})} />
          <input type="password" placeholder="Password" required value={formData.password} onChange={e=>setData({...formData, password:e.target.value})} />
          <button type="submit" className="btn-primary">Sign Up</button>
          <div className="auth-link">Already have an account? <Link to="/login">Login</Link></div>
        </form>
      </div>
    );
  };