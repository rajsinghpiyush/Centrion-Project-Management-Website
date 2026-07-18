import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import NotificationsPopover from '../components/NotificationsPopover';
import CreateTaskModal from '../components/CreateTaskModal';
import CreateProjectModal from '../components/CreateProjectModal';
import AITaskGeneratorModal from '../components/AITaskGeneratorModal';
import { projectAPI, taskAPI, workspaceAPI } from '../services/api';
import {
  PlusIcon,
  FolderIcon,
  ClockIcon,
  CheckCircleIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ChevronRightIcon,
  BellIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
  PencilSquareIcon,
  TableCellsIcon,
  FireIcon,
  UserGroupIcon,
  CommandLineIcon,
  EllipsisHorizontalCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import '../styles/Dashboard.css';

const ProgressRing = ({ progress, color = '#6366F1', size = 44 }) => {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (progress / 100) * c;
  return (
    <div className="progress-ring-container" style={{ width: size, height: size }}>
      <svg className="progress-ring" width={size} height={size}>
        <circle className="progress-ring-bg" cx={size / 2} cy={size / 2} r={r} />
        <circle
          className="progress-ring-fill"
          cx={size / 2} cy={size / 2} r={r}
          stroke={color}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="progress-ring-text">{progress}%</span>
    </div>
  );
};

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [workspaceMenu, setWorkspaceMenu] = useState(null);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [editName, setEditName] = useState('');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // AI Suggestions State
  const [aiSuggestions, setAiSuggestions] = useState([]);

  // Generate Dynamic AI Suggestions
  useEffect(() => {
    if (loading || allTasks.length === 0) return;

    const newSuggestions = [];
    let idCounter = 1;

    const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed');
    if (overdueTasks.length > 0) {
      newSuggestions.push({ id: `s-${idCounter++}`, text: `You have ${overdueTasks.length} overdue task(s) that need immediate attention.`, action: 'Review Tasks' });
    }

    const highPriorityPending = allTasks.filter(t => (t.priority === 'high' || t.priority === 'urgent') && t.status === 'todo');
    if (highPriorityPending.length > 0) {
      newSuggestions.push({ id: `s-${idCounter++}`, text: `${highPriorityPending.length} high priority task(s) are waiting to be started.`, action: 'Prioritize' });
    }

    const staleLimit = new Date();
    staleLimit.setDate(staleLimit.getDate() - 7);
    const staleTasks = allTasks.filter(t => t.status === 'in-progress' && new Date(t.updatedAt || t.createdAt) < staleLimit);
    if (staleTasks.length > 0) {
      newSuggestions.push({ id: `s-${idCounter++}`, text: `${staleTasks.length} task(s) have been in-progress for over a week.`, action: 'Check Status' });
    }

    if (newSuggestions.length === 0 && projects.length > 0) {
      newSuggestions.push({ id: `s-${idCounter++}`, text: `Consider breaking down your larger projects into smaller tasks.`, action: 'Use AI Generator' });
    }

    setAiSuggestions(newSuggestions.slice(0, 3));
  }, [allTasks, projects, loading]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectRes, taskRes, workspaceRes] = await Promise.all([
        projectAPI.getProjects(),
        taskAPI.getTasks(),
        workspaceAPI.getWorkspaces(),
      ]);
      setProjects(projectRes.data.projects || []);
      setAllTasks(taskRes.data.tasks || []);

      const loadedWorkspaces = workspaceRes.data.workspaces || [];
      setWorkspaces(loadedWorkspaces);

      if (location.state?.newWorkspaceId) {
        const newWs = loadedWorkspaces.find(w => w._id === location.state.newWorkspaceId);
        if (newWs) {
          setActiveWorkspace(newWs);
        }
        window.history.replaceState({}, document.title);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    let result = projects;
    if (activeWorkspace) {
      result = result.filter(p => {
        const pwId = typeof p.workspace === 'object' ? p.workspace?._id : p.workspace;
        return pwId === activeWorkspace._id;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [projects, activeWorkspace, searchQuery]);

  // Separate owned vs invited projects
  const { myProjects, invitedProjects } = useMemo(() => {
    const owned = filteredProjects.filter(p => {
      const ownerId = typeof p.owner === 'object' ? p.owner?._id : p.owner;
      return ownerId === user?._id;
    });
    const invited = filteredProjects.filter(p => {
      const ownerId = typeof p.owner === 'object' ? p.owner?._id : p.owner;
      if (ownerId === user?._id) return false; // Exclude owned projects
      const userMembership = p.members?.find(m => {
        const memberId = typeof m.user === 'object' ? m.user?._id : m.user;
        return memberId === user?._id;
      });
      return userMembership?.status === 'active';
    });
    return { myProjects: owned, invitedProjects: invited };
  }, [filteredProjects, user?._id]);

  const filteredTasks = useMemo(() => {
    if (!activeWorkspace) return allTasks;
    const projectIds = new Set(filteredProjects.map(p => p._id));
    return allTasks.filter(t => {
      const pid = typeof t.project === 'object' ? t.project?._id : t.project;
      return projectIds.has(pid);
    });
  }, [allTasks, activeWorkspace, filteredProjects]);

  const stats = useMemo(() => {
    const tasks = filteredTasks;
    const completed = tasks.filter(t => t.status === 'completed' || t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'in-progress' || t.status === 'In Progress').length;
    const overdue = tasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'Completed';
    }).length;
    const total = tasks.length;

    // Team Efficiency approximation
    const teamEfficiency = total > 0 ? Math.round((completed / (completed + inProgress || 1)) * 100) : 100;

    return { total, completed, inProgress, overdue, teamEfficiency };
  }, [filteredTasks]);

  const projectMetrics = useMemo(() => {
    const map = {};
    filteredProjects.forEach(p => {
      map[p._id] = { total: 0, completed: 0, inProgress: 0, overdue: 0 };
    });
    filteredTasks.forEach(task => {
      const pid = typeof task.project === 'object' ? task.project?._id : task.project;
      if (pid && map[pid]) {
        map[pid].total++;
        if (task.status === 'completed' || task.status === 'Completed') map[pid].completed++;
        if (task.status === 'in-progress' || task.status === 'In Progress') map[pid].inProgress++;
        if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'Completed') {
          map[pid].overdue++;
        }
      }
    });
    return map;
  }, [filteredProjects, filteredTasks]);

  const recentTasks = useMemo(() => {
    return [...filteredTasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
      .slice(0, 15);
  }, [filteredTasks]);

  const visibleRecentTasks = showAllActivity ? recentTasks : recentTasks.slice(0, 3);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { workspaces: [], projects: [], tasks: [] };
    const q = searchQuery.toLowerCase();
    return {
      workspaces: workspaces.filter(w => w.name?.toLowerCase().includes(q) || w.description?.toLowerCase().includes(q)),
      projects: projects.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)),
      tasks: allTasks.filter(t => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)),
    };
  }, [searchQuery, workspaces, projects, allTasks]);

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

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed': case 'Completed': return 'status-dot--completed';
      case 'in-progress': case 'In Progress': return 'status-dot--in-progress';
      case 'review': case 'Review': return 'status-dot--review';
      case 'blocked': case 'Blocked': return 'status-dot--blocked';
      default: return 'status-dot--default';
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'urgent': return 'priority-badge--urgent';
      case 'high': return 'priority-badge--high';
      case 'medium': return 'priority-badge--medium';
      default: return 'priority-badge--low';
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      setCreatingWorkspace(true);
      const res = await workspaceAPI.createWorkspace({
        name: newWorkspaceName.trim(),
        description: newWorkspaceDesc.trim(),
      });
      const newWs = res.data.workspace;
      setWorkspaces(prev => [newWs, ...prev]);
      setActiveWorkspace(newWs);
      setNewWorkspaceName('');
      setNewWorkspaceDesc('');
      setShowCreateWorkspace(false);
      toast.success(`Workspace "${newWs.name}" created!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setCreatingWorkspace(false);
    }
  };

  const handleDeleteWorkspace = async (ws) => {
    if (!window.confirm(`Delete workspace "${ws.name}"? This cannot be undone.`)) return;
    try {
      await workspaceAPI.deleteWorkspace(ws._id);
      setWorkspaces(prev => prev.filter(w => w._id !== ws._id));
      if (activeWorkspace?._id === ws._id) setActiveWorkspace(null);
      setWorkspaceMenu(null);
      toast.success('Workspace deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete workspace');
    }
  };

  const handleRenameWorkspace = async (ws) => {
    if (!editName.trim() || editName.trim() === ws.name) {
      setEditingWorkspace(null);
      return;
    }
    try {
      const res = await workspaceAPI.updateWorkspace(ws._id, { name: editName.trim() });
      setWorkspaces(prev => prev.map(w => w._id === ws._id ? (res.data.workspace || { ...w, name: editName.trim() }) : w));
      if (activeWorkspace?._id === ws._id) {
        setActiveWorkspace(prev => ({ ...prev, name: editName.trim() }));
      }
      setEditingWorkspace(null);
      toast.success('Workspace renamed');
    } catch (error) {
      toast.error('Failed to rename workspace');
    }
  };

  const wsColors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6'];
  const getWsColor = (index) => wsColors[index % wsColors.length];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center gap-5 z-10">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/5" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
          </div>
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 animate-pulse">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
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

      {/* ─── Navigation ─── */}
      {/* ─── Navigation ─── */}
      <nav className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-[1400px] w-full mx-auto px-6 h-20 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 decoration-transparent group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all overflow-hidden border border-white/10">
              <SparklesIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight drop-shadow-sm group-hover:text-indigo-100 transition-colors">Centrion</span>
          </Link>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="relative w-full max-w-md mx-auto group z-50">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <div className="w-7 h-7 rounded-[10px] bg-white/[0.05] group-focus-within:bg-indigo-500/20 flex items-center justify-center transition-colors">
                  <MagnifyingGlassIcon className="w-3.5 h-3.5 text-gray-400 group-focus-within:text-indigo-300" />
                </div>
              </div>
              <input
                type="text"
                placeholder="Search workspaces, tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearch(true)}
                className="w-full bg-black/20 border border-white/5 rounded-2xl pl-12 pr-10 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/30 focus:bg-white/[0.04] hover:bg-white/[0.03] transition-all shadow-inner"
              />

              {/* Keyboard Shortcut Hint or Clear Button */}
              {!searchQuery ? (
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <div className="px-1.5 py-0.5 rounded-md opacity-50 text-[10px] font-medium text-gray-400 bg-white/5 border border-white/10 flex items-center gap-0.5">
                    <span>⌘</span><span>K</span>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setSearchQuery(''); setShowSearch(false); }} className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-gray-400 hover:text-white transition-colors focus:outline-none">
                  <div className="w-6 h-6 rounded-[8px] bg-white/[0.05] hover:bg-red-500/20 hover:text-red-400 flex items-center justify-center transition-colors">
                    <XMarkIcon className="w-3 h-3" />
                  </div>
                </button>
              )}

              {showSearch && searchQuery.trim() && (
                <div className="absolute top-[calc(100%+0.5rem)] left-0 w-full bg-[#111827] border border-white/10 rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.6)] overflow-hidden max-h-[320px] overflow-y-auto custom-scrollbar">
                  {searchResults.workspaces.length > 0 && (
                    <div className="border-b border-white/5 last:border-0">
                      <p className="px-4 py-2 text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-white/[0.02] border-b border-white/5">Workspaces</p>
                      {searchResults.workspaces.map(ws => (
                        <button key={ws._id} onClick={() => { setActiveWorkspace(ws); setSearchQuery(''); setShowSearch(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-none text-left focus:outline-none"
                        >
                          <Squares2X2Icon className="w-5 h-5 text-indigo-400 shrink-0" />
                          <span className="text-sm font-semibold text-white truncate">{ws.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.projects.length > 0 && (
                    <div className="border-b border-white/5 last:border-0">
                      <p className="px-4 py-2 text-[10px] font-bold text-purple-400 uppercase tracking-widest bg-white/[0.02] border-b border-white/5">Projects</p>
                      {searchResults.projects.map(p => (
                        <Link key={p._id} to={`/projects/${p._id}`} onClick={() => { setSearchQuery(''); setShowSearch(false); }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors border-none text-left focus:outline-none decoration-transparent"
                        >
                          <FolderIcon className="w-5 h-5 text-purple-400 shrink-0" />
                          <span className="text-sm font-semibold text-white truncate">{p.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div className="border-b border-white/5 last:border-0">
                      <p className="px-4 py-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-white/[0.02] border-b border-white/5">Tasks</p>
                      {searchResults.tasks.slice(0, 5).map(t => (
                        <div key={t._id} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/[0.04] transition-colors cursor-default">
                          <div className={`status-dot shrink-0 ${getStatusClass(t.status)}`} />
                          <span className="text-sm text-gray-200 truncate">{t.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.workspaces.length === 0 && searchResults.projects.length === 0 && searchResults.tasks.length === 0 && (
                    <div className="p-8 text-center text-sm font-medium text-gray-500">No results found</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 md:gap-3">
            <Link to="/profile" className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-white/10 transition-all group decoration-transparent">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow hover:shadow-lg transition-all overflow-hidden border border-white/10 shrink-0">
                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" /> : user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-bold text-gray-200 group-hover:text-white transition-colors">{user?.name}</span>
            </Link>

            <div className="relative flex items-center">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-white transition-all border border-transparent focus:outline-none flex justify-center items-center"
              >
                <BellIcon className="w-5 h-5 pointer-events-none" />
              </button>
              {showNotifications && <NotificationsPopover onClose={() => setShowNotifications(false)} />}
            </div>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-gray-200 transition-all border border-transparent focus:outline-none flex justify-center items-center"
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5 pointer-events-none" /> : <MoonIcon className="w-5 h-5 pointer-events-none" />}
            </button>

            <button
              onClick={logout}
              title="Logout"
              className="p-2.5 rounded-xl bg-transparent hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-all border border-transparent focus:outline-none flex justify-center items-center"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 pointer-events-none" />
            </button>
          </div>
        </div>
      </nav>

      {/* Click outside to close search */}
      {showSearch && <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setShowSearch(false)} />}

      {/* ─── Main Content ─── */}
      <div style={{ maxWidth: 1100, width: '92%', margin: '0 auto', padding: '40px 0', position: 'relative', zIndex: 10, flex: 1 }}>

        {/* ─── Hero Section ─── */}
        <div className="animate-fade-in-up mb-12 flex flex-wrap justify-between items-end gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-sm font-semibold text-primary-600 dark:text-primary-400 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {getGreeting()}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              Welcome back,{' '}
              <span className="text-gradient-primary">
                {user?.name?.split(' ')[0]}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {activeWorkspace
                ? <>Viewing <span className="font-bold text-primary-600 dark:text-primary-400">{activeWorkspace.name}</span> &middot; {stats.total - stats.completed} pending tasks</>
                : <>You have <span className="font-bold">{stats.total - stats.completed} pending tasks</span> across all workspaces</>
              }
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowAIGenerator(true)} style={{ padding: '10px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(139,92,246,0.3)', transition: 'all 0.3s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(139,92,246,0.45)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(139,92,246,0.3)' }}
            >
              <SparklesIcon style={{ width: 16, height: 16 }} /> Generate Tasks
            </button>
            <button onClick={() => setShowCreateTask(true)} style={{ padding: '10px 22px', borderRadius: 14, background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(99,102,241,0.35)', transition: 'all 0.3s' }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(99,102,241,0.5)' }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(99,102,241,0.35)' }}
            >
              <PlusIcon style={{ width: 16, height: 16 }} /> New Task
            </button>
            <button onClick={() => setShowCreateProject(true)} style={{ padding: '10px 22px', borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.875rem', border: '1px solid var(--border-color, rgba(255,255,255,0.1))', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.3s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <FolderIcon style={{ width: 16, height: 16 }} /> New Project
            </button>
          </div>
        </div>

        {/* ─── Workspaces ─── */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.05s', marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 className="text-gray-500 dark:text-white/35" style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Squares2X2Icon style={{ width: 16, height: 16, color: '#818CF8' }} />
              Workspaces
            </h2>
            <button
              onClick={() => setShowCreateWorkspace(true)}
              style={{ background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#818CF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'color 0.2s' }}
              onMouseOver={e => e.currentTarget.style.color = '#A5B4FC'}
              onMouseOut={e => e.currentTarget.style.color = '#818CF8'}
            >
              <PlusIcon style={{ width: 14, height: 14 }} /> New
            </button>
          </div>

          <div className="custom-scrollbar flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveWorkspace(null)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${!activeWorkspace ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30 shadow-inner' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm'}`}
            >
              All Workspaces
            </button>

            {workspaces.map((ws, idx) => (
              <div key={ws._id} className="relative flex-shrink-0 group">
                {editingWorkspace === ws._id ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleRenameWorkspace(ws); }} className="flex items-center">
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => handleRenameWorkspace(ws)}
                      className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-white dark:bg-white/5 border-2 border-primary-500 outline-none text-gray-900 dark:text-white w-40 shadow-sm"
                    />
                  </form>
                ) : (
                  <button
                    onClick={() => setActiveWorkspace(activeWorkspace?._id === ws._id ? null : ws)}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${activeWorkspace?._id === ws._id ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 border-primary-500/30 shadow-inner' : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-transparent hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm'}`}
                  >
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: getWsColor(idx) }} />
                    {ws.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-bold ml-1 ${activeWorkspace?._id === ws._id ? 'bg-primary-500/20' : 'bg-gray-200 dark:bg-white/10'}`}>
                      {projects.filter(p => {
                        const pwId = typeof p.workspace === 'object' ? p.workspace?._id : p.workspace;
                        return pwId === ws._id;
                      }).length}
                    </span>
                  </button>
                )}

                {/* Context Menu Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setWorkspaceMenu(workspaceMenu === ws._id ? null : ws._id); }}
                  className={`absolute -top-1 -right-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 flex items-center justify-center cursor-pointer shadow-md transition-opacity ${workspaceMenu === ws._id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                >
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {workspaceMenu === ws._id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setWorkspaceMenu(null)} />
                    <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-50">
                      <button
                        onClick={() => { setEditingWorkspace(ws._id); setEditName(ws.name); setWorkspaceMenu(null); }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" /> Rename
                      </button>
                      {(ws.owner?._id === user?._id || ws.owner === user?._id) && (
                        <button
                          onClick={() => handleDeleteWorkspace(ws)}
                          className="w-full px-4 py-2.5 text-left text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}

            {workspaces.length === 0 && (
              <button
                onClick={() => setShowCreateWorkspace(true)}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all border-2 border-dashed bg-transparent text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-primary-500 hover:text-primary-500 dark:hover:border-primary-400 dark:hover:text-primary-400"
              >
                <PlusIcon className="w-4 h-4" /> Create your first workspace
              </button>
            )}
          </div>
        </div>

        {/* Create Workspace Modal */}
        {showCreateWorkspace && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCreateWorkspace(false)} />
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <div className="animate-fade-in-up w-full max-w-md bento-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold">Create Workspace</h3>
                  <button onClick={() => setShowCreateWorkspace(false)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleCreateWorkspace}>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Workspace Name *</label>
                    <input
                      autoFocus type="text" value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="e.g., Engineering Team"
                      required
                      className="input-field"
                    />
                  </div>
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">Description</label>
                    <textarea
                      value={newWorkspaceDesc}
                      onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                      placeholder="What's this workspace for?"
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setShowCreateWorkspace(false)}
                      className="flex-1 btn-secondary"
                    >Cancel</button>
                    <button type="submit" disabled={creatingWorkspace || !newWorkspaceName.trim()}
                      className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >{creatingWorkspace ? 'Creating...' : 'Create Workspace'}</button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* ─── Stats Row ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in-up stagger-1 mb-12">

          {/* Active Projects Summary Card */}
          <div className="bento-card p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-purple flex items-center justify-center shadow-lg shadow-primary-500/50">
                <FolderIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold">{filteredProjects.length}</span>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Active Projects</p>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold">+2 this week</div>
            </div>
          </div>

          {/* Active Tasks Summary Card */}
          <div className="bento-card p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <ArrowTrendingUpIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold">{stats.total}</span>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Active Tasks</p>
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-semibold">+{stats.completed > 0 ? Math.round((stats.completed / stats.total) * 20) : 0}% from last month</div>
            </div>
          </div>

          {/* AI Suggestions Summary Card */}
          <div className="bento-card p-6 flex flex-col border-accent-purple/30 dark:border-accent-purple/30 bg-accent-purple/5 dark:bg-accent-purple/5">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-purple to-pink-500 flex items-center justify-center shadow-lg shadow-accent-purple/50">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold">{aiSuggestions.length}</span>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">AI Suggestions</p>
            <p className="text-xs font-semibold text-accent-purple dark:text-purple-400">Actionable insights available</p>
          </div>

          {/* Team Efficiency Summary Card */}
          <div className="bento-card p-6 flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                <FireIcon className="w-6 h-6 text-white" />
              </div>
              <span className="text-4xl font-bold">{stats.teamEfficiency}%</span>
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Team Efficiency</p>
            <div className="w-full bg-gray-200 dark:bg-white/10 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${stats.teamEfficiency}%` }}></div>
            </div>
          </div>

        </div>

        {/* ─── AI Suggestions (Actionable List) ─── */}
        {aiSuggestions.length > 0 && (
          <div className="animate-fade-in-up" style={{ animationDelay: '0.15s', marginBottom: 48 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 className="text-gray-900 dark:text-white" style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <SparklesIcon style={{ width: 20, height: 20, color: '#A78BFA' }} />
                AI Suggestions
              </h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {aiSuggestions.map(suggestion => (
                <div key={suggestion.id} className="bg-white/50 dark:bg-white/5" style={{ border: '1px solid rgba(139,92,246,0.15)', borderRadius: 20, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, backdropFilter: 'blur(40px) saturate(180%)', WebkitBackdropFilter: 'blur(40px) saturate(180%)', boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px #A78BFA' }} />
                    <span className="text-gray-800 dark:text-slate-200" style={{ fontSize: '0.9rem', fontWeight: 500 }}>{suggestion.text}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
                        if (suggestion.action === 'Review Tasks') {
                          toast.success('Filtering overdue tasks...');
                          navigate('/tasks?dueDateRange=overdue');
                        } else if (suggestion.action === 'Prioritize') {
                          toast.success('Filtering high priority tasks...');
                          navigate('/tasks?priority=high,urgent&status=todo');
                        } else if (suggestion.action === 'Check Status') {
                          toast.success('Filtering stale in-progress tasks...');
                          navigate('/tasks?status=in-progress');
                        } else if (suggestion.action === 'Use AI Generator') {
                          toast.success('Opening AI Task Generator...');
                          setShowAIGenerator(true);
                        } else {
                          toast.success(`Action applied: ${suggestion.action}`);
                        }
                      }}
                      style={{ padding: '6px 16px', borderRadius: 10, background: '#8B5CF6', color: '#fff', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(139,92,246,0.3)' }}
                      onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      {suggestion.action}
                    </button>
                    <button
                      onClick={() => setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id))}
                      style={{ padding: '6px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                      onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Project Overview ─── */}
        <div className="animate-fade-in-up stagger-2 mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {activeWorkspace ? `Projects in ${activeWorkspace.name}` : 'Your Projects'}
            </h2>
            <button onClick={() => setShowCreateProject(true)} className="text-sm font-semibold text-primary-500 hover:text-primary-400 transition-colors">Create New +</button>
          </div>

          {myProjects.length === 0 && invitedProjects.length === 0 ? (
            <div className="bento-card p-12 text-center border-dashed border-2">
              <FolderIcon className="w-14 h-14 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">
                {activeWorkspace ? `No projects in ${activeWorkspace.name}` : 'No projects yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                {activeWorkspace ? 'Create a project in this workspace to get started.' : 'Create your first project to get started.'}
              </p>
              <button onClick={() => setShowCreateProject(true)} className="btn-primary inline-flex">
                Create Project
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
              {/* My Projects Section */}
              {myProjects.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserGroupIcon style={{ width: 18, height: 18, color: '#6366F1' }} />
                      My Projects
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: '#6366F1', padding: '4px 10px', borderRadius: 10 }}>
                      {myProjects.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    {myProjects.map((project, index) => {
                      const m = projectMetrics[project._id] || { total: 0, completed: 0 };
                      const progress = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
                      const projectColor = project.color || '#6366F1';
                      return (
                        <Link
                          key={project._id}
                          to={`/projects/${project._id}`}
                          className="bento-card block p-6 relative flex-1 min-w-[300px]"
                          style={{ '--project-color': projectColor }}
                        >
                          <div className="absolute top-4 right-4 text-[10px] font-bold bg-primary-500 text-white px-2 py-1 rounded-md uppercase tracking-widest">
                            Owner
                          </div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: `linear-gradient(135deg, ${projectColor}, ${projectColor}CC)`, boxShadow: `0 4px 16px ${projectColor}40` }}>
                                {project.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold mb-1">{project.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{project.description || 'No description'}</p>
                              </div>
                            </div>
                            <ProgressRing progress={progress} color={projectColor} />
                          </div>

                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <ClockIcon className="w-4 h-4" /> {m.total} Tasks
                            </span>
                            <span className="flex items-center gap-1.5" style={{ color: progress === 100 ? '#10B981' : '#6366F1' }}>
                              {progress === 100 ? <CheckCircleIcon className="w-4 h-4" /> : <ChartBarIcon className="w-4 h-4" />}
                              {progress}% Done
                            </span>
                            {m.overdue > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <FireIcon className="w-4 h-4" /> {m.overdue} overdue
                              </span>
                            )}
                          </div>

                          {/* Thin progress bar */}
                          <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${projectColor}, ${projectColor}99)` }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Invited Projects Section */}
              {invitedProjects.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <h3 className="text-gray-900 dark:text-white" style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserGroupIcon style={{ width: 18, height: 18, color: '#A78BFA' }} />
                      Invited Projects
                    </h3>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', background: '#A78BFA', padding: '4px 10px', borderRadius: 10 }}>
                      {invitedProjects.length}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                    {invitedProjects.map((project, index) => {
                      const m = projectMetrics[project._id] || { total: 0, completed: 0 };
                      const progress = m.total > 0 ? Math.round((m.completed / m.total) * 100) : 0;
                      const projectColor = project.color || '#6366F1';
                      return (
                        <Link
                          key={project._id}
                          to={`/projects/${project._id}`}
                          className="bento-card block p-6 relative flex-1 min-w-[300px]"
                          style={{ '--project-color': projectColor }}
                        >
                          <div className="absolute top-4 right-4 text-[10px] font-bold bg-accent-purple text-white px-2 py-1 rounded-md uppercase tracking-widest">
                            Invited
                          </div>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: `linear-gradient(135deg, ${projectColor}, ${projectColor}CC)`, boxShadow: `0 4px 16px ${projectColor}40` }}>
                                {project.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h3 className="text-lg font-bold mb-1">{project.name}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{project.description || 'No description'}</p>
                              </div>
                            </div>
                            <ProgressRing progress={progress} color={projectColor} />
                          </div>

                          <div className="flex items-center gap-4 text-xs font-semibold">
                            <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                              <ClockIcon className="w-4 h-4" /> {m.total} Tasks
                            </span>
                            <span className="flex items-center gap-1.5" style={{ color: progress === 100 ? '#10B981' : '#6366F1' }}>
                              {progress === 100 ? <CheckCircleIcon className="w-4 h-4" /> : <ChartBarIcon className="w-4 h-4" />}
                              {progress}% Done
                            </span>
                            {m.overdue > 0 && (
                              <span className="flex items-center gap-1 text-red-500">
                                <FireIcon className="w-4 h-4" /> {m.overdue} overdue
                              </span>
                            )}
                          </div>

                          {/* Thin progress bar */}
                          <div className="mt-4 h-1 w-full bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${projectColor}, ${projectColor}99)` }} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ─── Recent Activity ─── */}
        <div className="animate-fade-in-up stagger-3 mb-12">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="text-gray-900 dark:text-white" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Recent Activity</h2>
            {recentTasks.length > 3 && (
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                style={{ background: 'none', border: 'none', fontSize: '0.8rem', fontWeight: 600, color: '#818CF8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s', padding: '6px 12px', borderRadius: 10 }}
                onMouseOver={e => { e.currentTarget.style.color = '#A5B4FC'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)' }}
                onMouseOut={e => { e.currentTarget.style.color = '#818CF8'; e.currentTarget.style.background = 'none' }}
              >
                {showAllActivity ? 'Show Less' : `View All (${recentTasks.length})`}
                <ChevronRightIcon style={{ width: 14, height: 14, transition: 'transform 0.3s', transform: showAllActivity ? 'rotate(90deg)' : 'rotate(0deg)' }} />
              </button>
            )}
          </div>
          <div className="bento-card overflow-hidden">
            {recentTasks.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-sm">No recent activity</div>
            ) : (
              <div>
                {visibleRecentTasks.map(task => (
                  <div key={task._id} className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <div className={`w-2.5 h-2.5 rounded-full ${getStatusClass(task.status)}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{task.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">{task.description || 'No details'}</p>
                    </div>
                    <div className="hidden sm:block">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold bg-opacity-20 ${getPriorityClass(task.priority)}`}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 font-medium whitespace-nowrap">
                      {task.updatedAt ? new Date(task.updatedAt).toLocaleDateString() : 'Just now'}
                    </div>
                  </div>
                ))}
                {!showAllActivity && recentTasks.length > 3 && (
                  <button
                    onClick={() => setShowAllActivity(true)}
                    className="w-full py-3 text-sm font-bold text-primary-500 hover:text-primary-400 hover:bg-primary-500/10 flex items-center justify-center gap-2 transition-all border-t border-gray-200 dark:border-white/5"
                  >
                    View {recentTasks.length - 3} more activities
                    <ChevronRightIcon className="w-4 h-4 rotate-90" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="animate-fade-in-up stagger-4">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { to: null, onClick: () => setShowAIGenerator(true), icon: SparklesIcon, label: 'Generate with AI', color: '#8B5CF6', bg: 'rgba(139,92,246,0.12)' },
              { to: null, onClick: () => setShowCreateWorkspace(true), icon: Squares2X2Icon, label: 'New Workspace', color: '#818CF8', bg: 'rgba(99,102,241,0.12)' },
              { to: null, onClick: () => setShowCreateProject(true), icon: FolderIcon, label: 'New Project', color: '#A78BFA', bg: 'rgba(167,139,250,0.12)' },
              { to: '/tasks', icon: TableCellsIcon, label: 'All Tasks', color: '#F472B6', bg: 'rgba(244,114,182,0.12)' },
              { to: '/calendar', icon: CalendarDaysIcon, label: 'Calendar', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
              { to: '/analytics', icon: ChartBarIcon, label: 'Analytics', color: '#FBBF24', bg: 'rgba(251,191,36,0.12)' },
            ].map((action, idx) => {
              const inner = (
                <>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 duration-300" style={{ background: action.bg }}>
                    <action.icon className="w-6 h-6" style={{ color: action.color }} />
                  </div>
                  <span className="text-xs font-bold">{action.label}</span>
                </>
              );

              if (action.to) {
                return <Link key={idx} to={action.to} className="bento-card p-6 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-all">{inner}</Link>;
              }
              return <button key={idx} onClick={action.onClick} className="bento-card p-6 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-all w-full">{inner}</button>;
            })}
          </div>
        </div>
      </div>

      {/* ═══════ CREATE TASK MODAL ═══════ */}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreated={fetchDashboardData}
          defaultProjectId={activeWorkspace && projects.filter(p => p.workspace === activeWorkspace._id || p.workspace?._id === activeWorkspace._id)[0]?._id}
        />
      )}

      {/* ═══════ AI TASK GENERATOR MODAL ═══════ */}
      {showAIGenerator && (
        <AITaskGeneratorModal
          onClose={() => setShowAIGenerator(false)}
          onCreated={fetchDashboardData}
          defaultProjectId={activeWorkspace && projects.filter(p => p.workspace === activeWorkspace._id || p.workspace?._id === activeWorkspace._id)[0]?._id}
        />
      )}

      {/* ═══════ CREATE PROJECT MODAL ═══════ */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onCreated={fetchDashboardData}
        />
      )}

      {/* ─── Footer ─── */}
      <footer className="relative border-t border-white/5 pt-12 pb-8 bg-[#0B0F19] overflow-hidden mt-12 shadow-none dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {/* Subtle footer glow */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[150px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-[1400px] w-full mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
            {/* Column 1: Brand & Info */}
            <div className="col-span-1 md:col-span-2 md:pr-12">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-[0_5px_15px_rgba(99,102,241,0.3)]">
                  <SparklesIcon className="h-4 w-4 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tight text-white drop-shadow-md">Centrion</span>
              </div>
              <p className="text-gray-400 text-[13px] mb-6 leading-relaxed font-medium">
                Modern task management and collaboration platform similar to Trello and Asana. Built with the MERN stack with Socket.io real-time updates.
              </p>
              <div className="flex gap-3 opacity-80">
                {/* Social Links */}
                <a href="mailto:support@centrion.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all text-gray-400 focus:outline-none" title="Support Email">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/30 transition-all text-gray-400 focus:outline-none" title="GitHub">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                </a>
              </div>
            </div>

            {/* Column 2: Tech Stack */}
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <RocketLaunchIcon className="w-4 h-4 text-indigo-400" />
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
                <Squares2X2Icon className="w-4 h-4 text-indigo-400" />
                Navigation
              </h4>
              <ul className="space-y-3.5 text-[13px] text-gray-400 font-medium">
                <li><Link to="/tasks" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" /> All Tasks</Link></li>
                <li><Link to="/kanban" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" /> Kanban Board</Link></li>
                <li><Link to="/calendar" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" /> Calendar View</Link></li>
                <li><Link to="/analytics" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" /> Analytics</Link></li>
              </ul>
            </div>

            {/* Column 4: Account & Support */}
            <div>
              <h4 className="font-bold text-white mb-5 uppercase tracking-widest text-[11px] flex items-center gap-2">
                <CheckCircleIcon className="w-4 h-4 text-indigo-400" />
                Account
              </h4>
              <ul className="space-y-3.5 text-[13px] text-gray-400 font-medium">
                <li><Link to="/profile" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" /> Profile & Settings</Link></li>
                <li><a href="mailto:support@centrion.com" className="hover:text-indigo-400 transition-colors flex items-center gap-2 group"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-indigo-400" /> Help Center</a></li>
                <li><button onClick={logout} className="hover:text-red-400 transition-colors flex items-center gap-2 group focus:outline-none"><ChevronRightIcon className="w-3.5 h-3.5 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all text-red-400" /> Sign Out</button></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          {/* <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-500 font-medium">
            <p>&copy; {new Date().getFullYear()} Centrion Tasks. MIT License.</p>
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse"></div>
                All systems operational
              </span>
              <button className="hover:text-white transition-colors focus:outline-none">Privacy Policy</button>
            </div>
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
