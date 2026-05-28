import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiUser, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginSuccess } from '../store/authSlice';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleCredentialResponse = async (response) => {
    setGoogleLoading(true);
    setError(null);
    try {
      const decoded = decodeJwt(response.credential);
      if (decoded) {
        const { name, email, picture } = decoded;
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/google-login`, {
          name,
          email,
          picture,
        });
        dispatch(loginSuccess(data));
        navigate('/');
      } else {
        setError('Failed to decode Google signup details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Google authentication failed on server.');
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }

    // Initialize Google Sign-In SDK
    try {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID_HERE",
          callback: handleCredentialResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById("googleSignUpDiv"),
          { theme: "outline", size: "large", width: 384, shape: "pill" }
        );
      }
    } catch (e) {
      console.warn('Google SDK could not be initialized:', e);
    }
  }, [userInfo, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/register`, {
        name,
        email,
        password,
      });
      dispatch(loginSuccess(data));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register account');
    } finally {
      setLoading(false);
    }
  };

  const handleFallbackGoogleRegister = () => {
    setGoogleLoading(true);
    setError(null);

    setTimeout(() => {
      const mockGoogleUser = {
        _id: 'google_user_123',
        name: 'Alex Mercer',
        email: 'alex.mercer@gmail.com',
        isAdmin: false,
        token: 'google_mock_token_jwt_998877',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      };
      dispatch(loginSuccess(mockGoogleUser));
      setGoogleLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-rose-50 via-slate-50 to-pink-50 flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-md rounded-3xl shadow-xl border border-white/50 p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-pink-600"></div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-950 tracking-tight">Create Account</h2>
            <p className="text-gray-500 mt-2 text-sm font-medium">Register now and explore unlimited shop options.</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl mb-6 flex items-center gap-3 text-sm font-semibold animate-pulse">
              <FiAlertCircle className="text-lg flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <FiUser size={18} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <FiMail size={18} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <FiLock size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                  <FiLock size={18} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-primary text-white py-3.5 rounded-full font-extrabold text-sm hover:bg-red-600 transition shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:shadow-none cursor-pointer mt-4"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <span className="absolute inset-x-0 top-1/2 -z-10 h-px bg-gray-200"></span>
            <span className="bg-white/90 backdrop-blur px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Or</span>
          </div>

          {/* Official Google Sign-In Button Container */}
          <div className="flex justify-center mb-4">
            <div id="googleSignUpDiv" className="w-full max-w-sm flex justify-center"></div>
          </div>


          <p className="text-center text-sm text-gray-600 mt-8 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
