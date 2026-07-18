import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  SparklesIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const RegisterModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return alert('Passwords do not match');
    }

    setLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    }
  };

  // Password strength
  const getPasswordStrength = () => {
    const pwd = formData.password;
    if (!pwd) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { level: 2, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { level: 3, label: 'Good', color: 'bg-blue-500' };
    return { level: 4, label: 'Strong', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength();

  if (!isOpen) return null;

  return (
    <>
      {/* Background Overlay */}
      <div 
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-8 animate-fade-in"
        onClick={onClose}
      >
        <div 
           className="w-full max-w-6xl w-[95%] xl:w-full h-[90vh] min-h-[600px] flex overflow-hidden rounded-[2.5rem] bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-fade-in-up relative"
           onClick={(e) => e.stopPropagation()}
        >
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white dark:bg-[#0B0F19] border-r border-gray-200 dark:border-gray-800/50">
        {/* Modern Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>
        
        {/* Radiant Glowing Blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -right-1/4 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 -left-1/4 w-[600px] h-[600px] bg-teal-600/15 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '5s', animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 flex flex-col p-3 lg:p-8 lg:p-10 w-full h-full justify-between">
          {/* Top: Logo */}
          <Link to="/" className="flex items-center gap-3 w-fit group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <SparklesIcon className="h-6 w-6 text-gray-900 dark:text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white drop-shadow-sm">Centrion</span>
          </Link>

          {/* Middle: Floating Dashboard Concept */}
          <div className="relative w-full max-w-[420px] mx-auto mt-6 mb-6 perspective-1000 transform scale-90 xxl:scale-100 origin-center transform scale-[0.85] xl:scale-95 origin-top">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl z-0"></div>

            {/* Main Dashboard Window */}
            <div className="relative z-10 bg-gray-50 dark:bg-[#111827]/80 backdrop-blur-2xl rounded-2xl border border-gray-200 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] overflow-hidden transform transition-transform hover:-translate-y-2 duration-700 hover:shadow-emerald-500/20">
              {/* Window Header */}
              <div className="h-8 bg-white dark:bg-gray-900/80 border-b border-gray-200 dark:border-white/5 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-[#EF4444] shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-[#F59E0B] shadow-sm"></div>
                <div className="w-3 h-3 rounded-full bg-[#10B981] shadow-sm"></div>
              </div>
              <div className="p-4 lg:p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                      New Project Setup
                      <span className="relative flex h-2.5 w-2.5 ml-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-xs mt-0.5">Automated workflow generation</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                    Step 2/3
                  </div>
                </div>
                
                {/* Mock Chart/Creation Visual */}
                <div className="flex items-end gap-1.5 h-16 xl:h-20 mb-3 lg:mb-4">
                  {[30, 45, 60, 50, 80, 70, 95, 85, 100, 75, 90, 65].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-emerald-600/20 to-emerald-400/80 rounded-t-sm relative group transition-all hover:brightness-125 hover:-translate-y-1" style={{ height: `${h}%` }}>
                      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                    </div>
                  ))}
                </div>

                {/* Mock List */}
                <div className="space-y-2">
                  {[
                    { c: 'emerald', t: 'Initialize repository', s: 'Complete' },
                    { c: 'teal', t: 'Configure CI/CD pipeline', s: 'Complete' }].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/40 border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:bg-gray-800/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${item.c}-500/20 text-${item.c}-400 shadow-[0_0_15px_rgba(0,0,0,0.2)]`}>
                          {i < 2 ? <CheckIcon className="w-3 h-3" /> : <RocketLaunchIcon className="w-4 h-4" />}
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.t}</div>
                          <div className="text-[10px] text-gray-500">{item.s}</div>
                        </div>
                      </div>
                      <div className="h-5 w-12 bg-gray-700/50 rounded-full flex items-center justify-center">
                        <span className="text-[9px] text-gray-600 dark:text-gray-400 font-medium">Logs</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Stat Card 1 */}
            <div className="absolute -left-6 lg:-left-10 top-20 z-20 bg-[#1F2937]/90 backdrop-blur-xl p-4 lg:p-5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-[bounce_4s_ease-in-out_infinite]">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  <ShieldCheckIcon className="w-5 h-5 lg:w-6 lg:h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-cyan-400 font-bold text-lg lg:text-lg">Secured</p>
                  <p className="text-gray-600 dark:text-gray-400 text-[11px] lg:text-xs font-medium">Enterprise Grade</p>
                </div>
              </div>
            </div>

            {/* Floating Stat Card 2 */}
            <div className="absolute -right-8 lg:-right-12 bottom-24 lg:bottom-28 z-20 bg-[#1F2937]/90 backdrop-blur-xl p-3 lg:p-3.5 rounded-2xl border border-gray-200 dark:border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)] animate-[bounce_5s_ease-in-out_infinite_1s]">
              <div className="flex items-center gap-2 mb-2 lg:mb-3">
                <UserGroupIcon className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-400" />
                <span className="text-gray-900 dark:text-white text-xs lg:text-sm font-semibold">Collaborators</span>
              </div>
              <div className="flex -space-x-2">
                <div className="w-5 h-5 lg:w-6 lg:h-6 lg:w-8 lg:h-8 rounded-full border-2 border-[#1F2937] bg-gradient-to-br from-emerald-400 to-teal-500 shadow-sm"></div>
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-[#1F2937] bg-gradient-to-br from-teal-400 to-cyan-500 shadow-sm"></div>
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-[#1F2937] bg-gradient-to-br from-cyan-400 to-blue-500 shadow-sm"></div>
                <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full border-2 border-[#1F2937] bg-gray-700 flex items-center justify-center text-[9px] lg:text-[10px] text-gray-900 dark:text-white font-bold shadow-sm">+8</div>
              </div>
            </div>
          </div>

          {/* Bottom: Text & Social Proof */}
          <div className="mt-auto pt-4">
            <h1 className="text-2xl lg:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-100 dark:to-gray-500 leading-[1.1] mb-2 tracking-tight">
              Start building <br/> something great
            </h1>
            <p className="text-gray-600 dark:text-gray-400/90 text-base lg:text-sm lg:text-[15px] max-w-[400px] leading-relaxed font-medium mb-4 lg:mb-5">
               Join thousands of engineering teams who trust Centrion to manage their sprints, tasks, and deployments.
            </p>
            
            <div className="flex items-center gap-4 lg:gap-5 pt-4 lg:pt-4 border-t border-gray-200 dark:border-gray-800/80">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                   <div key={i} className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full border-2 border-[#0B0F19] bg-gradient-to-br ${i%2===0?'from-emerald-500 to-teal-500':'from-teal-500 to-cyan-500'} opacity-90 shadow-sm relative z-${10-i}`}></div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 mb-0.5 lg:mb-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[11px] lg:text-sm text-gray-600 dark:text-gray-400 font-medium">Loved by developers everywhere</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white dark:bg-gray-900 relative overflow-hidden">
        {/* Decorative background blobs for the form side */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '1s' }} />
        </div>

        {/* Top bar */}
        <div className="flex items-center justify-between p-4 lg:p-5 relative z-10">
          
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-900 dark:text-white transition-colors group"
          >
            <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to home</span>
          </button>

          
          <Link
            to="/login"
            onClick={onClose}
            className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
          >
            Sign in instead →
          </Link>

        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-8 sm:px-12 lg:px-16 relative z-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="lg:hidden mb-8 text-center flex justify-center">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <SparklesIcon className="h-6 w-6 text-gray-900 dark:text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Centrion</span>
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create your account
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Start managing your projects in minutes
              </p>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md transition-all text-sm font-semibold text-gray-700 dark:text-gray-300"
                onClick={() => window.location.href = `${API_URL}/auth/google`}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => window.location.href = `${API_URL}/auth/github`}
                className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-md transition-all text-sm font-semibold text-gray-700 dark:text-gray-300"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
                </svg>
                GitHub
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700/50"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 rounded-full">
                  or sign up with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700/50 transition-all shadow-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative group">
                  <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700/50 transition-all shadow-sm"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700/50 transition-all shadow-sm"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {/* Password strength meter */}
                {formData.password && (
                  <div className="mt-2.5">
                    <div className="flex gap-1.5 mb-1.5">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                            level <= passwordStrength.level ? passwordStrength.color : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-semibold ${
                      passwordStrength.level <= 1 ? 'text-red-500' :
                      passwordStrength.level === 2 ? 'text-yellow-500' :
                      passwordStrength.level === 3 ? 'text-blue-500' : 'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative group">
                  <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 dark:text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700/50 transition-all shadow-sm ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 dark:border-red-700/50'
                        : formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 dark:border-green-700/50'
                        : 'border-gray-200 dark:border-gray-700/50'
                    }`}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-800 dark:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-xs font-semibold text-green-500 mt-1.5 flex items-center gap-1">
                    <CheckIcon className="w-4 h-4" /> Passwords match
                  </p>
                )}
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs font-semibold text-red-500 mt-1.5">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || (formData.confirmPassword && formData.password !== formData.confirmPassword)}
                className="w-full mt-4 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-gray-900 dark:text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  'Create account'
                )}
              </button>

              <p className="text-xs text-center text-gray-600 dark:text-gray-400 dark:text-gray-500 mt-4">
                By creating an account, you agree to our{' '}
                <a href="#" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Terms</a> and{' '}
                <a href="#" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">Privacy Policy</a>
              </p>
            </form>

            {/* Footer */}
            <p className="mt-8 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              
              <Link to="/login" onClick={onClose} className="font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors">
                Sign in
              </Link>

            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
    </>
  );
};

export default RegisterModal;