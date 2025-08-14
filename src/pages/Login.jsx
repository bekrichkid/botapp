import React, { useState } from 'react';
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

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
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
      // Simulate API call to backend
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Dispatch login action to Redux store
        dispatch(login({
          user: data.user,
          token: data.token
        }));
        
        // Navigate to dashboard
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

  const handleTelegramLogin = () => {
    // Get bot info from environment variables
    const botUsername = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'SignUp_MarsBot';
    const origin = encodeURIComponent(window.location.origin);
    
    // Create Telegram auth URL
    const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=6412343716&origin=${origin}&return_to=${origin}/auth/telegram/callback&request_access=write`;
    
    // Open Telegram auth in popup
    const popup = window.open(
      telegramAuthUrl,
      'telegram-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    
    // Listen for popup close and handle auth result
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        // Handle successful auth (you might want to check URL params or local storage)
        console.log('Telegram auth completed');
      }
    }, 1000);
  };

  // Handle Telegram widget callback (if using widget instead of popup)
  window.onTelegramAuth = (user) => {
    console.log('Telegram user data:', user);
    // Process telegram login
    dispatch(login({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url
      },
      token: user.hash // Use appropriate token from your backend
    }));
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '-2s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '-4s'}}></div>
        </div>

        {/* Illustration Content */}
        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12 w-full">
          {/* Logo/Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl flex items-center justify-center animate-bounce">
              <span className="mars text-4xl font-bold">
                Mars<span className="text-orange-400">hub</span>
              </span>
            </div>
          </div>

          {/* Welcome Text */}
          <h1 className="text-5xl font-bold mb-6 text-center">
            Welcome Back!
          </h1>
          <p className="text-xl text-white/90 text-center mb-8 leading-relaxed">
            Sign in to access your account and continue your shopping journey
          </p>

          {/* Features */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-shield-alt text-sm"></i>
              </div>
              <span className="text-lg">Secure Login</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-bolt text-sm"></i>
              </div>
              <span className="text-lg">Quick Access</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fas fa-heart text-sm"></i>
              </div>
              <span className="text-lg">Personalized Experience</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">10K+</div>
              <div className="text-sm text-white/80">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400">99%</div>
              <div className="text-sm text-white/80">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="mars text-3xl font-bold">
              Mars<span className="text-orange-500">hub</span>
            </h1>
          </div>

          {/* Form Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your credentials to access your account</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  <i className="fas fa-envelope mr-2 text-blue-600"></i>Email Address
                </span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className={`input input-bordered w-full bg-white ${errors.email ? 'input-error' : 'border-gray-300 focus:border-blue-600'}`}
                disabled={isLoading}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.email}</span>
                </label>
              )}
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium text-gray-700">
                  <i className="fas fa-lock mr-2 text-blue-600"></i>Password
                </span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className={`input input-bordered w-full bg-white pr-12 ${errors.password ? 'input-error' : 'border-gray-300 focus:border-blue-600'}`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.password}</span>
                </label>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="label cursor-pointer">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm mr-2" />
                <span className="label-text text-sm text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="link link-primary text-sm">
                Forgot password?
              </Link>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="alert alert-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{errors.submit}</span>
              </div>
            )}

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`btn btn-primary w-full text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isLoading ? 'loading' : ''}`}
            >
              {!isLoading && <i className="fas fa-sign-in-alt mr-2"></i>}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="divider my-6">
            <span className="text-gray-500 text-sm">Or continue with</span>
          </div>

          {/* Telegram Login Button */}
          <button
            onClick={handleTelegramLogin}
            className="btn w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105 mb-4"
          >
            <i className="fab fa-telegram-plane mr-3 text-xl"></i>
            Sign in with Telegram
          </button>

          {/* Social Login Options */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button className="btn btn-outline btn-sm rounded-xl border-gray-300 hover:border-blue-600">
              <i className="fab fa-google text-red-500 mr-2"></i>
              Google
            </button>
            <button className="btn btn-outline btn-sm rounded-xl border-gray-300 hover:border-blue-600">
              <i className="fab fa-apple text-gray-800 mr-2"></i>
              Apple
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="link link-primary font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;