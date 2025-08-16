// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';

const PROD_HOSTS = [
  'one063development.onrender.com',
  'ecommerce-client-1063.onrender.com',
  // agar keyin custom domen bo'lsa shu yerga qo'sh
];

const hostname = window.location.hostname;
const isDevelopment =
  hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('localhost');
const isProduction = PROD_HOSTS.includes(hostname);

// ⚙️ CONFIG
const CONFIG = {
  development: {
    apiUrl: 'http://localhost:8000',
    telegramTest: true,
    domain: 'localhost:5173', // yoki 3000 — front dev porting
  },
  production: {
    apiUrl: 'https://one063development.onrender.com', // BACKEND Render URL (o'zingniki)
    telegramTest: false,
    domain: 'one063development.onrender.com', // faqat HOSTNAME (https:// YO'Q!)
  },
};

const currentConfig = isDevelopment ? CONFIG.development : CONFIG.production;

// 🤖 Telegram
const TELEGRAM_CONFIG = {
  botUsername: 'SignUp_MarsBot',
  botId: '6412343716',
  widgetSrc: 'https://telegram.org/js/telegram-widget.js?22',
  domain: currentConfig.domain, // hostname only
};

const cleanDomain = (TELEGRAM_CONFIG.domain || '').replace(/^https?:\/\//, '');

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [telegramWidgetLoaded, setTelegramWidgetLoaded] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🔐 Render Telegram widget into a container (NOT <head>)
  useEffect(() => {
    if (isDevelopment) return;

    const container = document.getElementById('tg-login-container');
    if (!container) return;
    container.innerHTML = '';

    const s = document.createElement('script');
    s.src = TELEGRAM_CONFIG.widgetSrc;
    s.async = true;
    s.setAttribute('data-telegram-login', TELEGRAM_CONFIG.botUsername);
    s.setAttribute('data-size', 'large');
    s.setAttribute('data-request-access', 'write');
    s.setAttribute('data-onauth', 'onTelegramAuth(user)');
    s.onload = () => setTelegramWidgetLoaded(true);
    s.onerror = () => {
      setTelegramWidgetLoaded(false);
      setErrors((e) => ({ ...e, telegram: 'Failed to load Telegram service' }));
    };

    container.appendChild(s);

    window.onTelegramAuth = (user) => {
      handleTelegramAuthSuccess(user);
    };

    return () => {
      container.innerHTML = '';
      if (window.onTelegramAuth) delete window.onTelegramAuth;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDevelopment, isProduction, TELEGRAM_CONFIG.botUsername, TELEGRAM_CONFIG.widgetSrc]);

  // 📩 Parent listens for popup OAuth callback (optional fallback path)
  useEffect(() => {
    const onMessage = (evt) => {
      if (!evt?.data || evt.data.type !== 'tg_oauth') return;
      handleTelegramAuthSuccess(evt.data.payload);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Handle Telegram auth in frontend then POST to backend
  const handleTelegramAuthSuccess = async (telegramUser) => {
    setIsLoading(true);
    try {
      const apiUrl = `${currentConfig.apiUrl}/api/v1/auth/telegram-login`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramData: telegramUser }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ submit: data.message || 'Telegram login failed' });
        return;
      }
      dispatch(login({ user: data.user, token: data.token }));
      setErrors({});
      navigate('/');
    } catch (e) {
      setErrors({ submit: `Network error: ${e.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  // 🧪 Mock dev login
  const mockTelegramLogin = () => {
    setIsLoading(true);
    const mockUser = {
      id: Math.floor(Math.random() * 1e9),
      first_name: 'John',
      username: `user_${Date.now()}`,
      auth_date: Math.floor(Date.now() / 1000),
      hash: `mock_${Date.now()}`,
    };
    setTimeout(() => handleTelegramAuthSuccess(mockUser), 1200);
  };

  // 🧭 OAuth fallback (popup)
  const handleTelegramLogin = () => {
    setErrors((p) => ({ ...p, submit: '', telegram: '' }));

    if (isDevelopment) return mockTelegramLogin();
    if (!isProduction) {
      setErrors({ submit: 'Telegram login only works on the production domain' });
      return;
    }
    if (!telegramWidgetLoaded) {
      setErrors({ submit: 'Telegram service is loading. Try again in a moment.' });
      return;
    }

    const origin = `https://${cleanDomain}`;
    const returnTo = `${origin}/telegram/callback`;
    const authUrl =
      `https://oauth.telegram.org/auth?bot_id=${TELEGRAM_CONFIG.botId}` +
      `&origin=${encodeURIComponent(origin)}` +
      `&return_to=${encodeURIComponent(returnTo)}` +
      `&request_access=write`;

    const popup = window.open(
      authUrl,
      'telegram-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,status=no'
    );
    if (!popup) {
      setErrors({ submit: 'Popup blocked. Allow popups and try again.' });
    }
  };

  // 📧 Email/password login
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      const apiUrl = `${currentConfig.apiUrl}/api/v1/auth/login`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ submit: data.message || 'Login failed' });
        return;
      }
      dispatch(login({ user: data.user, token: data.token }));
      navigate('/');
    } catch (e) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* background blobs (optional) */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left banner */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 w-full">
            <div className="mb-8 relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10">
                  <span className="text-2xl font-bold">
                    Mars<span className="text-orange-400">hub</span>
                  </span>
                </div>
              </div>
            </div>
            <h1 className="text-6xl font-extrabold mb-4 text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Welcome Back!
            </h1>
            <p className="text-xl text-white/90 text-center mb-8 leading-relaxed max-w-md">
              Sign in to discover amazing products and exclusive deals waiting for you
            </p>
          </div>
        </div>

        {/* Right form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-4xl font-bold">
                Mars<span className="text-orange-500">hub</span>
              </h1>
              <p className="text-gray-600 mt-2">Your Premium Shopping Destination</p>
            </div>

            {isDevelopment && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-400 rounded-lg text-center">
                <p className="text-blue-800 text-sm">
                  🧪 <strong>Development Mode</strong> - Telegram login simulated
                </p>
              </div>
            )}
            {isProduction && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 rounded-lg text-center">
                <p className="text-green-800 text-sm">
                  🚀 <strong>Production Mode</strong> - Real Telegram login
                </p>
              </div>
            )}

            <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-gray-100 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className="fas fa-user text-2xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Please sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700 flex items-center">
                        <i className="fas fa-envelope mr-2 text-purple-600"></i>Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      className={`input input-bordered w-full bg-gray-50 border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                        errors.email
                          ? 'border-red-400 focus:border-red-500'
                          : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <label className="label">
                        <span className="label-text-alt text-red-500">{errors.email}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700 flex items-center">
                        <i className="fas fa-lock mr-2 text-purple-600"></i>Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={`input input-bordered w-full bg-gray-50 border-2 transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                          errors.password
                            ? 'border-red-400 focus:border-red-500'
                            : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-600"
                        disabled={isLoading}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <label className="label">
                        <span className="label-text-alt text-red-500">{errors.password}</span>
                      </label>
                    )}
                  </div>

                  {errors.submit && (
                    <div className="alert alert-error bg-red-50 border-red-200 text-red-800">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 ${
                      isLoading ? 'loading' : 'hover:scale-105'
                    }`}
                  >
                    {!isLoading && <i className="fas fa-sign-in-alt mr-2"></i>}
                    {isLoading ? 'Signing in...' : 'Sign In to Shop'}
                  </button>
                </form>

                <div className="divider my-8">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold text-sm">
                    Or continue with
                  </span>
                </div>

                {/* Telegram button area */}
                <div className="mb-4">
                  <button
                    onClick={handleTelegramLogin}
                    disabled={isLoading}
                    className={`btn w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                      isLoading ? 'loading' : 'hover:scale-105'
                    }`}
                  >
                    {!isLoading && <i className="fab fa-telegram-plane mr-3 text-xl"></i>}
                    {isLoading ? 'Connecting...' : isDevelopment ? 'Test Telegram Login' : 'Continue with Telegram'}
                  </button>

                  {!isDevelopment && (
                    <div className="text-center mt-2">
                      {telegramWidgetLoaded ? (
                        <p className="text-sm text-green-600">
                          <i className="fas fa-check-circle mr-1"></i> Telegram service ready
                        </p>
                      ) : (
                        <p className="text-sm text-yellow-600">
                          <i className="fas fa-spinner fa-spin mr-1"></i> Loading Telegram service...
                        </p>
                      )}
                    </div>
                  )}

                  {errors.telegram && (
                    <p className="text-center text-sm text-red-600 mt-2">
                      <i className="fas fa-exclamation-triangle mr-1"></i>
                      {errors.telegram}
                    </p>
                  )}
                </div>

                {/* REAL widget renders here */}
                <div id="tg-login-container" className="flex justify-center mt-2" />

                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    New to Marshub?{' '}
                    <Link to="/register" className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Create your account
                    </Link>
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
