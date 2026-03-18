import React, { useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import LoginModal from '../components/LoginModal';
import RegisterModal from '../components/RegisterModal';
import {
  CheckCircleIcon,
  UserGroupIcon,
  ChartBarIcon,
  BoltIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  SunIcon,
  MoonIcon,
  ArrowRightIcon,
  SparklesIcon,
  PlayIcon,
  RocketLaunchIcon,
  Squares2X2Icon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const location = useLocation();
  const navigate = useNavigate();

  const isLoginOpen = location.pathname === '/login';
  const isRegisterOpen = location.pathname === '/register';
  
  const handleClose = () => {
    navigate('/');
  };

  const features = [
    {
      name: 'Real-time Collaboration',
      description: 'Work together with your team in real-time. See changes instantly as they happen with our lightning-fast sync engine.',
      icon: UserGroupIcon,
      color: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Smart Kanban Boards',
      description: 'Visualize your workflow with beautiful, customizable boards. Drag and drop tasks effortlessly between stages.',
      icon: ChartBarIcon,
      color: 'bg-purple-500',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Advanced Analytics',
      description: 'Gain deep insights into your team\'s performance with interactive charts, progress rings, and detailed reports.',
      icon: BoltIcon,
      color: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const pricing = [
    {
      id: 'free',
      name: 'Starter',
      price: '$0',
      description: 'Perfect for individuals and small side projects.',
      features: ['Up to 5 Projects', '10 Team Members', 'Basic Analytics', '5GB Storage', 'Community Support'],
      cta: 'Start for Free',
      popular: false,
    },
    {
      id: 'professional',
      name: 'Pro',
      price: '$12',
      period: '/user/mo',
      description: 'For growing teams that need more power and flexibility.',
      features: ['Unlimited Projects', 'Unlimited Members', 'Advanced Analytics', '100GB Storage', 'Priority Support', 'Custom Fields'],
      cta: 'Start Free Trial',
      popular: true,
      gradient: 'from-primary-600 to-blue-600',
    },
    {
      id: 'enterprise',
      name: 'Business',
      price: '$49',
      period: '/user/mo',
      description: 'Advanced features and security for large organizations.',
      features: ['Everything in Pro', 'Unlimited Storage', 'SSO & Audit Logs', 'Dedicated Success Manager', '24/7 Phone Support', 'SLA Guarantee'],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const stardustParticles = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: `stardust-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDuration: `${15 + Math.random() * 15}s`,
      animationDelay: `-${Math.random() * 15}s`,
      opacity: 0.3 + Math.random() * 0.5
    }));
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] selection:bg-primary-500/30 relative overflow-hidden">

      {/* Ambient Background Blobs & Fireflies */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="dashboard-bg-blob-1" />
        <div className="dashboard-bg-blob-2" />
        <div className="dashboard-bg-blob-3" />
        
        {/* Stardust Particles */}
        {stardustParticles.map((pt) => (
          <div
            key={pt.id}
            className="stardust"
            style={{
              top: pt.top,
              left: pt.left,
              animationDuration: pt.animationDuration,
              animationDelay: pt.animationDelay,
              '--particle-opacity': pt.opacity
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 drop-shadow-sm">
                Centrion
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-300 hover:text-primary-400 transition-colors">Features</a>
              <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-primary-400 transition-colors">Pricing</a>
              <a href="#" className="text-sm font-medium text-gray-300 hover:text-primary-400 transition-colors">About</a>
            </div>

            <div className="flex items-center gap-4">
              <Link to="/login" className="hidden sm:inline-flex px-5 py-2.5 rounded-xl font-semibold text-sm text-gray-200 hover:bg-white/5 transition-all">
                Log in
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-bold shadow-[0_4px_16px_rgba(255,255,255,0.2)] hover:shadow-[0_8px_24px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300">
                Get Started
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-900/30 border border-primary-500/30 backdrop-blur-md mb-8 animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
            </span>
            {/* <span className="text-sm font-bold text-primary-300 tracking-wide uppercase">v2.0 is now live</span> */}
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.15] drop-shadow-lg">
            Manage tasks with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-blue-400 to-purple-500 animate-gradient">
              superhuman speed
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            Beautifully designed workspace for modern teams. Organize, prioritize, and track work with a tool you'll actually love using.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 text-white text-lg font-bold shadow-[0_10px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_40px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all duration-300">
              Start Free Trial
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1E293B]/80 backdrop-blur-md text-white border border-white/10 text-lg font-semibold hover:border-white/20 hover:bg-[#1E293B] transition-all duration-300 flex items-center justify-center gap-2 shadow-lg">
              <PlayIcon className="w-5 h-5" />
              Watch Demo
            </button>
          </div>

          {/* App Preview — Mock Kanban Board */}
          <div className="mt-20 relative mx-auto max-w-7xl perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-purple-600 rounded-2xl blur opacity-30 animate-pulse"></div>
            <div className="relative rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl overflow-hidden group transform transition-transform hover:scale-[1.01] duration-500">
              {/* Window Chrome */}
              <div className="h-14 bg-gray-800/50 border-b border-gray-700 flex items-center px-5 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="ml-4 px-3 py-1 rounded-md bg-gray-800 text-xs text-gray-400 font-mono">centrion.app/projects/kanban</div>
              </div>

              {/* Board Content */}
              <div className="p-6 md:p-8 bg-[#0F172A]">
                {/* Board Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">P</div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Product Launch v2.0</h3>
                      <p className="text-[10px] text-gray-500">Sprint 4 · 8 of 14 tasks done</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-[#0F172A] text-[8px] text-white flex items-center justify-center font-bold">JD</div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-[#0F172A] text-[8px] text-white flex items-center justify-center font-bold">AK</div>
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-[#0F172A] text-[8px] text-white flex items-center justify-center font-bold">MR</div>
                      <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-[#0F172A] text-[8px] text-gray-400 flex items-center justify-center font-bold">+3</div>
                    </div>
                    <div className="hidden md:block h-6 w-px bg-gray-700"></div>
                    <div className="hidden md:flex px-2.5 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-400">57% Complete</div>
                  </div>
                </div>

                {/* Kanban Columns */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                  {/* Column: To Do */}
                  <div className="bg-gray-800/30 rounded-xl p-2.5 border border-gray-800/50">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To Do</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 bg-gray-800 px-1.5 py-0.5 rounded">3</span>
                    </div>
                    <div className="space-y-2">
                      {/* Card 1 */}
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-gray-700/50 hover:border-gray-600 transition-colors">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-500/20 text-red-400 uppercase">Urgent</span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">Setup CI/CD pipeline for staging</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[9px] text-gray-500">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            Feb 14
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[7px] text-white flex items-center justify-center font-bold">JD</div>
                        </div>
                      </div>
                      {/* Card 2 */}
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-gray-700/50">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-400 uppercase">High</span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">Write API documentation</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-gray-700 text-gray-400">Docs</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[7px] text-white flex items-center justify-center font-bold">AK</div>
                        </div>
                      </div>
                      {/* Card 3 — subtle */}
                      <div className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-800/50">
                        <p className="text-[11px] font-medium text-gray-400 leading-tight">Create onboarding flow</p>
                      </div>
                    </div>
                  </div>

                  {/* Column: In Progress */}
                  <div className="bg-blue-500/[0.03] rounded-xl p-2.5 border border-blue-500/10">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">In Progress</span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-500/70 bg-blue-500/10 px-1.5 py-0.5 rounded">2</span>
                    </div>
                    <div className="space-y-2">
                      {/* Active card with progress */}
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-blue-500/20 shadow-lg shadow-blue-500/5">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-400 uppercase">High</span>
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-purple-500/20 text-purple-400">Frontend</span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">Redesign dashboard components</p>
                        {/* Progress bar */}
                        <div className="w-full h-1 bg-gray-700 rounded-full mb-2">
                          <div className="h-full w-3/4 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"></div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-gray-500">3/4 subtasks</span>
                          <div className="flex -space-x-1">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[7px] text-white flex items-center justify-center font-bold border border-gray-800">MR</div>
                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-[7px] text-white flex items-center justify-center font-bold border border-gray-800">JD</div>
                          </div>
                        </div>
                      </div>
                      {/* Card 2 */}
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-gray-700/50">
                        <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">Integrate payment gateway</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/20 text-emerald-400">Backend</span>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-[7px] text-white flex items-center justify-center font-bold">AK</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column: Review */}
                  <div className="bg-amber-500/[0.03] rounded-xl p-2.5 border border-amber-500/10 hidden md:block">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Review</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-500/70 bg-amber-500/10 px-1.5 py-0.5 rounded">2</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-amber-500/20">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-blue-500/20 text-blue-400 uppercase">Medium</span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">User authentication flow</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-[9px] text-amber-500/60">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            2 comments
                          </div>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 text-[7px] text-white flex items-center justify-center font-bold">SL</div>
                        </div>
                      </div>
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-gray-700/50">
                        <p className="text-[11px] font-semibold text-gray-200 mb-2 leading-tight">Email notification templates</p>
                        <div className="flex items-center justify-between">
                          <span className="px-1.5 py-0.5 rounded text-[8px] bg-gray-700 text-gray-400">Design</span>
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[7px] text-white flex items-center justify-center font-bold">MR</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column: Done */}
                  <div className="bg-emerald-500/[0.03] rounded-xl p-2.5 border border-emerald-500/10 hidden md:block">
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Done</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-500/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">8</span>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-emerald-500/10 opacity-80">
                        <p className="text-[11px] font-semibold text-gray-300 mb-1.5 leading-tight line-through decoration-emerald-500/50">Database schema design</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-500/60">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Completed Feb 10
                        </div>
                      </div>
                      <div className="bg-gray-800/80 rounded-lg p-2.5 border border-emerald-500/10 opacity-80">
                        <p className="text-[11px] font-semibold text-gray-300 mb-1.5 leading-tight line-through decoration-emerald-500/50">Setup project repository</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-500/60">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          Completed Feb 8
                        </div>
                      </div>
                      <div className="bg-gray-800/40 rounded-lg p-2.5 border border-gray-800/50 opacity-60">
                        <p className="text-[10px] font-medium text-gray-500 line-through">+ 6 more completed</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 relative bg-transparent">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center md:mb-16 mb-12 relative">
            {/* Soft glow behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight relative z-10">
              Everything you need to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-blue-500 to-purple-500">ship faster</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium relative z-10">
              Built for speed and designed for focus. Centrion provides the ultimate toolset for modern engineering teams.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-[#111827]/70 backdrop-blur-xl border border-white/5 shadow-xl hover:bg-[#111827]/90 hover:-translate-y-2 hover:border-primary-500/30 transition-all duration-300">
                <div className={`mb-8 w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.3)] transform group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {feature.name}
                </h3>
                <p className="text-gray-400 leading-relaxed font-medium">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact / Reach Out */}
      <section id="contact" className="py-16 relative border-t border-white/5 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left — Info */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-6">
                <ShieldCheckIcon className="w-4 h-4" /> Get in Touch
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-5 tracking-tight">
                We'd love to hear from you
              </h2>
              <p className="text-gray-400 leading-relaxed mb-8 max-w-md">
                Whether you have a question about features, pricing, need a demo, or anything else — our team is ready to answer all your questions.
              </p>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-0.5">Email us</h4>
                    <p className="text-gray-400 text-sm">support@centrion.app</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-0.5">Response time</h4>
                    <p className="text-gray-400 text-sm">We typically respond within 2 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-sm mb-0.5">Live chat</h4>
                    <p className="text-gray-400 text-sm">Available 24/7 for Pro & Enterprise</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="bg-[#111827]/70 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-xl">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subject</label>
                  <select className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}>
                    <option value="" className="bg-[#111827]">Select a topic</option>
                    <option value="general" className="bg-[#111827]">General Inquiry</option>
                    <option value="support" className="bg-[#111827]">Technical Support</option>
                    <option value="sales" className="bg-[#111827]">Sales & Pricing</option>
                    <option value="migration" className="bg-[#111827]">Data Migration Help</option>
                    <option value="enterprise" className="bg-[#111827]">Enterprise Plan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message</label>
                  <textarea
                    rows={4}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/30 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary-600 to-blue-600 text-white font-bold shadow-lg hover:shadow-primary-500/30 hover:-translate-y-0.5 transition-all duration-300 text-sm"
                >
                  Send Message
                </button>
                <p className="text-xs text-gray-500 text-center">We'll get back to you within 2 business hours.</p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 relative border-t border-white/5 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Active Users', value: '10k+' },
              { label: 'Tasks Completed', value: '2.5M+' },
              { label: 'Uptime', value: '99.99%' },
              { label: 'Countries', value: '80+' },
            ].map((stat, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-[#111827]/70 backdrop-blur-xl border border-white/5 shadow-xl transform transition-all duration-300 hover:-translate-y-2 hover:border-primary-500/30 hover:bg-[#111827]/90">
                <div className="text-4xl md:text-5xl font-black mb-2 tracking-tight text-white drop-shadow-lg">
                  {stat.value}
                </div>
                <div className="text-primary-400 font-bold tracking-widest uppercase text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 relative border-t border-white/5 bg-transparent">
        {/* Soft background glows */}
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-12 relative">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight relative z-10">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-400 font-medium relative z-10">
              No hidden fees. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto cursor-default">
            {pricing.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-8 lg:p-10 rounded-3xl border transition-all duration-300 shadow-xl ${
                  plan.popular
                    ? 'bg-[#1F2937]/80 backdrop-blur-2xl border-primary-500/40 transform md:-translate-y-4 hover:border-primary-400/60'
                    : 'bg-[#111827]/70 backdrop-blur-2xl border-white/5 hover:-translate-y-2 hover:border-primary-500/30'
                } flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.5)]">
                    Most Popular
                  </div>
                )}
                
                {/* Glow behind popular */}
                {plan.popular && (
                   <div className="absolute inset-0 bg-gradient-to-br from-primary-600/10 to-blue-600/10 rounded-[2.5rem] pointer-events-none"></div>
                )}
                
                <div className="mb-8 relative z-10">
                  <h3 className="text-xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-5xl font-extrabold text-white tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-gray-400 font-medium">{plan.period}</span>}
                  </div>
                  <p className="text-sm text-gray-400 font-medium leading-relaxed">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-10 flex-1 relative z-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300 font-medium">
                      <CheckCircleIcon className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-primary-400' : 'text-gray-500'}`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-300 relative z-10 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-[0_10px_20px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_30px_rgba(99,102,241,0.5)] hover:-translate-y-0.5'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="py-16 px-6 relative bg-transparent">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[#111827]/70 backdrop-blur-3xl border border-white/5 overflow-hidden relative text-center px-6 py-20 lg:px-20 lg:py-24 shadow-2xl">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse pointer-events-none" style={{ animationDuration: '6s', animationDelay: '1s' }}></div>

          <div className="relative z-10">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
              Ready to ship faster?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Join 10,000+ teams who use Centrion to manage their projects and deliverables. Built for modern builders.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="px-10 py-5 rounded-2xl bg-gradient-to-r from-primary-600 to-blue-600 text-white text-lg font-bold shadow-lg hover:shadow-primary-500/30 hover:-translate-y-1 transition-all duration-300">
                Get Started Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/5 pt-12 pb-8 bg-[#0B0F19] overflow-hidden mt-12 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-20">
        {/* Subtle footer glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-primary-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-[1400px] w-full mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
            {/* Column 1: Brand & Info */}
            <div className="col-span-1 md:col-span-2 md:pr-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-blue-600 flex items-center justify-center shadow-[0_5px_15px_rgba(99,102,241,0.3)]">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">Centrion</span>
              </div>
              <p className="text-gray-400 text-[13px] mb-6 leading-relaxed font-medium">
                Modern task management and collaboration platform similar to Trello and Asana. Built with the MERN stack with Socket.io real-time updates.
              </p>
              <div className="flex gap-3 opacity-80">
                {/* Social Links */}
                <a href="mailto:support@centrion.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:text-primary-400 hover:border-primary-500/30 transition-all text-gray-400 focus:outline-none" title="Support Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary-500/20 hover:text-primary-400 hover:border-primary-500/30 transition-all text-gray-400 focus:outline-none" title="GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Tech Stack */}
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <RocketLaunchIcon className="w-4 h-4 text-primary-400" />
                Tech Stack
              </h4>
              <ul className="space-y-3.5 text-[13px] text-gray-400 font-medium">
                <li className="flex items-center gap-2.5 group"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)] group-hover:scale-150 transition-transform"></div> React 18 & Node.js</li>
                <li className="flex items-center gap-2.5 group"><div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)] group-hover:scale-150 transition-transform"></div> MongoDB & Express</li>
                <li className="flex items-center gap-2.5 group"><div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,0.6)] group-hover:scale-150 transition-transform"></div> Socket.io</li>
                <li className="flex items-center gap-2.5 group"><div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:scale-150 transition-transform"></div> Tailwind CSS</li>
              </ul>
            </div>

            {/* Column 3: Navigation */}
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <Squares2X2Icon className="w-4 h-4 text-primary-400" />
                Navigation
              </h4>
              <ul className="space-y-3.5 text-[13px] text-gray-400 font-medium">
                <li><Link to="/tasks" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> All Tasks</Link></li>
                <li><Link to="/kanban" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> Kanban Board</Link></li>
                <li><Link to="/calendar" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> Calendar View</Link></li>
                <li><Link to="/analytics" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> Analytics</Link></li>
              </ul>
            </div>

            {/* Column 4: Account & Support */}
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-primary-400" />
                Account
              </h4>
              <ul className="space-y-3.5 text-[13px] text-gray-400 font-medium">
                <li><Link to="/login" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> Log In</Link></li>
                <li><Link to="/register" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> Sign Up</Link></li>
                <li><a href="mailto:support@centrion.com" className="hover:text-primary-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-primary-400" /> Help Center</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-medium">
            <p>&copy; {new Date().getFullYear()} Centrion Tasks. MIT License.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 bg-primary-500/10 text-primary-400 px-3 py-1 rounded-full border border-primary-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                All systems operational
              </span>
              <button className="hover:text-white transition-colors focus:outline-none">Privacy Policy</button>
            </div>
          </div>
        </div>
      </footer>
      <LoginModal isOpen={isLoginOpen} onClose={handleClose} />
      <RegisterModal isOpen={isRegisterOpen} onClose={handleClose} />
    </div>
  );
};

export default LandingPage;