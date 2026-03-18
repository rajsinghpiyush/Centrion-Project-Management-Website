import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsPopover from '../components/NotificationsPopover';
import {
  SparklesIcon, SunIcon, MoonIcon, BellIcon, ArrowRightOnRectangleIcon, ArrowLeftIcon,
  CameraIcon, CheckCircleIcon, UserIcon, ShieldCheckIcon, Cog6ToothIcon, KeyIcon, EnvelopeIcon, UserGroupIcon, LockClosedIcon, 
  DocumentTextIcon, ChartBarIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { taskAPI, projectAPI } from '../services/api';
import '../styles/Dashboard.css';

const Profile = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [profileData, setProfileData] = useState({ name: '', email: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [preferences, setPreferences] = useState({ emailNotifications: true, pushNotifications: true });
  const [userStats, setUserStats] = useState({ tasksCompleted: 0, wordsWritten: 0, projectProgress: 0 });

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

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', email: user.email || '', avatar: user.avatar || '' });
      if (user.preferences) {
        setPreferences(prev => ({ ...prev, ...user.preferences }));
      }
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
      try {
          const [taskRes, projRes] = await Promise.all([
              taskAPI.getTasks(), // Assuming this returns tasks for the user/workspaces they belong to
              projectAPI.getProjects()
          ]);
          
          const tasks = taskRes.data.tasks || [];
          const projects = projRes.data.projects || [];
          
          // 1. Tasks Completed
          const completed = tasks.filter(t => t.status === 'completed' || t.status === 'Completed').length;
          
          // 2. Words Written Approximation (Chars / 5)
          let chars = 0;
          tasks.forEach(t => {
              chars += (t.title?.length || 0);
              chars += (t.description?.length || 0);
          });
          const words = Math.round(chars / 5);
          
          // 3. Project Progress
          let totalProjProgress = 0;
          let projCount = 0;
          projects.forEach(p => {
              const pTasks = tasks.filter(t => (t.project?._id || t.project) === p._id);
              if (pTasks.length > 0) {
                  const pComp = pTasks.filter(t => t.status === 'completed' || t.status === 'Completed').length;
                  totalProjProgress += (pComp / pTasks.length);
                  projCount++;
              }
          });
          const avgProgress = projCount > 0 ? Math.round((totalProjProgress / projCount) * 100) : 0;
          
          setUserStats({ tasksCompleted: completed, wordsWritten: words, projectProgress: avgProgress });
      } catch (err) {
          console.error("Failed fetching user stats", err);
      }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateProfile({ name: profileData.name, avatar: profileData.avatar, preferences });
      if (result.success) toast.success("Profile updated successfully!");
      else toast.error(result.message || "Failed to update profile");
    } catch {
      toast.error('An error occurred during update');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const result = await changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      if (result.success) {
        toast.success("Password updated successfully!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = (key, value) => {
    const newPrefs = { ...preferences, [key]: value };
    setPreferences(newPrefs);
    updateProfile({ preferences: newPrefs }).then(res => {
      if (!res.success) toast.error("Failed to save preference");
    });
  };

  return (
    <div className="dashboard-container min-h-screen selection:bg-indigo-500/30 flex flex-col relative bg-[#0B0F19] overflow-x-hidden">
      
      {/* Background stardust layer */}
      <div className="dashboard-background" style={{ pointerEvents: 'none', position: 'fixed', inset: 0, zIndex: 0 }}>
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
      <nav className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5">
              <ArrowLeftIcon className="w-5 h-5" />
            </Link>

            <Link to="/dashboard" className="flex items-center gap-3 decoration-transparent group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <SparklesIcon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight drop-shadow-sm group-hover:text-indigo-100 transition-colors">Centrion</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="p-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-transparent flex"
              >
                <BellIcon className="w-5 h-5" />
              </button>
              {showNotifications && <NotificationsPopover onClose={() => setShowNotifications(false)} />}
            </div>
            
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all border border-transparent flex">
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button onClick={logout} title="Logout" className="p-2.5 rounded-xl bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all border border-transparent flex">
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-12 relative z-10 animate-fade-in-up flex flex-col justify-center">
        
        {/* The Unified Card Container - Deep Split Layout */}
        <div className="w-full flex flex-col lg:flex-row bg-[#111827] rounded-[2.5rem] border border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative z-20 min-h-[600px]">
          
          {/* Left Panel - Dynamic Branding & Tabs */}
          <div className="w-full lg:w-2/5 relative overflow-hidden bg-[#0B0F19] border-b lg:border-b-0 lg:border-r border-gray-800/80 flex flex-col">
            {/* Modern Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] opacity-30 pointer-events-none"></div>
            
            {/* Radiant Glowing Blobs */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 -left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '6s' }}></div>
              <div className="absolute bottom-0 -right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 p-8 lg:p-12 flex flex-col h-full">
              
              <div className="mb-10 border-b border-white/5 pb-1 mt-5">
                <h2 className="text-lg font-medium text-white tracking-wide">Account Settings</h2>
                <p className="text-sm text-gray-500 mt-1">Manage your personal configuration</p>
              </div>

              {/* Floating User Stat Card */}
              <div className="relative w-full mb-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-3xl z-0 pointer-events-none"></div>
                
                <div className="relative z-10 bg-transparent p-2 group">
                  <div className="flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.2)] shrink-0 border border-white/10">
                       <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 blur opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                       {profileData.avatar ? (
                         <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover rounded-full relative z-10" />
                       ) : (
                         <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white flex items-center justify-center font-bold text-lg relative z-10 border border-white/5">
                           {user?.name?.charAt(0).toUpperCase()}
                         </div>
                       )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight truncate max-w-[180px]">{user?.name || "Centrion User"}</h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <p className="text-indigo-400 text-[11px] font-semibold uppercase tracking-wider">Personal Space</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Navigation Tabs */}
              <div className="flex flex-col gap-3 flex-1 relative z-10">
                {[
                  { id: 'profile', icon: UserIcon, title: 'Identity', desc: 'Avatar, name & contact info' },
                  { id: 'activity', icon: SparklesIcon, title: 'Activity', desc: 'Productivity and contributions' },
                  { id: 'security', icon: ShieldCheckIcon, title: 'Security', desc: 'Password & access limits' },
                  { id: 'preferences', icon: Cog6ToothIcon, title: 'Preferences', desc: 'Theme & alerts setup' }
                ].map(tab => (
                   <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                     className={`flex items-center gap-4 w-full px-5 py-4 rounded-2xl text-left transition-all duration-300 border outline-none group relative overflow-hidden ${
                       activeTab === tab.id 
                        ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-[0_10px_30px_rgba(99,102,241,0.1)]' 
                        : 'bg-transparent border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                     }`}
                   >
                     {/* Tab Active Indication Glow */}
                     {activeTab === tab.id && <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-transparent pointer-events-none"></div>}
                     {activeTab === tab.id && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r bg-indigo-500 pointer-events-none"></div>}
                     
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg relative z-10 ${activeTab === tab.id ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-indigo-500/40 rotate-3' : 'bg-gray-800/80 border border-white/5 text-gray-400 group-hover:bg-gray-700 group-hover:text-white group-hover:rotate-3'}`}>
                        <tab.icon className="w-5 h-5 pointer-events-none" />
                     </div>
                     <div className="relative z-10">
                        <div className={`font-bold text-sm mb-0.5 transition-colors ${activeTab === tab.id ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>{tab.title}</div>
                        <div className={`text-[11px] font-medium transition-colors ${activeTab === tab.id ? 'text-indigo-300/80' : 'text-gray-500 group-hover:text-gray-400'}`}>{tab.desc}</div>
                     </div>
                   </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Content Area */}
          <div className="flex-1 w-full bg-[#111827] relative z-10 flex flex-col pt-4">
            
            {/* Soft inner glow top */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none"></div>
            
            <div className="flex-1 p-6 sm:p-10 lg:p-14 overflow-y-auto custom-scrollbar">
              
              {activeTab === 'profile' && (
                <div className="animate-fade-in-up max-w-2xl">
                  <div className="mb-8 flex items-end justify-between pb-1 border-b border-white/5">
                    <div>
                      <h2 className="text-lg font-medium text-white tracking-wide">Public Identity</h2>
                      <p className="text-sm text-gray-500 mt-1">Manage your outward-facing information</p>
                    </div>
                  </div>
                  
                  <form onSubmit={handleProfileUpdate}>
                    {/* Avatar Upload */}
                    <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-white/5 relative">
                      <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-[#111827] shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-transform duration-500 group-hover:scale-105">
                          {profileData.avatar ? <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm scale-105 group-hover:scale-100 border-4 border-transparent">
                          <CameraIcon className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                      </div>
                      
                      <div className="text-center sm:text-left">
                        <div className="text-lg font-bold text-white mb-1">Avatar Graphics</div>
                        <div className="text-sm font-medium text-gray-400 mb-4 max-w-sm">Upload a clean picture for your profile. We support JPG, GIF or PNG up to 5MB.</div>
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="px-5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-sm font-bold text-indigo-400 transition-all border border-indigo-500/20 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
                            Select New Image
                          </button>
                          {profileData.avatar && (
                            <button type="button" onClick={() => setProfileData({...profileData, avatar: ''})} className="px-5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-sm font-bold text-red-500 transition-all border border-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/50">
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Fields */}
                    <div className="grid grid-cols-1 gap-5 mb-8">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Display Name</label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                          <input type="text" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})}
                                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.06] transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Primary Email</label>
                        <div className="relative">
                          <EnvelopeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500/50 pointer-events-none" />
                          <input type="email" value={profileData.email} disabled
                                 className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-sm text-gray-500 cursor-not-allowed" />
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-2 ml-1">Email cannot be changed directly through settings.</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Workspace Role</label>
                        <div className="relative group">
                          <UserGroupIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                          <input type="text" placeholder="e.g. Senior Software Engineer"
                                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.06] transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <button type="submit" disabled={loading} className={`flex justify-center items-center w-full gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${loading ? 'bg-indigo-600/50 text-white/50 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white shadow-indigo-500/30'}`}>
                        {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" /> : <CheckCircleIcon className="w-5 h-5 pointer-events-none" />}
                        Save Profile Updates
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="animate-fade-in-up max-w-2xl">
                   <div className="mb-8 flex items-end justify-between pb-4 border-b border-white/5">
                     <div>
                       <h2 className="text-lg font-medium text-white tracking-wide">Security Credentials</h2>
                       <p className="text-sm text-gray-500 mt-1">Manage your authentication methods securely</p>
                     </div>
                   </div>
                   
                  <form onSubmit={handlePasswordChange}>
                    <div className="grid grid-cols-1 gap-5 mb-8 pb-8 border-b border-white/5">
                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Current Password</label>
                        <div className="relative group">
                          <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-red-400 transition-colors pointer-events-none" />
                          <input type="password" value={passwordData.currentPassword} onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-white/[0.06] transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">New Password</label>
                        <div className="relative group">
                          <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                          <input type="password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.06] transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Confirm New Password</label>
                        <div className="relative group">
                          <LockClosedIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-indigo-400 transition-colors pointer-events-none" />
                          <input type="password" value={passwordData.confirmPassword} onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                 className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-white/[0.06] transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button type="submit" disabled={loading || !passwordData.currentPassword || !passwordData.newPassword} 
                        className={`w-full flex justify-center items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold transition-all shadow-lg hover:-translate-y-0.5 border focus:outline-none focus:ring-2 focus:ring-red-500/50 ${loading || !passwordData.currentPassword ? 'bg-red-500/10 text-red-500/50 cursor-not-allowed border-red-500/20' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 border-red-400 text-white shadow-red-500/30'}`}>
                        Set new password
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="animate-fade-in-up max-w-2xl">
                   <div className="mb-8 flex items-end justify-between pb-4 border-b border-white/5">
                     <div>
                       <h2 className="text-lg font-medium text-white tracking-wide">System Preferences</h2>
                       <p className="text-sm text-gray-500 mt-1">Command your interface themes and alerts</p>
                     </div>
                   </div>
                   
                  <div className="flex flex-col gap-4">
                    
                    {/* Option 1: Email Notifications */}
                    <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex items-center justify-between hover:bg-white/[0.04] transition-colors gap-6 group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] shrink-0 transition-transform group-hover:scale-105">
                          <BellIcon className="w-6 h-6 pointer-events-none" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-white mb-1 tracking-wide">Email Notifications</div>
                          <div className="text-sm font-medium text-gray-400 max-w-xs transition-colors group-hover:text-gray-300">Enable digests and direct updates sent straight to your inbox.</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input type="checkbox" className="sr-only peer" checked={preferences.emailNotifications} onChange={(e) => handleTogglePreference('emailNotifications', e.target.checked)} />
                        <div className={`w-14 h-7 rounded-full relative transition-colors duration-300 shadow-inner border ${preferences.emailNotifications ? 'bg-gradient-to-r from-indigo-500 to-blue-500 border-indigo-400' : 'bg-[#0B0F19] border-white/10'}`}>
                          <div className={`absolute top-0.5 left-1 bg-white w-5 h-5 rounded-full transition-all duration-300 shadow-md ${preferences.emailNotifications ? 'translate-x-7 border border-indigo-200' : 'translate-x-0 border border-gray-600'}`} />
                        </div>
                      </label>
                    </div>

                    {/* Option 2: Theme Toggle */}
                    <div className="p-6 rounded-3xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-white/[0.04] transition-colors gap-6 group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] shrink-0 transition-transform group-hover:scale-105">
                          {theme === 'dark' ? <MoonIcon className="w-6 h-6 pointer-events-none" /> : <SunIcon className="w-6 h-6 pointer-events-none" />}
                        </div>
                        <div>
                          <div className="text-base font-bold text-white mb-1 tracking-wide">Application Appearance</div>
                          <div className="text-sm font-medium text-gray-400 transition-colors group-hover:text-gray-300">Currently overriding system settings with "{theme}" mode.</div>
                        </div>
                      </div>
                      <div className="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={toggleTheme} className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold text-white transition-all border border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50">
                          Toggle Appearance
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}
              
              {activeTab === 'activity' && (
                <div className="animate-fade-in-up max-w-4xl">
                   <div className="mb-8 flex items-end justify-between pb-4 border-b border-white/5">
                     <div>
                       <h2 className="text-lg font-medium text-white tracking-wide">Contributions & Activity</h2>
                       <p className="text-sm text-gray-500 mt-1">A timeline of your productivity across the platform</p>
                     </div>
                   </div>
                   
                   {/* Personal KPI Cards */}
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                       <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col justify-center shadow-lg shadow-black/20">
                           <div className="flex items-center gap-3 mb-2 opacity-70">
                               <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tasks Completed</span>
                           </div>
                           <div className="text-3xl font-black text-white">{userStats.tasksCompleted}</div>
                       </div>
                       <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col justify-center shadow-lg shadow-black/20">
                           <div className="flex items-center gap-3 mb-2 opacity-70">
                               <DocumentTextIcon className="w-5 h-5 text-indigo-400" />
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Words Written</span>
                           </div>
                           <div className="text-3xl font-black text-white">{userStats.wordsWritten.toLocaleString()}</div>
                       </div>
                       <div className="bg-[#111827] border border-white/5 rounded-2xl p-6 flex flex-col justify-center shadow-lg shadow-black/20">
                           <div className="flex items-center gap-3 mb-2 opacity-70">
                               <ChartBarIcon className="w-5 h-5 text-purple-400" />
                               <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Project Progress</span>
                           </div>
                           <div className="text-3xl font-black text-white">{userStats.projectProgress}%</div>
                       </div>
                   </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
