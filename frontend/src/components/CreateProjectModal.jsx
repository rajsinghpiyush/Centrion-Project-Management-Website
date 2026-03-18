import React, { useState, useEffect } from 'react';
import { projectAPI, workspaceAPI, taskAPI, aiAPI } from '../services/api';
import {
  FolderIcon,
  XMarkIcon,
  DocumentTextIcon,
  SwatchIcon,
  BuildingOfficeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PROJECT_COLORS = [
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#06B6D4', name: 'Cyan' },
];

const CreateProjectModal = ({ onClose, onCreated, defaultWorkspaceId = '' }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    workspace: defaultWorkspaceId,
    color: '#3B82F6',
  });
  const [useAI, setUseAI] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await workspaceAPI.getWorkspaces();
        const list = res.data.workspaces || [];
        setWorkspaces(list);
        if (!form.workspace && list.length > 0) {
          setForm(prev => ({ ...prev, workspace: list[0]._id }));
        }
      } catch {
        toast.error('Failed to load workspaces');
      }
    };
    fetchWorkspaces();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Project name is required'); return; }
    if (!form.workspace) { toast.error('Please select a workspace'); return; }
    if (useAI && !form.description.trim()) { toast.error('AI generation requires a project description'); return; }

    try {
      setCreating(true);
      
      if (useAI) {
          toast.success('Generating Kanban structure...', { duration: 3000 });
          const aiRes = await aiAPI.generateKanban({ text: form.description || form.name });
          const structure = aiRes.data.structure || [];
          
          const projRes = await projectAPI.createProject(form);
          const newProject = projRes.data.project;
          
          let taskCount = 0;
          for (const col of structure) {
              for (const taskTitle of col.tasks || []) {
                  try {
                      await taskAPI.createTask({
                          title: taskTitle,
                          project: newProject._id,
                          column: col.title, // Maps naturally
                          status: col.id === 'todo' ? 'todo' : col.id === 'in_progress' ? 'in-progress' : 'todo',
                          priority: 'medium'
                      });
                      taskCount++;
                  } catch (err) {
                      console.error('Failed creating AI task', err);
                  }
              }
          }
          toast.success(`Project created with \${taskCount} AI tasks!`);
      } else {
          await projectAPI.createProject(form);
          toast.success('Project created successfully!');
      }

      if (onCreated) onCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
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

  const handleFocus = (e) => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'; };
  const handleBlur = (e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}>
        <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: 480, background: '#151B2E', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, boxShadow: '0 32px 100px rgba(0,0,0,0.6)', margin: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(139,92,246,0.35)' }}>
                <FolderIcon style={{ width: 22, height: 22, color: '#fff' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>New Project</h3>
            </div>
            <button onClick={onClose} style={{ padding: 6, borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', transition: 'all 0.2s' }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            >
              <XMarkIcon style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Project Name */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Project Name *</label>
              <input autoFocus type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Q4 Marketing Campaign" required style={inputStyle} onFocus={handleFocus} onBlur={handleBlur} />
            </div>

            {/* Workspace */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}><BuildingOfficeIcon style={{ width: 14, height: 14 }} /> Workspace</label>
              <select value={form.workspace} onChange={e => setForm(p => ({ ...p, workspace: e.target.value }))} required style={selectStyle}>
                <option value="" disabled>Select workspace</option>
                {workspaces.map(ws => <option key={ws._id} value={ws._id}>{ws.name}</option>)}
              </select>
              {workspaces.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: '#FBBF24', marginTop: 6 }}>No workspaces found. Create one first.</p>
              )}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}><DocumentTextIcon style={{ width: 14, height: 14 }} /> Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                placeholder="What is this project about?" rows={3}
                style={{ ...inputStyle, resize: 'vertical' }} onFocus={handleFocus} onBlur={handleBlur} />
                
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={useAI} 
                  onChange={(e) => setUseAI(e.target.checked)} 
                  style={{ width: 16, height: 16, accentColor: '#8B5CF6', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.8rem', color: useAI ? '#A78BFA' : 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
                  <SparklesIcon style={{ width: 14, height: 14 }} /> 
                  Magic create Kanban board and tasks from description
                </span>
              </label>
            </div>

            {/* Theme Color */}
            <div style={{ marginBottom: 28 }}>
              <label style={labelStyle}><SwatchIcon style={{ width: 14, height: 14 }} /> Theme Color</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PROJECT_COLORS.map(c => (
                  <button key={c.hex} type="button" onClick={() => setForm(p => ({ ...p, color: c.hex }))}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      border: form.color === c.hex ? '3px solid #fff' : '2px solid transparent',
                      background: c.hex, cursor: 'pointer', transition: 'all 0.2s',
                      transform: form.color === c.hex ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: form.color === c.hex ? `0 0 12px ${c.hex}80` : 'none',
                    }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="button" onClick={onClose}
                style={{ flex: 1, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              >Cancel</button>
              <button type="submit" disabled={creating || !form.name.trim()}
                style={{ flex: 1, padding: 14, borderRadius: 14, background: 'linear-gradient(135deg, #8B5CF6, #6366F1)', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer', fontSize: '0.875rem', boxShadow: '0 4px 16px rgba(139,92,246,0.35)', opacity: (creating || !form.name.trim()) ? 0.5 : 1, transition: 'all 0.2s' }}
              >{creating ? 'Creating...' : 'Create Project'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;
