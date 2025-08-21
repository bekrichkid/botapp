import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../redux/slices/authSlice';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Telegram widget'ni dinamik yuklash
  useEffect(() => {
    if (window.Telegram && window.Telegram.Login) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    script.setAttribute('data-telegram-login', 'isroilbek_back_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    script.onload = () => {
      console.log('Telegram widget loaded');
    };

    document.head.appendChild(script);

    window.onTelegramAuth = (user) => {
      console.log('Telegram user data:', user);
      handleTelegramAuthSuccess(user);
    };

    return () => {
      const existingScript = document.querySelector('script[src*="telegram-widget"]');
      if (existingScript) {
        existingScript.remove();
      }
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, []);

  const handleTelegramAuthSuccess = async (telegramUser) => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/telegram-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramData: telegramUser
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(register({
          user: data.user,
          token: data.token
        }));
        navigate('/');
      } else {
        setErrors({ submit: data.message || 'Telegram registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error during Telegram registration' });
    } finally {
      setIsLoading(false);
    }
  };

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

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

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

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(register({
          user: data.user,
          token: data.token
        }));
        navigate('/');
      } else {
        setErrors({ submit: data.message || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTelegramLogin = () => {
    const botId = '7538109815';
    const botUsername = 'isroilbek_back_bot';
    const origin = encodeURIComponent(window.location.origin);

    const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&return_to=${origin}/auth/telegram/callback&request_access=write`;

    const popup = window.open(
      telegramAuthUrl,
      'telegram-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );

    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        console.log('Telegram auth popup closed');
      }
    }, 1000);
  };

  window.onTelegramAuth = (user) => {
    console.log('Telegram user data:', user);
    dispatch(register({
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        username: user.username,
        photoUrl: user.photo_url
      },
      token: user.hash
    }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-bounce"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-400/30 rounded-lg rotate-45 animate-spin" style={{animationDuration: '8s'}}></div>
            <div className="absolute bottom-20 left-20 w-12 h-12 bg-pink-400/30 rounded-full animate-ping"></div>
            <div className="absolute bottom-40 right-10 w-8 h-8 bg-green-400/30 rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center animate-float backdrop-blur-sm">
              <i className="fas fa-shopping-cart text-2xl text-white"></i>
            </div>
            <div className="absolute top-1/3 right-1/4 w-14 h-14 bg-orange-400/30 rounded-xl flex items-center justify-center animate-float backdrop-blur-sm" style={{animationDelay: '-1s'}}>
              <i className="fas fa-gift text-xl text-white"></i>
            </div>
            <div className="absolute bottom-1/3 left-1/3 w-12 h-12 bg-pink-400/30 rounded-lg flex items-center justify-center animate-float backdrop-blur-sm" style={{animationDelay: '-2s'}}>
              <i className="fas fa-heart text-lg text-white"></i>
            </div>
          </div>

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
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse"></div>
            </div>

            <h1 className="text-6xl font-extrabold mb-4 text-center bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Join Us!
            </h1>
            <p className="text-xl text-white/90 text-center mb-8 leading-relaxed max-w-md">
              Create an account to explore amazing products and exclusive deals
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-center mb-2">Secure Signup</h3>
                <p className="text-sm text-white/80 text-center">Bank-level security</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-bolt text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-center mb-2">Quick Access</h3>
                <p className="text-sm text-white/80 text-center">Lightning fast</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-crown text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-center mb-2">Premium Deals</h3>
                <p className="text-sm text-white/80 text-center">Exclusive offers</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
                  <i className="fas fa-heart text-white text-xl"></i>
                </div>
                <h3 className="font-semibold text-center mb-2">Wishlist</h3>
                <p className="text-sm text-white/80 text-center">Save favorites</p>
              </div>
            </div>

            <div className="flex justify-center space-x-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-1">50K+</div>
                <div className="text-sm text-white/80">Happy Shoppers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-1">99.9%</div>
                <div className="text-sm text-white/80">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400 mb-1">4.9★</div>
                <div className="text-sm text-white/80">Rating</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden text-center mb-8">
              <h1 className="mars text-4xl font-bold">
                Mars<span className="text-orange-500">hub</span>
              </h1>
              <p className="text-gray-600 mt-2">Your Premium Shopping Destination</p>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-lg border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-100 to-transparent rounded-bl-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-100 to-transparent rounded-tr-full"></div>

              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <i className="fas fa-user-plus text-2xl text-white"></i>
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                  <p className="text-gray-600">Join Marshub today!</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700 flex items-center">
                        <i className="fas fa-user mr-2 text-purple-600"></i>Username
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="Enter your username"
                        className={`input input-bordered w-full bg-gray-50 border-2 transition-all text-black duration-300 focus:bg-white focus:scale-105 ${
                          errors.username 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                        }`}
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <i className="fas fa-user text-gray-400"></i>
                      </div>
                    </div>
                    {errors.username && (
                      <label className="label">
                        <span className="label-text-alt text-red-500 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.username}
                        </span>
                      </label>
                    )}
                  </div>

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
                        className={`input input-bordered w-full bg-gray-50 border-2 transition-all text-black duration-300 focus:bg-white focus:scale-105 ${
                          errors.email 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                        }`}
                        disabled={isLoading}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <i className="fas fa-at text-gray-400"></i>
                      </div>
                    </div>
                    {errors.email && (
                      <label className="label">
                        <span className="label-text-alt text-red-500 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.email}
                        </span>
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
                        className={`input input-bordered w-full bg-gray-50 border-2 text-black transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                          errors.password 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && (
                      <label className="label">
                        <span className="label-text-alt text-red-500 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.password}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold text-gray-700 flex items-center">
                        <i className="fas fa-lock mr-2 text-purple-600"></i>Confirm Password
                      </span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        className={`input input-bordered w-full bg-gray-50 border-2 text-black transition-all duration-300 focus:bg-white focus:scale-105 pr-12 ${
                          errors.confirmPassword 
                            ? 'border-red-400 focus:border-red-500' 
                            : 'border-gray-200 focus:border-purple-500 hover:border-purple-300'
                        }`}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-600 transition-colors duration-200"
                        disabled={isLoading}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <label className="label">
                        <span className="label-text-alt text-red-500 flex items-center">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {errors.confirmPassword}
                        </span>
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
                    {!isLoading && <i className="fas fa-user-plus mr-2"></i>}
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>

                <div className="divider my-8">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-semibold text-sm">
                    Or continue with
                  </span>
                </div>

                <div className="mb-4">
                  <button
                    onClick={handleTelegramLogin}
                    className="btn w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-0 hover:scale-105"
                  >
                    <i className="fab fa-telegram-plane mr-3 text-xl"></i>
                    Continue with Telegram
                  </button>
                  <div id="telegram-login-widget" className="hidden"></div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button className="btn btn-outline border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 rounded-xl py-3 transition-all duration-300 hover:scale-105">
                    <i className="fab fa-google text-red-500 mr-2"></i>
                    <span className="text-gray-700">Google</span>
                  </button>
                  <button className="btn btn-outline border-2 border-gray-200 hover:border-gray-800 hover:bg-gray-50 rounded-xl py-3 transition-all duration-300 hover:scale-105">
                    <i className="fab fa-apple text-gray-800 mr-2"></i>
                    <span className="text-gray-700">Apple</span>
                  </button>
                </div>

                <div className="text-center pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-semibold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 transition-all duration-300"
                    >
                      Sign in here
                    </Link>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Join thousands of happy shoppers today!</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <div className="flex justify-center items-center space-x-6 text-gray-500 text-sm">
                <div className="flex items-center">
                  <i className="fas fa-shield-alt mr-2 text-green-500"></i>
                  <span>Secure</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-lock mr-2 text-blue-500"></i>
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-certificate mr-2 text-purple-500"></i>
                  <span>Verified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default Register;