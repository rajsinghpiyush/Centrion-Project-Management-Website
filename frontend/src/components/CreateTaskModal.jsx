import React, { useState, useEffect } from 'react';
import { projectAPI, taskAPI } from '../services/api';
import {
  CheckCircleIcon,
  XMarkIcon,
  FolderIcon,
  SwatchIcon,
  FlagIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const CreateTaskModal = ({ onClose, onCreated, defaultProjectId = '', defaultStatus = 'todo' }) => {
  const [projects, setProjects] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    project: defaultProjectId,
    priority: 'medium',
    status: defaultStatus,
    dueDate: '',
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await projectAPI.getProjects();
        const list = res.data.projects || [];
        setProjects(list);
        if (!form.project && list.length > 0) {
          setForm(prev => ({ ...prev, project: list[0]._id }));
        }
      } catch {
        toast.error('Failed to load projects');
      }
    };
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Task title is required'); return; }
    if (!form.project) { toast.error('Please select a project'); return; }
    try {
      setCreating(true);
      const statusToColumn = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'completed': 'Completed' };
      await taskAPI.createTask({ ...form, column: statusToColumn[form.status] || 'To Do' });
      toast.success('Task created successfully!');
      if (onCreated) onCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '12px 16px', borderRadius: 14,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.875rem', outline: 'none', transition: 'all 0.3s', boxSizing: 'border-box',
  };

  const selectStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
    color: '#fff', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', appearance: 'none', boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8,
  };

  const handleFocus = (e) => { e.currentTarget.style.borderColor = '#6366F1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; };
  const handleBlur = (e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 520, background: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, boxShadow: '0 32px 100px rgba(0,0,0,0.6)', margin: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6366F1, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
                <CheckCircleIcon style={{ width: 22, height: 22, color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>New Task</h3>
            </div>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <XMarkIcon style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Task Title *</label>
              <input autoFocus type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="e.g. Redesign homepage hero section" required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            {/* Project + Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}><FolderIcon style={{ width: 14, height: 14 }} /> Project</label>
                <select value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} required style={selectStyle}>
                  <option value="" disabled>Select project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}><SwatchIcon style={{ width: 14, height: 14 }} /> Status</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} style={selectStyle}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Priority + Due Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}><FlagIcon style={{ width: 14, height: 14 }} /> Priority</label>
                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 3 }}>
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <button key={p} type="button" onClick={() => setForm(prev => ({ ...prev, priority: p }))}
                      style={{
                        flex: 1, padding: '7px 4px', fontSize: '0.7rem', fontWeight: 700, borderRadius: 10,
                        border: 'none', cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.2s',
                        background: form.priority === p ? 'rgba(99,102,241,0.2)' : 'transparent',
                        color: form.priority === p ? '#A5B4FC' : 'rgba(255,255,255,0.4)',
                      }}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}><CalendarDaysIcon style={{ width: 14, height: 14 }} /> Due Date</label>
                <input type="date" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  style={{ ...selectStyle, cursor: 'pointer' }} />
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}><DocumentTextIcon style={{ width: 14, height: 14 }} /> Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="Add any extra details..." rows={3}
                style={{ ...inputStyle, resize: 'none' }} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >Cancel</button>
              <button type="submit" disabled={creating || !form.title.trim()}
                style={{ flex: 1, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #6366F1, #4F46E5)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 16px rgba(99,102,241,0.35)', opacity: (creating || !form.title.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
              >{creating ? 'Creating...' : 'Create Task'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateTaskModal;
