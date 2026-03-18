import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { taskAPI, projectAPI } from '../services/api';
import {
  ListBulletIcon, Squares2X2Icon, ChartBarIcon,
  PhotoIcon, FunnelIcon, ArrowsUpDownIcon, ChevronDownIcon,
  XMarkIcon, PlusIcon, ArrowLeftIcon, SunIcon, MoonIcon,
  PaperClipIcon, ClockIcon, 
  BookmarkIcon,CheckCircleIcon,
  ArrowRightOnRectangleIcon, EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import NotificationsPopover from '../components/NotificationsPopover';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import { BellIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import '../styles/TasksView.css';
import '../styles/Dashboard.css';
const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: 'bg-gray-400', dot: 'bg-gray-400' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500', dot: 'bg-blue-500' },
  { value: 'review', label: 'Review', color: 'bg-amber-500', dot: 'bg-amber-500' },
  { value: 'completed', label: 'Completed', color: 'bg-emerald-500', dot: 'bg-emerald-500' },
];

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  { value: 'high', label: 'High', color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' },
  { value: 'medium', label: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
  { value: 'low', label: 'Low', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
];

const SORT_OPTIONS = [
  { value: 'createdAt-desc', label: 'Newest First' },
  { value: 'createdAt-asc', label: 'Oldest First' },
  { value: 'dueDate-asc', label: 'Due Date (Earliest)' },
  { value: 'dueDate-desc', label: 'Due Date (Latest)' },
  { value: 'priority-desc', label: 'Priority (High → Low)' },
  { value: 'priority-asc', label: 'Priority (Low → High)' },
  { value: 'title-asc', label: 'Alphabetical (A-Z)' },
  { value: 'title-desc', label: 'Alphabetical (Z-A)' },
];

const GROUP_OPTIONS = [
  { value: 'none', label: 'No Grouping' },
  { value: 'project', label: 'By Project' },
  { value: 'status', label: 'By Status' },
  { value: 'priority', label: 'By Priority' },
  { value: 'assignee', label: 'By Assignee' },
];

const VIEW_MODES = [
  { id: 'list', label: 'List', icon: ListBulletIcon },
  { id: 'kanban', label: 'Kanban', icon: Squares2X2Icon },
  { id: 'timeline', label: 'Timeline', icon: ChartBarIcon },
  { id: 'gallery', label: 'Gallery', icon: PhotoIcon },
];

const PRIORITY_ORDER = { urgent: 4, high: 3, medium: 2, low: 1 };

const TasksView = () => {
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);

  // Filters
  const [filters, setFilters] = useState({ status: [], priority: [], project: [], dueDateRange: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt-desc');
  const [groupBy, setGroupBy] = useState('none');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showGroupMenu, setShowGroupMenu] = useState(false);

  // Filter presets
  const [savedPresets, setSavedPresets] = useState(() => {
    try { return JSON.parse(localStorage.getItem('taskFilterPresets') || '[]'); } catch { return []; }
  });
  const [presetName, setPresetName] = useState('');
  const [showPresetSave, setShowPresetSave] = useState(false);


  // Timeline Filter
  const [timelineStatusFilter, setTimelineStatusFilter] = useState('todo');

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

  const [searchParams] = useSearchParams();

  // Apply filters from URL query params (e.g. from AI suggestions on Dashboard)
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const dueDateParam = searchParams.get('dueDateRange');

    if (statusParam || priorityParam || dueDateParam) {
      setFilters(prev => ({
        ...prev,
        status: statusParam ? statusParam.split(',') : prev.status,
        priority: priorityParam ? priorityParam.split(',') : prev.priority,
        dueDateRange: dueDateParam || prev.dueDateRange,
      }));
      setShowFilters(true);
    }
  }, [searchParams]);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskRes, projectRes] = await Promise.all([taskAPI.getTasks(), projectAPI.getProjects()]);
      setTasks(taskRes.data.tasks || []);
      setProjects(projectRes.data.projects || []);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter(v => v !== value) : [...prev[type], value],
    }));
  };

  const clearFilters = () => setFilters({ status: [], priority: [], project: [], dueDateRange: '' });

  const activeFilterCount = filters.status.length + filters.priority.length + filters.project.length + (filters.dueDateRange ? 1 : 0);

  // Filtered + Sorted tasks
  const processedTasks = useMemo(() => {
    let result = [...tasks];

    if (filters.status.length) result = result.filter(t => filters.status.includes(t.status));
    if (filters.priority.length) result = result.filter(t => filters.priority.includes(t.priority));
    if (filters.project.length) {
      result = result.filter(t => {
        const pid = typeof t.project === 'object' ? t.project?._id : t.project;
        return filters.project.includes(pid);
      });
    }
    if (filters.dueDateRange) {
      const now = new Date();
      result = result.filter(t => {
        if (!t.dueDate) return filters.dueDateRange === 'none';
        const due = new Date(t.dueDate);
        switch (filters.dueDateRange) {
          case 'overdue': return due < now && t.status !== 'completed';
          case 'today': return due.toDateString() === now.toDateString();
          case 'week': { const end = new Date(now); end.setDate(end.getDate() + 7); return due >= now && due <= end; }
          case 'month': { const end = new Date(now); end.setMonth(end.getMonth() + 1); return due >= now && due <= end; }
          case 'none': return !t.dueDate;
          default: return true;
        }
      });
    }

    // Sort
    const [field, dir] = sortBy.split('-');
    result.sort((a, b) => {
      let cmp = 0;
      switch (field) {
        case 'title': cmp = (a.title || '').localeCompare(b.title || ''); break;
        case 'priority': cmp = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0); break;
        case 'dueDate': cmp = (new Date(a.dueDate || '9999') - new Date(b.dueDate || '9999')); break;
        default: cmp = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return dir === 'desc' ? -cmp : cmp;
    });
    return result;
  }, [tasks, filters, sortBy]);

  // Grouped tasks
  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') return { 'All Tasks': processedTasks };
    const map = {};
    processedTasks.forEach(t => {
      let key;
      switch (groupBy) {
        case 'status': key = STATUS_OPTIONS.find(s => s.value === t.status)?.label || t.status; break;
        case 'priority': key = PRIORITY_OPTIONS.find(p => p.value === t.priority)?.label || t.priority; break;
        case 'project': {
          const pid = typeof t.project === 'object' ? t.project?._id : t.project;
          key = projects.find(p => p._id === pid)?.name || 'Unknown Project'; break;
        }
        case 'assignee': key = t.assignees?.length > 0 ? 'Assigned' : 'Unassigned'; break;
        default: key = 'All';
      }
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [processedTasks, groupBy, projects]);

  const getProjectName = (t) => {
    const pid = typeof t.project === 'object' ? t.project?._id : t.project;
    return projects.find(p => p._id === pid)?.name || '';
  };

  const savePreset = () => {
    if (!presetName.trim()) return;
    const preset = { name: presetName.trim(), filters: { ...filters }, sortBy, groupBy, id: Date.now() };
    const updated = [...savedPresets, preset];
    setSavedPresets(updated);
    localStorage.setItem('taskFilterPresets', JSON.stringify(updated));
    setPresetName('');
    setShowPresetSave(false);
    toast.success('Filter preset saved!');
  };

  const loadPreset = (preset) => {
    setFilters(preset.filters);
    setSortBy(preset.sortBy);
    setGroupBy(preset.groupBy);
    toast.success(`Loaded "${preset.name}"`);
  };

  const deletePreset = (id) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem('taskFilterPresets', JSON.stringify(updated));
  };

  // Helper to grab matching pastel and deep background colors based on a string
  const getGalleryColors = (title) => {
    const pairs = [
      { bg: '#172A45', text: '#60A5FA' }, // Slate & Blue
      { bg: '#451A2E', text: '#F472B6' }, // Dark Pink
      { bg: '#103928', text: '#34D399' }, // Dark Emerald
      { bg: '#422006', text: '#FBBF24' }, // Dark Amber
      { bg: '#2E1065', text: '#A78BFA' }, // Dark Purple
      { bg: '#083344', text: '#22D3EE' }, // Dark Cyan
    ];
    let hash = 0;
    const str = title || 'X';
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return pairs[Math.abs(hash) % pairs.length];
  };

  // Helper to clean HTML string from rich text descriptions
  const getCleanDesc = (htmlStr) => {
    if (!htmlStr) return '';
    return htmlStr.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
  };

  const getPriorityColor = (p) => {
    switch(p) {
      case 'urgent': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#facc15';
      case 'low': return '#22c55e';
      default: return '#facc15';
    }
  };

  // === RENDER HELPERS ===
  const TaskRow = ({ task }) => {
    const priorityColor = getPriorityColor(task.priority);
    const assignName = task.assignees && task.assignees.length > 0 ? task.assignees[0].name : 'U';

    return (
      <div 
        onClick={() => setSelectedTask(task)} 
        className="tasks-view-list-row group relative cursor-pointer"
        style={{ overflow: 'hidden', padding: '16px 20px', gap: '16px' }}
      >
        {/* Priority Strip */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: priorityColor, boxShadow: `0 0 10px ${priorityColor}80`, borderRadius: '0 4px 4px 0' }} />
        
        {/* Avatar */}
        <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#fff',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
           {assignName.charAt(0).toUpperCase()}
        </div>

        {/* Content Stack */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="tasks-view-list-title" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px', color: '#F8FAFC' }}>
            {task.title}
          </p>
          <p className="tasks-view-list-subtitle" style={{ fontSize: '13px', color: '#94A3B8' }}>
            {getCleanDesc(task.description) || getProjectName(task) || 'No description provided'}
          </p>
        </div>

        {/* Action button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }} 
          className="tasks-view-list-action"
          style={{ padding: '8px', opacity: 1, background: 'transparent', border: 'none', color: '#94A3B8' }}
          onMouseOver={(e) => { e.currentTarget.style.color = '#fff' }}
          onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8' }}
        >
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>
      </div>
    );
  };
  const KanbanColumn = ({ status, tasks: colTasks }) => {
    return (
      <div className="tasks-view-kanban-column" style={{ 
        minWidth: '340px', 
        flex: 1, 
        borderRadius: '16px', 
        padding: '16px', 
        background: 'rgba(255, 255, 255, 0.02)', // Dark subtle background
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        {/* Column Header */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full`} style={{ background: status.color?.replace('bg-', '') || '#64748b' }} />
            <span className="text-[13px] font-extrabold text-[#94a3b8] tracking-widest uppercase">{status.label}</span>
          </div>
          <span className="flex items-center justify-center min-w-[24px] h-6 px-1.5 rounded-md bg-white/5 text-white/50 text-[11px] font-bold">
            {colTasks.length}
          </span>
        </div>
        
        {/* Task List */}
        <div className="space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar pr-2 pb-2">
          {colTasks.map(task => {
            const priorityColor = getPriorityColor(task.priority);
            const assignName = task.assignees && task.assignees.length > 0 ? task.assignees[0].name : 'U';
            
            // Just for UI mimicking: fake tags and subtasks if they don't exist
            const tempTag = task.tags && task.tags.length > 0 ? task.tags[0] : (status.value === 'in-progress' ? 'Frontend' : (status.value === 'review' ? 'Backend' : 'Docs'));
            const isCompleted = status.value === 'completed';

            return (
              <div key={task._id} onClick={() => setSelectedTask(task)}
                className="group relative flex flex-col p-5 rounded-2xl cursor-pointer transition-all duration-300"
                style={{
                   background: '#161a2b', // Deep card color
                   border: '1px solid rgba(255, 255, 255, 0.04)',
                   boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                
                {!isCompleted && (
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    {/* Priority Badge */}
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" 
                          style={{ color: priorityColor, border: `1px solid ${priorityColor}40`, background: `${priorityColor}15` }}>
                      {task.priority || 'medium'}
                    </span>
                    
                    {/* Mock Tag Badge */}
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-gray-400"
                          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {tempTag}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h4 className="font-bold text-[14px] text-white leading-snug mb-3">
                  {task.title}
                </h4>
                
                {/* Status Specific Elements (In Progress bar, Review comments, Done date) */}
                {status.value === 'in-progress' && (
                  <div className="w-full mb-4">
                     <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: '75%', background: 'linear-gradient(90deg, #38BDF8 0%, #3B82F6 100%)' }} />
                     </div>
                     <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] font-semibold text-gray-500">3/4 subtasks</span>
                     </div>
                  </div>
                )}

                {status.value === 'review' && (
                  <div className="flex items-center gap-1.5 mb-4 text-[#F59E0B] text-[11px] font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    <span>{task.comments?.length || 2} comments</span>
                  </div>
                )}

                {isCompleted && (
                  <div className="flex items-center gap-1.5 mb-4 text-[#10B981] text-[11px] font-bold">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span>Completed {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'recently'}</span>
                  </div>
                )}

                {/* Bottom Bar: Date & Avatar */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  {/* Date */}
                  {!isCompleted && status.value !== 'in-progress' && status.value !== 'review' ? (
                     <div className="flex items-center gap-1.5 text-gray-500 text-[11px] font-bold">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Due Date'}</span>
                    </div>
                  ) : <div />}

                  {/* Avatar */}
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-[#161a2b] ml-auto" 
                       style={{ background: task.assignees && task.assignees.length > 0 ? 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' : '#10B981' }}>
                    {assignName.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Add Task Button inside Column */}
          {colTasks.length === 0 && (
            <div className="w-full py-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center text-gray-500 text-xs font-bold hover:bg-white/5 hover:border-white/20 transition-colors cursor-pointer"
                 onClick={() => setShowCreateTask(true)}>
              + Add Task
            </div>
          )}
          {colTasks.length > 0 && (
            <div className="w-full py-3 mt-2 border border-white/10 rounded-xl flex items-center justify-center text-white text-[11px] tracking-wider font-bold hover:bg-white/5 transition-colors cursor-pointer"
                 onClick={() => setShowCreateTask(true)}>
              + Add Task
            </div>
          )}
        </div>
      </div>
    );
  };

  // Timeline helpers
  const timelineTasks = useMemo(() => {
    let filtered = processedTasks;
    if (timelineStatusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === timelineStatusFilter);
    }
    return filtered.filter(t => t.dueDate || t.startDate).sort((a, b) => new Date(a.startDate || a.dueDate) - new Date(b.startDate || b.dueDate));
  }, [processedTasks, timelineStatusFilter]);

  const timelineRange = useMemo(() => {
    if (!timelineTasks.length) return { start: new Date(), end: new Date(), days: 30 };
    const dates = timelineTasks.flatMap(t => [t.startDate, t.dueDate].filter(Boolean).map(d => new Date(d)));
    const min = new Date(Math.min(...dates)); min.setDate(min.getDate() - 2);
    const max = new Date(Math.max(...dates)); max.setDate(max.getDate() + 5);
    return { start: min, end: max, days: Math.max(14, Math.ceil((max - min) / (1000 * 60 * 60 * 24))) };
  }, [timelineTasks]);

  const timelineAreas = useMemo(() => {
    if (!timelineTasks.length) return { path1: '', path2: '', path3: '' };
    
    const colWidth = 130;
    const height = 450;
    const days = Math.min(timelineRange.days, 60);

    const points = { g1: [], g2: [], g3: [] };
    let maxTotal = 1;
    
    for (let i = 0; i <= days; i++) {
        const currentDate = new Date(timelineRange.start);
        currentDate.setDate(currentDate.getDate() + i);
        
        let counts = { g1: 0, g2: 0, g3: 0 };
        timelineTasks.forEach(t => {
            const s = new Date(t.startDate || t.dueDate || new Date());
            const e = new Date(t.dueDate || t.startDate || new Date());
            const dStr = currentDate.toDateString();
            if ((currentDate >= s && currentDate <= e) || s.toDateString() === dStr || e.toDateString() === dStr) {
                 if (t.priority === 'urgent' || t.priority === 'high') counts.g1 += 1;
                 else if (t.priority === 'medium') counts.g2 += 1;
                 else counts.g3 += 1;
            }
        });
        
        counts.g1 += 1.5; counts.g2 += 2.5; counts.g3 += 3.5; 
        
        const rand = Math.sin(i * 0.8) * 1.5;
        points.g1.push(counts.g1 + rand);
        points.g2.push(counts.g2 + rand + counts.g1); 
        points.g3.push(counts.g3 + rand + counts.g2 + counts.g1);
        
        maxTotal = Math.max(maxTotal, counts.g3 + rand + counts.g2 + counts.g1 + 5);
    }
    
    const generatePath = (dataArr) => {
        if (!dataArr.length) return '';
        let d = `M 65 ${height - (dataArr[0]/maxTotal)*height}`;
        for (let i = 0; i < dataArr.length - 1; i++) {
            const x0 = i * colWidth + 65;
            const y0 = height - (dataArr[i]/maxTotal)*height;
            const x1 = (i + 1) * colWidth + 65;
            const y1 = height - (dataArr[i+1]/maxTotal)*height;
            const cx = (x0 + x1) / 2;
            d += ` C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}`;
        }
        
        const lastX = (dataArr.length - 1) * colWidth + 65;
        d += ` L ${lastX} 800 L 65 800 Z`; 
        return d;
    };
    
    return {
       path1: generatePath(points.g3), 
       path2: generatePath(points.g2), 
       path3: generatePath(points.g1), 
    };
  }, [timelineTasks, timelineRange]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="relative"><div className="w-14 h-14 rounded-full border-[3px] border-gray-200 dark:border-gray-700" /><div className="absolute inset-0 w-14 h-14 rounded-full border-[3px] border-t-primary-500 animate-spin" /></div>
          <p className="text-sm text-gray-400 animate-pulse">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tasks-view-page">
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

      {/* Nav */}
      <nav className="tasks-view-nav">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-3">
              <Link to="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"><ArrowLeftIcon className="w-5 h-5" /></Link>
              <span className="text-lg font-bold text-gray-900 dark:text-white">Tasks</span>
              <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full font-bold">{processedTasks.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"><BellIcon className="w-5 h-5" /></button>
                {showNotifications && <NotificationsPopover onClose={() => setShowNotifications(false)} />}
              </div>
              <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>
              <button onClick={logout} className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-600 transition-colors"><ArrowRightOnRectangleIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 py-6 relative z-10">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          {/* View Switcher */}
          <div className="tasks-view-switcher">
            {VIEW_MODES.map(v => (
              <button key={v.id} onClick={() => setViewMode(v.id)}
                className={`tasks-view-switcher-btn ${
                  viewMode === v.id ? 'tasks-view-switcher-btn-active' : 'tasks-view-switcher-btn-inactive'
                }`}>
                <v.icon className="w-4 h-4" /> <span className="hidden md:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* New Task Button */}
            <button onClick={() => setShowCreateTask(true)} className="tasks-view-action-btn tasks-view-btn-primary" style={{ border: 'none', cursor: 'pointer' }}>
              <PlusIcon className="w-4 h-4" /> New Task
            </button>

            {/* Filter Button */}
            <button onClick={() => setShowFilters(!showFilters)}
              className={`tasks-view-action-btn ${
                activeFilterCount > 0 ? 'tasks-view-btn-active' : 'tasks-view-btn-secondary'
              }`}>
              <FunnelIcon className="w-4 h-4" /> Filter {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-[10px]">{activeFilterCount}</span>}
            </button>

            {/* Sort */}
            <div className="relative">
              <button onClick={() => { setShowSortMenu(!showSortMenu); setShowGroupMenu(false); }}
                className="tasks-view-action-btn tasks-view-btn-secondary">
                <ArrowsUpDownIcon className="w-4 h-4" /> Sort <ChevronDownIcon className="w-3 h-3" />
              </button>
              {showSortMenu && (
                <><div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
                <div className="tasks-view-dropdown-menu">
                  {SORT_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setSortBy(o.value); setShowSortMenu(false); }}
                      className={`tasks-view-dropdown-item ${sortBy === o.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      {o.label}
                    </button>
                  ))}
                </div></>
              )}
            </div>

            {/* Group */}
            <div className="relative">
              <button onClick={() => { setShowGroupMenu(!showGroupMenu); setShowSortMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 transition-all">
                <Squares2X2Icon className="w-4 h-4" /> Group <ChevronDownIcon className="w-3 h-3" />
              </button>
              {showGroupMenu && (
                <><div className="fixed inset-0 z-40" onClick={() => setShowGroupMenu(false)} />
                <div className="tasks-view-dropdown-menu">
                  {GROUP_OPTIONS.map(o => (
                    <button key={o.value} onClick={() => { setGroupBy(o.value); setShowGroupMenu(false); }}
                      className={`tasks-view-dropdown-item ${groupBy === o.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      {o.label}
                    </button>
                  ))}
                </div></>
              )}
            </div>

            {/* Save Preset */}
            {activeFilterCount > 0 && (
              <button onClick={() => setShowPresetSave(true)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <BookmarkIcon className="w-4 h-4" /> Save
              </button>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="tasks-view-filter-panel animate-fade-in-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Filters</h3>
              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-600 font-medium">Clear All</button>}
                <button onClick={() => setShowFilters(false)}><XMarkIcon className="w-4 h-4 text-gray-400" /></button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status */}
              <div>
                <p className="tasks-view-filter-label">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} onClick={() => toggleFilter('status', s.value)}
                      className={`tasks-view-filter-tag ${
                        filters.status.includes(s.value) ? 'tasks-view-filter-tag-active' : 'tasks-view-filter-tag-inactive'
                      }`}>
                      <div className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Priority */}
              <div>
                <p className="tasks-view-filter-label">Priority</p>
                <div className="flex flex-wrap gap-1.5">
                  {PRIORITY_OPTIONS.map(p => (
                    <button key={p.value} onClick={() => toggleFilter('priority', p.value)}
                      className={`tasks-view-filter-tag ${
                        filters.priority.includes(p.value) ? 'tasks-view-filter-tag-active' : 'tasks-view-filter-tag-inactive'
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Project */}
              <div>
                <p className="tasks-view-filter-label">Project</p>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                  {projects.map(p => (
                    <button key={p._id} onClick={() => toggleFilter('project', p._id)}
                      className={`tasks-view-filter-tag truncate max-w-[140px] ${
                        filters.project.includes(p._id) ? 'tasks-view-filter-tag-active' : 'tasks-view-filter-tag-inactive'
                      }`}>
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
              {/* Due Date */}
              <div>
                <p className="tasks-view-filter-label">Due Date</p>
                <div className="flex flex-wrap gap-1.5">
                  {[{ v: 'overdue', l: 'Overdue' }, { v: 'today', l: 'Today' }, { v: 'week', l: 'This Week' }, { v: 'month', l: 'This Month' }, { v: 'none', l: 'No Due Date' }].map(d => (
                    <button key={d.v} onClick={() => setFilters(prev => ({ ...prev, dueDateRange: prev.dueDateRange === d.v ? '' : d.v }))}
                      className={`tasks-view-filter-tag ${
                        filters.dueDateRange === d.v ? 'tasks-view-filter-tag-active' : 'tasks-view-filter-tag-inactive'
                      }`}>
                      {d.l}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Saved Presets */}
            {savedPresets.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="tasks-view-filter-label">Saved Presets</p>
                <div className="flex flex-wrap gap-2">
                  {savedPresets.map(p => (
                    <div key={p.id} className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 rounded-lg overflow-hidden">
                      <button onClick={() => loadPreset(p)} className="px-3 py-1.5 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">{p.name}</button>
                      <button onClick={() => deletePreset(p.id)} className="px-1.5 py-1.5 text-primary-400 hover:text-red-500 transition-colors"><XMarkIcon className="w-3 h-3" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Save Preset Modal */}
        {showPresetSave && (
          <><div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setShowPresetSave(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="tasks-view-preset-modal">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Save Filter Preset</h3>
              <input autoFocus value={presetName} onChange={e => setPresetName(e.target.value)} placeholder="Preset name..." className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-sm text-gray-900 dark:text-white outline-none focus:border-primary-500 mb-4" onKeyDown={e => e.key === 'Enter' && savePreset()} />
              <div className="flex gap-2">
                <button onClick={() => setShowPresetSave(false)} className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold text-sm">Cancel</button>
                <button onClick={savePreset} disabled={!presetName.trim()} className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm disabled:opacity-50">Save</button>
              </div>
            </div>
          </div></>
        )}

        {/* ═══ VIEW CONTENT ═══ */}
        {viewMode === 'list' && (
          <div>
            {Object.entries(groupedTasks).map(([group, gTasks]) => (
              <div key={group} className="mb-6">
                {groupBy !== 'none' && (
                  <div className="tasks-view-group-header">
                    <h3 className="tasks-view-group-title">{group}</h3>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-bold">{gTasks.length}</span>
                  </div>
                )}
                <div className="tasks-view-list-container">
                  {gTasks.length === 0 ? <p className="p-8 text-center text-sm text-gray-400">No tasks match filters</p> : gTasks.map(t => <TaskRow key={t._id} task={t} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-4">
            {STATUS_OPTIONS.map(s => (
              <KanbanColumn key={s.value} status={s} tasks={processedTasks.filter(t => t.status === s.value)} />
            ))}
          </div>
        )}

        {viewMode === 'timeline' && (
          <div className="flex overflow-hidden rounded-2xl border border-white/5 bg-[#121626]" style={{ height: '700px' }}>
             {/* Left Active Tasks Sidebar */}
             <div className="w-[300px] flex-shrink-0 border-r border-white/5 bg-[#161a2b] flex flex-col z-20" style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.4)' }}>
                  <div className="h-[65px] flex items-center justify-between px-6 border-b border-white/5">
                    <span className="font-bold text-[11px] text-gray-400 tracking-wider">ACTIVE TASKS</span>
                    <select 
                      className="bg-transparent border border-white/10 text-white text-[10px] rounded px-1.5 py-1 outline-none cursor-pointer hover:bg-white/5 transition-colors"
                      value={timelineStatusFilter}
                      onChange={e => setTimelineStatusFilter(e.target.value)}
                    >
                      <option value="all" className="bg-[#161a2b]">All</option>
                      <option value="todo" className="bg-[#161a2b]">Todo</option>
                      <option value="in-progress" className="bg-[#161a2b]">In Progress</option>
                      <option value="review" className="bg-[#161a2b]">Review</option>
                      <option value="completed" className="bg-[#161a2b]">Completed</option>
                    </select>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {timelineTasks.length === 0 && (
                      <div className="p-8 text-center text-xs text-gray-500">No tasks found in this status</div>
                    )}
                    {timelineTasks.map(task => (
                      <div key={`sidebar-${task._id}`} className="h-[90px] border-b border-white/5 p-5 relative group hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setSelectedTask(task)}>
                        <h4 className="text-[14px] font-bold text-gray-100 mb-2 truncate pr-6">{task.title}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-gray-400">
                           <span className="truncate max-w-[120px]">{getProjectName(task) || 'No Project'}</span>
                           <span className="text-[10px] opacity-50">•</span>
                           <span className="capitalize" style={{ color: task.status === 'completed' ? '#34d399' : (task.status === 'in-progress' ? '#60a5fa' : '#a78bfa') }}>
                             {task.status.replace('-', ' ')}
                           </span>
                        </div>
                        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
                          <EllipsisHorizontalIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="h-[90px] border-t border-white/5 flex items-center px-6 bg-[#0E1222]">
                     <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-xl px-4 py-3 w-full">
                        <CheckCircleIcon className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-[10px] text-gray-400 mb-1">Overall Velocity</p>
                          <p className="text-[13px] font-bold text-white leading-tight">92.4% Optimal</p>
                        </div>
                     </div>
                  </div>
             </div>

             {/* Right Timeline Grid Area */}
             <div className="flex-1 overflow-auto custom-scrollbar bg-[#0E1222] relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
               {timelineTasks.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500 z-10">
                     No tasks with dates in this status to display.
                  </div>
               ) : (
                  <>
                    {/* Wavy Background Graphic Overlay */}
                    <svg className="absolute inset-x-0 bottom-0 min-w-full h-full pointer-events-none opacity-80 mix-blend-screen" width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={timelineAreas.path1} fill="rgba(30, 41, 59, 0.5)" />
                      <path d={timelineAreas.path2} fill="rgba(59, 130, 246, 0.15)" />
                      <path d={timelineAreas.path3} fill="rgba(225, 29, 72, 0.2)" />
                    </svg>

                    <div className="absolute inset-0 min-w-max flex flex-col pointer-events-none">
                      {/* Header Dates Row */}
                      <div className="flex h-[65px] border-b border-white/5 pointer-events-auto bg-[#0E1222]/80 backdrop-blur-sm z-10 sticky top-0">
                        {Array.from({ length: Math.min(timelineRange.days, 60) }, (_, i) => {
                          const d = new Date(timelineRange.start); d.setDate(d.getDate() + i);
                          const isToday = d.toDateString() === new Date().toDateString();
                          const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
                          return (
                            <div key={i} className={`w-[130px] flex-shrink-0 flex flex-col items-center justify-center border-r border-white/5 min-w-[130px] transition-colors ${isToday ? 'bg-white/5' : ''}`}>
                              <span className={`text-[13px] font-bold ${isToday ? 'text-primary-400' : 'text-gray-300'}`}>{d.getDate()}</span>
                              <span className={`text-[9px] uppercase tracking-widest mt-1 ${isToday ? 'text-primary-500/70' : 'text-gray-500'}`}>{months[d.getMonth()]}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Grid Lines Body */}
                      <div className="flex-1 flex relative">
                        {Array.from({ length: Math.min(timelineRange.days, 60) }, (_, i) => (
                           <div key={`grid-${i}`} className="w-[130px] flex-shrink-0 min-w-[130px] border-r border-white/5 h-full" />
                        ))}
                        
                        {/* Interactive Task Graph Markers */}
                        <div className="absolute inset-x-0 top-0 flex flex-col pointer-events-auto">
                           {timelineTasks.map((task, idx) => {
                              const start = new Date(task.startDate || task.dueDate);
                              const startOffset = Math.max(0, (start - timelineRange.start) / (1000 * 60 * 60 * 24));
                              
                              const leftPx = startOffset * 130 + 40; 
                              const isRed = task.priority === 'urgent' || task.priority === 'high';
                              const barBg = isRed ? 'rgba(159, 18, 57, 0.4)' : 'rgba(30, 41, 59, 0.6)';
                              const barBorder = isRed ? '#f43f5e' : '#94a3b8';
                              const titleShort = task.title.length > 12 ? task.title.substring(0, 12) + '...' : task.title;
                              
                              return (
                                <div key={`timeline-row-${task._id}`} className="h-[90px] border-b border-transparent relative w-full group cursor-pointer" onClick={() => setSelectedTask(task)}>
                                  <div className="absolute top-1/2 -translate-y-1/2 flex items-center h-[34px] rounded-full px-4 text-[12px] font-bold text-gray-100 hover:brightness-125 transition-all z-10 backdrop-blur-md"
                                       style={{ 
                                         left: `${leftPx}px`, 
                                         background: barBg, 
                                         border: `1px solid ${barBorder}50`,
                                         boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
                                         whiteSpace: 'nowrap'
                                       }}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-white mr-2.5 opacity-90 shadow-[0_0_8px_white]" />
                                    <span className="tracking-wide">{titleShort}</span>
                                  </div>
                                </div>
                              );
                           })}
                        </div>
                      </div>
                    </div>
                  </>
               )}
             </div>
          </div>
        )}

        {viewMode === 'gallery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {processedTasks.map(task => {
              const galleryColors = getGalleryColors(task.title);
              const priorityBg = getPriorityColor(task.priority);
              const assignName = task.assignees && task.assignees.length > 0 ? task.assignees[0].name : 'U';

              return (
                <div key={task._id} onClick={() => setSelectedTask(task)}
                  className="tasks-view-gallery-card group">
                  
                  {/* Big Color Block Header */}
                  <div className="relative h-40 w-full flex items-center justify-center transition-all duration-300" style={{ background: galleryColors.bg, borderBottomRightRadius: 0, borderBottomLeftRadius: 0 }}>
                    <span className="text-[90px] font-black tracking-tighter" style={{ color: galleryColors.text, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{task.title?.charAt(0).toUpperCase()}</span>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }} 
                      className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                      style={{ background: 'transparent', border: 'none', padding: 0 }}
                    >
                      <EllipsisHorizontalIcon className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                  
                  {/* Content Area */}
                  <div className="p-5 flex flex-col flex-1 bg-[#161a2b]">
                    {/* Tags */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full`} style={{ background: priorityBg, boxShadow: `0 0 8px ${priorityBg}` }} />
                        <span className={`text-[10px] font-bold uppercase tracking-widest`} style={{ color: priorityBg }}>{task.priority || 'Medium'}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#F8FAFC' }}>
                        {getProjectName(task) || 'No Project'}
                      </span>
                    </div>
                    
                    {/* Title & Desc */}
                    <h3 className="text-[17px] leading-tight font-bold text-white line-clamp-1 mb-2 group-hover:text-amber-400 transition-colors">{task.title}</h3>
                    <p className="text-[13px] text-gray-400 line-clamp-2 mb-6" style={{ minHeight: '40px', lineHeight: '1.5' }}>
                      {getCleanDesc(task.description) || 'No description provided for this task.'}
                    </p>
                    
                    {/* Footer Metrics */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-4 text-gray-400 text-[11px] font-bold tracking-wide">
                        <div className="flex items-center gap-1.5" style={{ color: '#F8FAFC' }}>
                          <ClockIcon className="w-4 h-4" />
                          <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          <span>{task.comments?.length || Math.floor(Math.random() * 15)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 hover:text-white transition-colors">
                          <PaperClipIcon className="w-3.5 h-3.5" />
                          <span>0</span>
                        </div>
                      </div>

                      {/* Avatar */}
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm ring-2 ring-[#161a2b]" style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)' }}>
                        {assignName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {processedTasks.length === 0 && (
              <div className="col-span-full p-12 text-center text-sm text-gray-400 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">No tasks match your filters</div>
            )}
          </div>
        )}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
            setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
            setSelectedTask(updatedTask);
          }}
          onDelete={(taskId) => {
             setTasks(prev => prev.filter(t => t._id !== taskId));
             setSelectedTask(null);
             toast.success('Task deleted');
          }}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreated={() => fetchData()}
        />
      )}
    </div>
  );
};

export default TasksView;
