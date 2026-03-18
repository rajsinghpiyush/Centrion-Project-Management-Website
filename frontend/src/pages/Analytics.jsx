import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { taskAPI, projectAPI, workspaceAPI, aiAPI } from '../services/api';
import {
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  FireIcon,
  BoltIcon,
  FlagIcon,
  CalendarDaysIcon,
  UserIcon,
  FolderIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ActivityCalendar } from 'react-activity-calendar';
import '../styles/Dashboard.css';
const statusConfig = {
  'todo': { label: 'To Do', color: '#9CA3AF', bg: 'bg-gray-100 dark:bg-gray-700' },
  'in-progress': { label: 'In Progress', color: '#3B82F6', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  'review': { label: 'Review', color: '#F59E0B', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  'completed': { label: 'Completed', color: '#10B981', bg: 'bg-green-100 dark:bg-green-900/30' },
  'blocked': { label: 'Blocked', color: '#EF4444', bg: 'bg-red-100 dark:bg-red-900/30' },
};

const priorityColors = {
  'urgent': '#EF4444',
  'high': '#F97316',
  'medium': '#EAB308',
  'low': '#22C55E',
};

// Simple bar chart
const BarChart = ({ data, maxValue, height = 200 }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-3 justify-between" style={{ height }}>
      {data.map((item, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
          <div className="relative w-full flex justify-center">
            <span className="absolute -top-6 text-xs font-bold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity mb-1">{item.value}</span>
          </div>
          <div
            className="w-full rounded-t-xl transition-all duration-700 ease-out hover:opacity-80 relative overflow-hidden"
            style={{
              height: `${Math.max((item.value / max) * (height - 40), 4)}px`,
              backgroundColor: item.color,
              minWidth: '24px',
            }}
          >
             <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
          </div>
          <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 text-center uppercase tracking-wide truncate w-full">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// Donut chart
const DonutChart = ({ data, size = 180 }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 drop-shadow-xl">
        {data.map((item, i) => {
          const strokeLen = (item.value / total) * circumference;
          const currentOffset = offset;
          offset += strokeLen;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="24"
              strokeDasharray={`${strokeLen} ${circumference - strokeLen}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out hover:brightness-110 cursor-pointer"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{total}</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</span>
      </div>
    </div>
  );
};

// Progress ring
const ProgressRing = ({ value, max, size = 100, color = '#3B82F6', label }) => {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 group">
      <div className="relative drop-shadow-lg" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90 transform group-hover:scale-110 transition-transform duration-300">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-gray-900 dark:text-white">{percentage}%</span>
        </div>
      </div>
      <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
};

const Analytics = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('all');

  // AI Insights State
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const res = await workspaceAPI.getWorkspaces();
      const workspaces = res.data.workspaces;
      if (!workspaces || workspaces.length === 0) {
         toast.error("No workspaces found to generate insights for.");
         return;
      }
      // Use the first available workspace for insights
      const wsId = workspaces[0]._id;
      const aiRes = await aiAPI.getWorkspaceInsights(wsId);
      setAiInsights(aiRes.data.insights);
    } catch (e) {
      toast.error("Failed to fetch AI insights");
      console.error(e);
    } finally {
      setLoadingInsights(false);
    }
  };

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
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projectRes] = await Promise.all([
        taskAPI.getTasks(),
        projectAPI.getProjects(),
      ]);
      setTasks(taskRes.data.tasks || []);
      setProjects(projectRes.data.projects || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Filter tasks by project
  const filteredTasks = useMemo(() => {
    if (selectedProject === 'all') return tasks;
    return tasks.filter(t => (t.project?._id || t.project) === selectedProject);
  }, [tasks, selectedProject]);

  // Computed analytics
  const analytics = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'completed').length;
    const inProgress = filteredTasks.filter(t => t.status === 'in-progress').length;
    const review = filteredTasks.filter(t => t.status === 'review').length;
    const todo = filteredTasks.filter(t => t.status === 'todo').length;
    const blocked = filteredTasks.filter(t => t.status === 'blocked').length;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const overdue = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length;
    const noDueDate = filteredTasks.filter(t => !t.dueDate).length;

    // Priority breakdown
    const urgent = filteredTasks.filter(t => t.priority === 'urgent').length;
    const high = filteredTasks.filter(t => t.priority === 'high').length;
    const medium = filteredTasks.filter(t => t.priority === 'medium').length;
    const low = filteredTasks.filter(t => t.priority === 'low').length;

    // Completion rate
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Engagement score (weighted)
    const engagementScore = total > 0 ? Math.min(100, Math.round(
      (completed * 3 + inProgress * 2 + review * 1.5) / (total * 3) * 100
    )) : 0;

    // On-time rate
    const tasksWithDue = filteredTasks.filter(t => t.dueDate);
    const completedOnTime = filteredTasks.filter(t =>
      t.status === 'completed' && t.dueDate && t.completedAt &&
      new Date(t.completedAt) <= new Date(t.dueDate)
    ).length;
    const onTimeRate = tasksWithDue.filter(t => t.status === 'completed').length > 0
      ? Math.round((completedOnTime / tasksWithDue.filter(t => t.status === 'completed').length) * 100)
      : 0;

    // This week's tasks
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const thisWeekCompleted = filteredTasks.filter(t =>
      t.completedAt && new Date(t.completedAt) >= weekStart
    ).length;

    // Per-project stats
    const projectStats = projects.map(p => {
      const projectTasks = tasks.filter(t => (t.project?._id || t.project) === p._id);
      const projCompleted = projectTasks.filter(t => t.status === 'completed').length;
      const projTotal = projectTasks.length;
      return {
        id: p._id,
        name: p.name,
        color: p.color || '#6B7280',
        total: projTotal,
        completed: projCompleted,
        inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
        review: projectTasks.filter(t => t.status === 'review').length,
        todo: projectTasks.filter(t => t.status === 'todo').length,
        blocked: projectTasks.filter(t => t.status === 'blocked').length,
        overdue: projectTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'completed').length,
        progress: projTotal > 0 ? Math.round((projCompleted / projTotal) * 100) : 0,
      };
    });

    return {
      total, completed, inProgress, review, todo, blocked,
      overdue, noDueDate,
      urgent, high, medium, low,
      completionRate, engagementScore, onTimeRate, thisWeekCompleted,
      projectStats,
    };
  }, [filteredTasks, projects, tasks]);

  // Compute dynamic activity data for the heatmap based on task history
  const activityData = useMemo(() => {
    const end = new Date();
    const start = new Date(new Date().setFullYear(end.getFullYear() - 1));
    start.setHours(0,0,0,0);
    
    // Map dates to activity count
    const dateCounts = {};
    filteredTasks.forEach(task => {
        // Increment for creation
        if (task.createdAt) {
            const d = new Date(task.createdAt).toISOString().split('T')[0];
            dateCounts[d] = (dateCounts[d] || 0) + 1;
        }
        // Increment for updates
        if (task.updatedAt) {
            const d = new Date(task.updatedAt).toISOString().split('T')[0];
            dateCounts[d] = (dateCounts[d] || 0) + 1;
        }
        // Increment for completion
        if (task.completedAt) {
            const d = new Date(task.completedAt).toISOString().split('T')[0];
            dateCounts[d] = (dateCounts[d] || 0) + 2; // Weight completions higher
        }
    });

    const data = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const count = dateCounts[dateStr] || 0;
        
        let level = 0;
        if (count >= 10) level = 4;
        else if (count >= 5) level = 3;
        else if (count >= 2) level = 2;
        else if (count >= 1) level = 1;
        
        data.push({
            date: dateStr,
            count: count,
            level: level
        });
    }
    return data;
  }, [filteredTasks]);

  // Status donut data
  const statusDonutData = [
    { label: 'To Do', value: analytics.todo, color: statusConfig['todo'].color },
    { label: 'In Progress', value: analytics.inProgress, color: statusConfig['in-progress'].color },
    { label: 'Review', value: analytics.review, color: statusConfig['review'].color },
    { label: 'Completed', value: analytics.completed, color: statusConfig['completed'].color },
    { label: 'Blocked', value: analytics.blocked, color: statusConfig['blocked'].color },
  ].filter(d => d.value > 0);

  // Priority bar data
  const priorityBarData = [
    { label: 'Urgent', value: analytics.urgent, color: priorityColors.urgent },
    { label: 'High', value: analytics.high, color: priorityColors.high },
    { label: 'Medium', value: analytics.medium, color: priorityColors.medium },
    { label: 'Low', value: analytics.low, color: priorityColors.low },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-full border-[3px] border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-t-primary-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-400 dark:text-gray-500 animate-pulse">Gathering insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 selection:bg-primary-500/30">
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

      {/* Navigation - Minimal */}
      <nav className="sticky top-0 z-30" style={{ background: 'rgba(11,15,26,0.75)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px' }}>
          <div className="flex justify-between items-center" style={{ height: 64 }}>
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                 <ArrowLeftIcon className="w-5 h-5" />
              </Link>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                Analytics
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="pl-4 pr-10 py-2 text-sm font-medium border-none ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 shadow-sm appearance-none cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <option value="all">All Projects</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                  {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" /> : user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </span>
              </div>

              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
              >
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px' }} className="relative z-10">
        
        {/* AI Insights Card */}
        <div className="mb-6 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 dark:border-indigo-400/20 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl">
                <SparklesIcon className="w-32 h-32 text-indigo-500" />
            </div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1">
                    <h2 className="text-lg font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-indigo-500" />
                        AI Workspace Insights
                    </h2>
                    {aiInsights ? (
                        <ul className="space-y-3 mt-4">
                            {aiInsights.map((insight, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-200">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <span>{insight}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70 max-w-2xl">
                            Unlock AI-powered analysis of your team's workflow, potential bottlenecks, and intelligent recommendations to improve productivity.
                        </p>
                    )}
                </div>
                <div className="shrink-0 flex items-center justify-center">
                    <button 
                        onClick={fetchInsights} 
                        disabled={loadingInsights}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all focus:ring-2 focus:ring-indigo-500/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loadingInsights ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                {aiInsights ? 'Refresh Insights' : 'Generate Insights'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
        
        {/* Dynamic Activity Heatmap */}
        <div className="mb-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-hidden">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 mb-6">
               <CalendarDaysIcon className="w-5 h-5 text-indigo-500" />
               Workspace Activity
            </h3>
            <div className="w-full flex justify-center pb-2 overflow-x-auto custom-scrollbar">
                <ActivityCalendar 
                     data={activityData}
                     colorScheme={theme === 'dark' ? 'dark' : 'light'}
                     theme={{
                         light: ['#EBEDF0', '#9BE9A8', '#40C463', '#30A14E', '#216E39'],
                         dark: ['rgba(255,255,255,0.05)', '#4F46E5', '#6366F1', '#818CF8', '#A5B4FC']
                     }}
                     blockSize={14}
                     blockRadius={4}
                     blockMargin={4}
                     fontSize={12}
                />
            </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Tasks</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{analytics.total}</p>
            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500">{analytics.noDueDate} without due date</p>
          </div>

          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{analytics.completed}</p>
            <p className="text-[10px] font-medium text-green-500 flex items-center gap-1">
              <ArrowTrendingUpIcon className="w-3 h-3" />
              {analytics.completionRate}% completion rate
            </p>
          </div>

          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">In Progress</span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ClockIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{analytics.inProgress}</p>
            <p className="text-[10px] font-medium text-amber-500">{analytics.review} in review</p>
          </div>

          <div className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Overdue</span>
              <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{analytics.overdue}</p>
            <p className="text-[10px] font-medium text-red-500">{analytics.blocked} blocked tasks</p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Performance Score */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <SparklesIcon className="w-4 h-4 text-primary-500" />
              Team Performance
            </h3>
            <div className="flex justify-between items-end mb-5">
               <ProgressRing value={analytics.completionRate} max={100} size={90} color="#10B981" label="Completion" />
               <ProgressRing value={analytics.engagementScore} max={100} size={90} color="#3B82F6" label="Engagement" />
               <ProgressRing value={analytics.onTimeRate} max={100} size={90} color="#8B5CF6" label="On-Time" />
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/20 border border-gray-100 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BoltIcon className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Velocity (This week)</span>
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{analytics.thisWeekCompleted} tasks</span>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-blue-500" />
              Status Breakdown
            </h3>
            <div className="flex justify-center mb-4 py-2">
              {statusDonutData.length > 0 ? (
                <DonutChart data={statusDonutData} size={160} />
              ) : (
                <div className="w-[160px] h-[160px] rounded-full border-4 border-gray-100 dark:border-gray-700 border-dashed flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <p className="text-sm font-medium">No tasks</p>
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {statusDonutData.map((item) => (
                <div key={item.label} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/30 text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label} <span className="opacity-60">({item.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Priority Breakdown */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FlagIcon className="w-4 h-4 text-orange-500" />
              Task Priorities
            </h3>
            <div className="h-[160px] flex items-end mb-4">
              <BarChart data={priorityBarData} height={160} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {priorityBarData.map(item => (
                <div key={item.label} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{item.label}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">
          {/* Project Health - Redesigned */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FolderIcon className="w-4 h-4 text-purple-500" />
              Project Health
            </h3>

            {analytics.projectStats.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                <FolderIcon className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">No projects found</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[80vh] custom-scrollbar">
                {analytics.projectStats.map(project => (
                  <Link
                    key={project.id}
                    to={`/projects/${project.id}`}
                    className="group flex items-center gap-4 p-3.5 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:border-gray-200 dark:hover:border-gray-600 bg-white dark:bg-gray-900/20 hover:shadow-md transition-all duration-200"
                    style={{ textDecoration: 'none' }}
                  >
                    {/* Project icon */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: project.color }}>
                      {project.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name + progress bar */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-primary-500 transition-colors">
                          {project.name}
                        </span>
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-3 flex-shrink-0">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full flex">
                          <div className="bg-emerald-500 transition-all duration-500" style={{ width: `${project.total > 0 ? (project.completed / project.total) * 100 : 0}%` }} />
                          <div className="bg-blue-500 transition-all duration-500" style={{ width: `${project.total > 0 ? (project.inProgress / project.total) * 100 : 0}%` }} />
                          <div className="bg-amber-500 transition-all duration-500" style={{ width: `${project.total > 0 ? (project.review / project.total) * 100 : 0}%` }} />
                          <div className="bg-red-500 transition-all duration-500" style={{ width: `${project.total > 0 ? (project.blocked / project.total) * 100 : 0}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Compact stats */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {[
                        { count: project.completed, color: '#10B981' },
                        { count: project.inProgress, color: '#3B82F6' },
                        { count: project.overdue, color: '#EF4444' },
                      ].filter(s => s.count > 0).map((s, i) => (
                        <span key={i} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: s.color, background: `${s.color}15` }}>
                          {s.count}
                        </span>
                      ))}
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                        {project.total} total
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Latest Tasks - Redesigned */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
              Latest Tasks
            </h3>
            
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-1.5 custom-scrollbar">
              {filteredTasks.slice(0, 10).map((task) => {
                const sc = statusConfig[task.status] || statusConfig['todo'];
                const project = projects.find(p => p._id === (task.project?._id || task.project));
                return (
                  <div key={task._id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group cursor-default">
                    {/* Status accent */}
                    <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: sc.color, opacity: 0.7 }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{task.title}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                          {project?.name || 'No Project'}
                        </span>
                        {task.priority && ['urgent', 'high'].includes(task.priority) && (
                          <span className="text-[9px] font-bold px-1 py-px rounded" style={{ color: task.priority === 'urgent' ? '#EF4444' : '#F97316', background: task.priority === 'urgent' ? 'rgba(239,68,68,0.1)' : 'rgba(249,115,22,0.1)' }}>
                            {task.priority === 'urgent' ? 'Urgent' : 'High'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredTasks.length > 10 && (
              <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700 text-center">
                 <Link to="/dashboard" className="text-[10px] font-bold text-primary-600 hover:text-primary-500 uppercase tracking-wider">View All Tasks →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
