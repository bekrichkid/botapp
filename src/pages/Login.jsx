// 🚀 PRODUCTION-READY Login.jsx for Render.com

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../redux/slices/authSlice';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [telegramWidgetLoaded, setTelegramWidgetLoaded] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 🌍 ENVIRONMENT DETECTION
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('localhost');

  const isProduction = window.location.hostname === 'ecommerce-client-1063.onrender.com';

  // 🔧 CONFIGURATION
  const CONFIG = {
    development: {
      apiUrl: 'http://localhost:8000',
      telegramTest: true,
      domain: 'localhost:3000'
    },
    production: {
      apiUrl: 'https://one063development.onrender.com', // 🚨 Backend URL'ni o'zgartiring
      telegramTest: false,
      domain: 'https://one063development.onrender.com'
    }
  };

  const currentConfig = isDevelopment ? CONFIG.development : CONFIG.production;

  // 📱 TELEGRAM CONFIGURATION
  const TELEGRAM_CONFIG = {
    botUsername: 'SignUp_MarsBot',
    botId: '6412343716', // Bot ID'ni BotFather'dan oling
    widgetSrc: 'https://telegram.org/js/telegram-widget.js?22',
    domain: currentConfig.domain
  };

  // Telegram widget'ni yuklash
  useEffect(() => {
    console.log(`🌍 Environment: ${isDevelopment ? 'Development' : 'Production'}`);
    console.log(`🔗 Domain: ${TELEGRAM_CONFIG.domain}`);
    console.log(`🤖 Bot: @${TELEGRAM_CONFIG.botUsername}`);

    if (isDevelopment) {
      console.log('🧪 Development mode - Using mock Telegram');
      return;
    }

    if (!isProduction) {
      console.log('⚠️ Unknown domain - Telegram may not work');
    }

    // Check if Telegram script already loaded
    if (window.Telegram && window.Telegram.Login) {
      console.log('✅ Telegram widget already loaded');
      setTelegramWidgetLoaded(true);
      return;
    }

    console.log('📥 Loading Telegram widget...');

    const script = document.createElement('script');
    script.src = TELEGRAM_CONFIG.widgetSrc;
    script.async = true;
    script.setAttribute('data-telegram-login', TELEGRAM_CONFIG.botUsername);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    
    script.onload = () => {
      console.log('✅ Telegram widget loaded successfully');
      setTelegramWidgetLoaded(true);
    };

    script.onerror = (error) => {
      console.error('❌ Telegram widget failed to load:', error);
      setTelegramWidgetLoaded(false);
      setErrors(prev => ({
        ...prev,
        telegram: 'Failed to load Telegram service'
      }));
    };

    document.head.appendChild(script);

    // Global callback function
    window.onTelegramAuth = (user) => {
      console.log('📱 Telegram auth callback received:', user);
      handleTelegramAuthSuccess(user);
    };

    // Cleanup
    return () => {
      const existingScript = document.querySelector('script[src*="telegram-widget"]');
      if (existingScript) {
        existingScript.remove();
      }
      
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [isDevelopment, isProduction]);

  // 🎭 MOCK TELEGRAM LOGIN (Development only)
  const mockTelegramLogin = () => {
    console.log('🧪 Starting mock Telegram login...');
    setIsLoading(true);
    
    const mockUser = {
      id: Math.floor(Math.random() * 1000000),
      first_name: 'John',
      last_name: 'Doe',
      username: `user_${Date.now()}`,
      photo_url: 'https://via.placeholder.com/150',
      auth_date: Math.floor(Date.now() / 1000),
      hash: `mock_hash_${Date.now()}`
    };

    setTimeout(() => {
      console.log('✅ Mock Telegram login completed');
      handleTelegramAuthSuccess(mockUser);
    }, 2000);
  };

  // 📱 TELEGRAM AUTH SUCCESS HANDLER
  const handleTelegramAuthSuccess = async (telegramUser) => {
    console.log('🔄 Processing Telegram auth...', telegramUser);
    setIsLoading(true);
    
    try {
      const apiUrl = `${currentConfig.apiUrl}/api/v1/auth/telegram-login`;
      console.log('📤 Sending request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramData: telegramUser
        }),
      });

      const data = await response.json();
      console.log('📥 Backend response:', data);

      if (response.ok) {
        console.log('✅ Telegram login successful');
        
        dispatch(login({
          user: data.user,
          token: data.token
        }));
        
        // Clear any previous errors
        setErrors({});
        
        // Navigate to home
        navigate('/');
      } else {
        console.error('❌ Backend error:', data);
        setErrors({ submit: data.message || 'Telegram login failed' });
      }
    } catch (error) {
      console.error('🌐 Network error:', error);
      setErrors({ 
        submit: `Network error: ${error.message}. Check if backend is running.` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 📧 REGULAR LOGIN HANDLERS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const apiUrl = `${currentConfig.apiUrl}/api/v1/auth/login`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(login({
          user: data.user,
          token: data.token
        }));
        
        navigate('/');
      } else {
        setErrors({ submit: data.message || 'Login failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // 🎯 TELEGRAM LOGIN HANDLER
  const handleTelegramLogin = () => {
    console.log('🔄 Telegram login button clicked');
    
    // Clear previous errors
    setErrors(prev => ({ ...prev, submit: '', telegram: '' }));
    
    // Development mode - use mock
    if (isDevelopment) {
      console.log('🧪 Using mock Telegram login');
      mockTelegramLogin();
      return;
    }

    // Production mode checks
    if (!isProduction) {
      setErrors({ 
        submit: 'Telegram login only works on the production domain' 
      });
      return;
    }

    if (!telegramWidgetLoaded) {
      console.log('⚠️ Telegram widget not loaded yet');
      setErrors({ 
        submit: 'Telegram service is still loading. Please wait and try again.' 
      });
      return;
    }

    // Try OAuth fallback
    console.log('🚀 Opening Telegram OAuth...');
    
    const authUrl = `https://oauth.telegram.org/auth?bot_id=${TELEGRAM_CONFIG.botId}&origin=https://${TELEGRAM_CONFIG.domain}&return_to=https://${TELEGRAM_CONFIG.domain}/login&request_access=write`;
    
    console.log('🔗 OAuth URL:', authUrl);
    
    const popup = window.open(
      authUrl,
      'telegram-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,status=no'
    );
    
    if (!popup) {
      setErrors({ 
        submit: 'Popup blocked. Please allow popups and try again.' 
      });
      return;
    }

    // Monitor popup
    const checkClosed = setInterval(() => {
      try {
        if (popup.closed) {
          clearInterval(checkClosed);
          console.log('📱 Telegram auth popup closed');
          
          // Check URL for auth parameters
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('id')) {
            console.log('✅ Telegram auth data found in URL');
            const telegramData = {};
            for (const [key, value] of urlParams.entries()) {
              telegramData[key] = value;
            }
            handleTelegramAuthSuccess(telegramData);
          }
        }
      } catch (error) {
        // Cross-origin error is expected
      }
    }, 1000);

    // Timeout after 5 minutes
    setTimeout(() => {
      if (!popup.closed) {
        popup.close();
        clearInterval(checkClosed);
        console.log('⏰ Telegram auth timeout');
      }
    }, 300000);
  };

  // 🔍 DEBUG INFO
  useEffect(() => {
    if (isDevelopment) {
      console.log('🔍 Debug Info:', {
        hostname: window.location.hostname,
        isDevelopment,
        isProduction,
        currentConfig,
        telegramConfig: TELEGRAM_CONFIG
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Enhanced Illustration */}
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 relative overflow-hidden">
          {/* ... Left side content same as before ... */}
          <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 w-full">
            <div className="mb-8 relative">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10">
                  <span className="mars text-2xl font-bold">
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

        {/* Right Side - Enhanced Login Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="mars text-4xl font-bold">
                Mars<span className="text-orange-500">hub</span>
              </h1>
              <p className="text-gray-600 mt-2">Your Premium Shopping Destination</p>
            </div>

            {/* 🧪 ENVIRONMENT INDICATOR */}
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

            {/* Enhanced Form Container */}
            <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-gray-100 relative overflow-hidden">
              <div className="relative z-10">
                {/* Form Header */}
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className="fas fa-user text-2xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                  <p className="text-gray-600">Please sign in to your account</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email Input */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700 flex items-center">
                        <i className="fas fa-envelope mr-2 text-purple-600"></i>Email Address
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        className={`input input-bordered w-full bg-gray-50 border-2 transition-all duration-300 focus:bg-white focus:scale-105 ${
                          errors.email 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                        }`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.email && (
                      <label className="label">
                        <span className="label-text-alt text-red-500">{errors.email}</span>
                      </label>
                    )}
                  </div>

                  {/* Password Input */}
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
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600"
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

                  {/* Submit Error */}
                  {errors.submit && (
                    <div className="alert alert-error bg-red-50 border-red-200 text-red-800">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{errors.submit}</span>
                    </div>
                  )}

                  {/* Enhanced Sign In Button */}
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

                {/* 🎯 PRODUCTION-READY TELEGRAM BUTTON */}
                <div className="mb-4">
                  <button
                    onClick={handleTelegramLogin}
                    disabled={isLoading}
                    className={`btn w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 ${
                      isLoading ? 'loading' : 'hover:scale-105'
                    }`}
                  >
                    {!isLoading && <i className="fab fa-telegram-plane mr-3 text-xl"></i>}
                    {isLoading ? 'Connecting...' : 
                     isDevelopment ? 'Test Telegram Login' : 'Continue with Telegram'}
                  </button>
                  
                  {/* Status indicators */}
                  {!isDevelopment && (
                    <div className="text-center mt-2">
                      {telegramWidgetLoaded ? (
                        <p className="text-sm text-green-600">
                          <i className="fas fa-check-circle mr-1"></i>
                          Telegram service ready
                        </p>
                      ) : (
                        <p className="text-sm text-yellow-600">
                          <i className="fas fa-spinner fa-spin mr-1"></i>
                          Loading Telegram service...
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

                {/* Sign Up Link */}
                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    New to Marshub?{' '}
                    <Link 
                      to="/register" 
                      className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
                    >
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
};

export default Login;