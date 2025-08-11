import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Phone, MapPin, CheckCircle, AlertCircle, Facebook, Linkedin } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  address?: string;
  phone?: string;
}

interface FormErrors {
  [key: string]: string;
}

const MediCoAuth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    }
  }, [formData.password]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.address?.trim()) {
        newErrors.address = 'Address is required';
      }

      if (!formData.phone?.trim()) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setSuccessMessage('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccessMessage(isSignUp ? 'Account created successfully!' : 'Welcome back!');
      
      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          address: '',
          phone: ''
        });
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      phone: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength <= 1) return 'bg-red-500';
    if (passwordStrength <= 2) return 'bg-orange-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    if (passwordStrength <= 4) return 'bg-green-400';
    return 'bg-green-600';
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength <= 1) return 'Weak';
    if (passwordStrength <= 2) return 'Fair';
    if (passwordStrength <= 3) return 'Good';
    if (passwordStrength <= 4) return 'Strong';
    return 'Very Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-lg z-50">
        <div className="flex items-center px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">W</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
              WeedWise
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-20">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="flex min-h-[600px]">
            {/* Form Section */}
            <div className={`flex-1 transition-all duration-500 ${isSignUp ? 'order-2' : 'order-1'}`}>
              <div className="p-8 h-full flex flex-col justify-center">
                <div className="max-w-sm mx-auto w-full">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                  </h2>
                  
                  {/* Social Login */}
                  <div className="flex justify-center space-x-4 mb-6">
                    <button className="p-3 border border-gray-300 rounded-full hover:bg-green-50 transition-colors">
                      <Facebook className="w-5 h-5 text-green-600" />
                    </button>
                    <button className="p-3 border border-gray-300 rounded-full hover:bg-green-50 transition-colors">
                      <div className="w-5 h-5 bg-gradient-to-r from-green-500 to-green-600 rounded"></div>
                    </button>
                    <button className="p-3 border border-gray-300 rounded-full hover:bg-green-50 transition-colors">
                      <Linkedin className="w-5 h-5 text-green-600" />
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 text-center mb-6">
                    or use your email {isSignUp ? 'for registration' : 'and password'}
                  </p>

                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {successMessage}
                    </div>
                  )}

                  {/* General Error */}
                  {errors.general && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                      <AlertCircle className="w-5 h-5 mr-2" />
                      {errors.general}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      {/* Name Field */}
                      <div>
                        <div className="relative">
                          <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                            }`}
                          />
                        </div>
                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                      </div>

                      {/* Email Field */}
                      <div>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="example@weedwise.com"
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                            }`}
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                      </div>

                      {/* Password Field */}
                      <div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                              errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        
                        {/* Password Strength Indicator */}
                        {isSignUp && formData.password && (
                          <div className="mt-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sign Up Additional Fields */}
                      {isSignUp && (
                        <>
                          {/* Confirm Password */}
                          <div>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm Password"
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                              >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                          </div>

                          {/* Address */}
                          <div>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                  errors.address ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                              />
                            </div>
                            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                          </div>

                          {/* Phone */}
                          <div>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                              <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Phone Number"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50'
                                }`}
                              />
                            </div>
                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                          </div>
                        </>
                      )}

                      {/* Forgot Password Link (Sign In Only) */}
                      {!isSignUp && (
                        <div className="text-right">
                          <button
                            type="button"
                            className="text-sm text-green-600 hover:text-green-800 transition-colors"
                          >
                            Forgot Password?
                          </button>
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          isSignUp ? 'Create Account' : 'Sign In'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Toggle Section */}
            <div className={`flex-1 bg-gradient-to-br from-green-600 to-green-700 text-white flex items-center justify-center transition-all duration-500 ${
              isSignUp ? 'order-1' : 'order-2'
            }`}>
              <div className="text-center p-8">
                <h2 className="text-3xl font-bold mb-4">
                  {isSignUp ? 'Welcome Back!' : 'Hello, Friend!'}
                </h2>
                <p className="mb-8 text-green-100">
                  {isSignUp 
                    ? 'To keep connected with us please login with your personal info'
                    : 'Register with your personal details to use all of site features'
                  }
                </p>
                <button
                  onClick={toggleMode}
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/90 backdrop-blur-md border-t border-gray-200">
        <div className="text-center py-4 text-gray-600 text-sm">
          © 2024 WeedWise. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default MediCoAuth;