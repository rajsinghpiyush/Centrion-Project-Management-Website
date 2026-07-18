import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { taskAPI, projectAPI } from '../services/api';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  SunIcon,
  MoonIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  FlagIcon,
  SparklesIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import '../styles/Dashboard.css';
const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const statusConfig = {
  'todo': { label: 'To Do', dot: '#6B7280' },
  'in-progress': { label: 'In Progress', dot: '#818CF8' },
  'review': { label: 'In Review', dot: '#FBBF24' },
  'completed': { label: 'Completed', dot: '#34D399' },
  'blocked': { label: 'Blocked', dot: '#F87171' },
};

const CalendarView = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => { fetchData(); }, []);

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
      console.error('Error fetching calendar data:', error);
      toast.error('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

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

  const tasksByDate = useMemo(() => {
    const map = {};
    const filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus);
    filtered.forEach(task => {
      if (task.dueDate) {
        const d = new Date(task.dueDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        map[key].push({ ...task, dateType: 'due' });
      }
      if (task.startDate) {
        const d = new Date(task.startDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        if (!task.dueDate || new Date(task.dueDate).toDateString() !== d.toDateString()) {
          map[key].push({ ...task, dateType: 'start' });
        }
      }
      if (task.completedAt) {
        const d = new Date(task.completedAt);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map[key]) map[key] = [];
        const dueSame = task.dueDate && new Date(task.dueDate).toDateString() === d.toDateString();
        const startSame = task.startDate && new Date(task.startDate).toDateString() === d.toDateString();
        if (!dueSame && !startSame) {
          map[key].push({ ...task, dateType: 'completed' });
        }
      }
    });
    return map;
  }, [tasks, filterStatus]);

  const getTasksForDate = (day) => tasksByDate[`${year}-${month}-${day}`] || [];
  const getProjectName = (id) => projects.find(p => p._id === id)?.name || 'Unknown';
  const getProjectColor = (id) => projects.find(p => p._id === id)?.color || '#6B7280';
  const isToday = (day) => day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast = (day) => new Date(year, month, day) < today;
  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  // Pad trailing to fill last row
  while (cells.length % 7 !== 0) cells.push(null);
  const numRows = cells.length / 7;

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111827' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.06)', borderTopColor: '#818CF8', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#4B5563', fontSize: '0.8rem', fontWeight: 600 }}>Loading calendar...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Whether sidebar is showing detail
  const showingSidebar = selectedTask || selectedDate;
  const overdueTasks = tasks.filter(t => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed');

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
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

      {/* ═══ NAV BAR ═══ */}
      <nav className="sticky top-0 z-50 bg-[#0B0F19]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
        <div className="max-w-[1400px] w-full mx-auto px-6 h-20 flex justify-between items-center">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/dashboard" style={{
            width: 36, height: 36, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            color: '#6B7280', textDecoration: 'none', transition: 'all 0.15s',
          }}>
            <ArrowLeftIcon style={{ width: 16, height: 16 }} />
          </Link>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.02em' }}>
            Calendar
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 10, fontWeight: 800,
            }}>
              {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} alt="Avatar" /> : user?.name?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
              {user?.name}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              padding: 10, borderRadius: 12,
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.45)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >
            {theme === 'dark' ? <SunIcon style={{ width: 20, height: 20 }} /> : <MoonIcon style={{ width: 20, height: 20 }} />}
          </button>
          </div>
        </div>
      </nav>

      {/* ═══ MAIN CONTENT ═══ */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Calendar Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px 24px', overflow: 'hidden' }}>
          {/* Controls Row */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F9FAFB', letterSpacing: '-0.03em', margin: 0 }}>
                {MONTHS[month]} <span style={{ color: '#6B7280' }}>{year}</span>
              </h1>
              <div style={{
                display: 'flex', borderRadius: 10, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <button onClick={prevMonth} style={{
                  width: 32, height: 32, background: 'rgba(255,255,255,0.03)',
                  border: 'none', color: '#9CA3AF', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRight: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.15s',
                }}>
                  <ChevronLeftIcon style={{ width: 14, height: 14 }} />
                </button>
                <button onClick={nextMonth} style={{
                  width: 32, height: 32, background: 'rgba(255,255,255,0.03)',
                  border: 'none', color: '#9CA3AF', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
                }}>
                  <ChevronRightIcon style={{ width: 14, height: 14 }} />
                </button>
              </div>
              <button onClick={goToToday} style={{
                padding: '6px 14px', borderRadius: 9, fontSize: '0.72rem', fontWeight: 700,
                background: 'rgba(129,140,248,0.08)', color: '#818CF8',
                border: '1px solid rgba(129,140,248,0.15)', cursor: 'pointer', transition: 'all 0.15s',
              }}>
                Today
              </button>
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                padding: '7px 12px', borderRadius: 10, fontSize: '0.75rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.03)', color: '#D1D5DB',
                border: '1px solid rgba(255,255,255,0.06)', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="all">All Status</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

            {/* Calendar Grid */}
            <div className="bento-card flex-1 flex flex-col relative z-10 overflow-hidden">
            {/* Day headers */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}>
              {DAYS.map(day => (
                <div key={day} style={{
                  padding: '10px 0',
                  textAlign: 'center',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: '#4B5563',
                  letterSpacing: '0.1em',
                }}>
                  {day}
                </div>
              ))}
            </div>

            {/* Date cells */}
            <div className="flex-1 grid grid-cols-7 gap-[1px] bg-gray-100 dark:bg-white/5" style={{ gridTemplateRows: `repeat(${numRows}, 1fr)` }}>
              {cells.map((day, i) => {
                if (day === null) {
                  return <div key={`e-${i}`} className="bg-white dark:bg-[#0B0F19]" />;
                }

                const dayTasks = getTasksForDate(day);
                const isTodayCell = isToday(day);
                const isSelected = selectedDate === day;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDate(isSelected ? null : day)}
                    className={`p-2 flex flex-col cursor-pointer transition-colors border-l-2 ${isSelected ? 'bg-primary-50 dark:bg-primary-500/10 border-primary-500' : 'bg-white dark:bg-[#0B0F19] border-transparent hover:bg-gray-50 dark:hover:bg-white/5'}`}
                  >
                    {/* Day number */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700,
                        ...(isTodayCell ? {
                          background: 'linear-gradient(135deg, #818CF8, #6366F1)',
                          color: '#fff',
                          boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                        } : {
                          color: isPast(day) ? '#4B5563' : '#D1D5DB',
                        }),
                      }}>
                        {day}
                      </span>
                      {dayTasks.length > 0 && (
                        <span style={{
                          fontSize: '0.58rem', fontWeight: 700,
                          color: '#818CF8', background: 'rgba(129,140,248,0.1)',
                          padding: '1px 5px', borderRadius: 5,
                        }}>
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Task pills */}
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {dayTasks.slice(0, 2).map((task, idx) => {
                        const cfg = statusConfig[task.status] || statusConfig['todo'];
                        return (
                          <div
                            key={`${task._id}-${idx}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedDate(day); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              padding: '3px 6px', borderRadius: 6,
                              background: `${cfg.dot}10`,
                              cursor: 'pointer', transition: 'background 0.15s',
                              overflow: 'hidden',
                            }}
                          >
                            <div style={{
                              width: 5, height: 5, borderRadius: '50%',
                              background: cfg.dot, flexShrink: 0,
                            }} />
                            <span style={{
                              fontSize: '0.62rem', fontWeight: 600,
                              color: '#D1D5DB',
                              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                            }}>
                              {task.title}
                            </span>
                          </div>
                        );
                      })}
                      {dayTasks.length > 2 && (
                        <span style={{
                          fontSize: '0.56rem', color: '#6B7280', fontWeight: 600, paddingLeft: 2,
                        }}>
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ═══ SIDEBAR ═══ */}
        <div style={{
          width: 324, flexShrink: 0,
          display: 'flex', flexDirection: 'column',
          padding: '62px 24px 20px 0', // 62px top to align perfectly with the calendar grid after its title
          overflow: 'hidden',
          zIndex: 10,
          position: 'relative',
          background: 'transparent'
        }}>
          <div className="bento-card flex-1 flex flex-col overflow-hidden">
          {selectedDate ? (
            /* ── Date Detail with rich task cards ── */
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, }} className="custom-scrollbar">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F9FAFB', margin: 0, letterSpacing: '-0.01em' }}>
                    {MONTHS[month]} {selectedDate}
                  </h3>
                  <p style={{ fontSize: '0.7rem', color: '#6B7280', fontWeight: 500, marginTop: 3 }}>
                    {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''} scheduled
                  </p>
                </div>
                <button
                  onClick={() => { setSelectedDate(null); setSelectedTask(null); }}
                  style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#F87171'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#6B7280'; }}
                >
                  <XMarkIcon style={{ width: 14, height: 14 }} />
                </button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '40px 16px', textAlign: 'center',
                  background: 'rgba(255,255,255,0.02)', borderRadius: 14,
                  border: '1px dashed rgba(255,255,255,0.06)',
                }}>
                  <CalendarDaysIcon style={{ width: 28, height: 28, color: '#374151', marginBottom: 10 }} />
                  <p style={{ fontSize: '0.78rem', color: '#4B5563', fontWeight: 600, margin: 0 }}>No tasks on this date</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedDateTasks.map((task, idx) => {
                    const cfg = statusConfig[task.status] || statusConfig['todo'];
                    const pColor = getProjectColor(task.project?._id || task.project);
                    const isOverdue = task.dueDate && new Date(task.dueDate) < today && task.status !== 'completed';
                    return (
                      <Link
                        key={`${task._id}-${idx}`}
                        to={`/projects/${task.project?._id || task.project}`}
                        style={{
                          padding: 14, borderRadius: 14, textDecoration: 'none',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.15s', cursor: 'pointer',
                          display: 'block',
                        }}
                        onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                        onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        {/* Title row */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: cfg.dot,
                            flexShrink: 0, marginTop: 5,
                          }} />
                          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#F3F4F6', margin: 0, lineHeight: 1.3, flex: 1 }}>
                            {task.title}
                          </h4>
                        </div>

                        {/* Meta badges */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                          <span style={{
                            fontSize: '0.58rem', fontWeight: 700,
                            color: cfg.dot, background: `${cfg.dot}15`,
                            padding: '2px 8px', borderRadius: 6, letterSpacing: '0.02em',
                          }}>
                            {cfg.label}
                          </span>
                          {task.priority && (
                            <span style={{
                              fontSize: '0.58rem', fontWeight: 700, textTransform: 'capitalize',
                              color: task.priority === 'urgent' || task.priority === 'high' ? '#F87171' : task.priority === 'medium' ? '#FBBF24' : '#34D399',
                              background: task.priority === 'urgent' || task.priority === 'high' ? 'rgba(248,113,113,0.1)' : task.priority === 'medium' ? 'rgba(251,191,36,0.1)' : 'rgba(52,211,153,0.1)',
                              padding: '2px 8px', borderRadius: 6,
                            }}>
                              {task.priority}
                            </span>
                          )}
                          {task.dateType && (
                            <span style={{
                              fontSize: '0.56rem', fontWeight: 600, color: '#6B7280',
                              background: 'rgba(255,255,255,0.04)', padding: '2px 7px', borderRadius: 5,
                            }}>
                              {task.dateType === 'due' ? '📅 Due' : task.dateType === 'start' ? '🚀 Start' : '✅ Done'}
                            </span>
                          )}
                        </div>

                        {/* Bottom row: project + due date */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: pColor }} />
                            <span style={{ fontSize: '0.62rem', fontWeight: 600, color: '#6B7280' }}>
                              {getProjectName(task.project?._id || task.project)}
                            </span>
                          </div>
                          {task.dueDate && (
                            <span style={{
                              fontSize: '0.6rem', fontWeight: 600,
                              color: isOverdue ? '#F87171' : '#4B5563',
                            }}>
                              {isOverdue ? '⚠ ' : ''}
                              {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* ── Overview (Redesigned) ── */
            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} className="custom-scrollbar">
              {/* Summary Stats */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24,
              }}>
                {[
                  { label: 'Total', value: tasks.length, color: '#818CF8' },
                  { label: 'Done', value: tasks.filter(t => t.status === 'completed').length, color: '#34D399' },
                  { label: 'Overdue', value: overdueTasks.length, color: '#F87171' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '14px 10px', borderRadius: 12, textAlign: 'center',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                    <p style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color, margin: 0 }}>{s.value}</p>
                    <p style={{ fontSize: '0.58rem', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4, margin: 0, marginTop: 4 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              {tasks.length > 0 && (() => {
                const done = tasks.filter(t => t.status === 'completed').length;
                const pct = Math.round((done / tasks.length) * 100);
                return (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#9CA3AF' }}>Completion</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: pct === 100 ? '#34D399' : '#818CF8' }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#34D399' : 'linear-gradient(90deg, #818CF8, #6366F1)', borderRadius: 100, transition: 'width 0.6s ease' }} />
                    </div>
                  </div>
                );
              })()}

              {/* Status breakdown */}
              <div style={{ marginBottom: 24 }}>
                <h4 style={{ fontSize: '0.62rem', fontWeight: 800, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>
                  By Status
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.entries(statusConfig).map(([key, cfg]) => {
                    const count = tasks.filter(t => t.status === key).length;
                    const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                    return (
                      <div key={key}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot }} />
                            <span style={{ fontSize: '0.72rem', fontWeight: 500, color: '#9CA3AF' }}>{cfg.label}</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#E5E7EB' }}>{count}</span>
                        </div>
                        <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 100, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: cfg.dot, borderRadius: 100, transition: 'width 0.5s ease', opacity: 0.7 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Overdue section */}
              {overdueTasks.length > 0 && (
                <div style={{
                  borderRadius: 14, padding: 14,
                  background: 'rgba(248,113,113,0.04)',
                  border: '1px solid rgba(248,113,113,0.08)',
                }}>
                  <h4 style={{
                    fontSize: '0.6rem', fontWeight: 800, color: '#F87171',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <ExclamationTriangleIcon style={{ width: 12, height: 12 }} />
                    Overdue ({overdueTasks.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {overdueTasks
                      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                      .slice(0, 4)
                      .map(task => (
                        <div
                          key={task._id}
                          onClick={() => {
                            const d = new Date(task.dueDate);
                            setCurrentDate(new Date(d.getFullYear(), d.getMonth(), 1));
                            setSelectedDate(d.getDate());
                          }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '7px 9px', borderRadius: 8,
                            background: 'rgba(255,255,255,0.03)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}
                          onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                          onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                        >
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#F87171', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: '#F3F4F6', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {task.title}
                            </p>
                            <p style={{ fontSize: '0.55rem', color: '#F87171', fontWeight: 600, margin: 0, marginTop: 1 }}>
                              Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
                )}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
  );
};

export default CalendarView;
