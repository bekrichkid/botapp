import React, { useState } from 'react';

// ProfileImage component
const ProfileImage = ({ 
  src, 
  alt = "Profile", 
  size = "w-24 h-24", 
  fallbackText = "U",
  className = "" 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  if (!src || imageError) {
    return (
      <div className={`${size} ${className} bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-xl`}>
        {fallbackText.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div className={`${size} ${className} relative`}>
      {imageLoading && (
        <div className={`${size} bg-gray-200 rounded-full animate-pulse flex items-center justify-center`}>
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`${size} rounded-full object-cover shadow-xl border-4 border-white ${imageLoading ? 'hidden' : 'block'}`}
      />
    </div>
  );
};

const UserProfile = () => {
  // Mock user data - replace with your actual state management
  const [user, setUser] = useState({
    id: '12345',
    firstName: 'John',
    lastName: 'Doe',
    username: 'johndoe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    photoUrl: 'https://t.me/i/userpic/320/invalid-url.jpg', // This will trigger fallback
    authMethod: 'telegram',
    telegramId: '123456789',
    isVerified: true,
    createdAt: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T15:45:00Z'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form data if canceling
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // Update user data
    setUser(prev => ({
      ...prev,
      ...formData
    }));
    setIsEditing(false);
    console.log('User data updated:', formData);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAuthMethodIcon = (method) => {
    switch (method) {
      case 'telegram':
        return <i className="fab fa-telegram-plane text-blue-500"></i>;
      case 'email':
        return <i className="fas fa-envelope text-gray-500"></i>;
      case 'google':
        return <i className="fab fa-google text-red-500"></i>;
      default:
        return <i className="fas fa-user text-gray-500"></i>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            
            {/* Profile Image */}
            <div className="relative">
              <ProfileImage
                src={user.photoUrl}
                alt={`${user.firstName} ${user.lastName}`}
                size="w-24 h-24"
                fallbackText={user.firstName || user.username || 'U'}
                className="ring-4 ring-white ring-offset-4 ring-offset-transparent"
              />
              
              {/* Verification Badge */}
              {user.isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                  <i className="fas fa-check text-white text-xs"></i>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-center sm:text-left flex-1">
              <h1 className="text-3xl font-bold mb-2">
                {user.firstName} {user.lastName}
              </h1>
              
              {user.username && (
                <p className="text-lg opacity-90 mb-2">@{user.username}</p>
              )}

              <div className="flex items-center justify-center sm:justify-start space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 backdrop-blur-sm">
                  {getAuthMethodIcon(user.authMethod)}
                  <span className="ml-2 capitalize">{user.authMethod}</span>
                </span>

                {user.isVerified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 bg-opacity-20 backdrop-blur-sm">
                    <i className="fas fa-shield-alt mr-2"></i>
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={handleEditToggle}
                  className="bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    <i className="fas fa-save mr-2"></i>
                    Save
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    <i className="fas fa-times mr-2"></i>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <i className="fas fa-user-circle mr-3 text-purple-600"></i>
                Profile Information
              </h2>

              <div className="space-y-6">
                
                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                      {user.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl">
                      {user.lastName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl flex items-center">
                      <i className="fas fa-envelope mr-3 text-gray-400"></i>
                      {user.email || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                  ) : (
                    <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl flex items-center">
                      <i className="fas fa-phone mr-3 text-gray-400"></i>
                      {user.phone || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Username (Read-only) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <p className="text-lg text-gray-900 bg-gray-50 px-4 py-3 rounded-xl flex items-center">
                    <i className="fas fa-at mr-3 text-gray-400"></i>
                    {user.username || 'Not set'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Sidebar */}
          <div className="space-y-6">
            
            {/* Account Details */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-info-circle mr-3 text-blue-600"></i>
                Account Details
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">User ID</span>
                  <span className="text-sm text-gray-900 font-mono">{user.id}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Auth Method</span>
                  <div className="flex items-center">
                    {getAuthMethodIcon(user.authMethod)}
                    <span className="ml-2 text-sm text-gray-900 capitalize">{user.authMethod}</span>
                  </div>
                </div>

                {user.telegramId && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Telegram ID</span>
                    <span className="text-sm text-gray-900 font-mono">{user.telegramId}</span>
                  </div>
                )}

                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Status</span>
                  <span className={`text-sm font-medium ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                    {user.isVerified ? 'Verified' : 'Unverified'}
                  </span>
                </div>

                <div className="pt-2">
                  <span className="text-sm font-medium text-gray-600">Member Since</span>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(user.createdAt)}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-600">Last Login</span>
                  <p className="text-sm text-gray-900 mt-1">{formatDate(user.lastLogin)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <i className="fas fa-bolt mr-3 text-yellow-600"></i>
                Quick Actions
              </h3>

              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center">
                  <i className="fas fa-key mr-3 text-gray-400"></i>
                  <span className="text-sm font-medium text-gray-700">Change Password</span>
                </button>

                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center">
                  <i className="fas fa-shield-alt mr-3 text-gray-400"></i>
                  <span className="text-sm font-medium text-gray-700">Security Settings</span>
                </button>

                <button className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 flex items-center">
                  <i className="fas fa-bell mr-3 text-gray-400"></i>
                  <span className="text-sm font-medium text-gray-700">Notifications</span>
                </button>

                <button className="w-full text-left p-3 rounded-xl hover:bg-red-50 transition-colors duration-200 flex items-center text-red-600">
                  <i className="fas fa-sign-out-alt mr-3"></i>
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;