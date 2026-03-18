import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { taskAPI, projectAPI, notificationAPI } from '../services/api';
import NotificationsPopover from '../components/NotificationsPopover';
import {
  PlusIcon,
  ArrowLeftIcon,
  EllipsisHorizontalIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  Cog6ToothIcon,
  XMarkIcon,
  UserPlusIcon,
  BellIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import CreateTaskModal from '../components/CreateTaskModal';
import ChatDrawer from '../components/ChatDrawer';
import '../styles/KanbanBoard.css';
import '../styles/Dashboard.css';// ... (keep existing constants) 
const columns = [
  { id: 'todo', status: 'todo', name: 'To Do', color: 'bg-gray-200 dark:bg-gray-700', textColor: 'text-gray-700 dark:text-gray-200', glowColor: 'rgba(156,163,175,0.15)', bgGradient: 'linear-gradient(135deg, rgba(156,163,175,0.2), rgba(107,114,128,0.2))', iconColor: '#9CA3AF', iconBorder: 'rgba(156,163,175,0.2)', iconPath: 'M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z' },
  { id: 'in-progress', status: 'in-progress', name: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/40', textColor: 'text-blue-700 dark:text-blue-300', glowColor: 'rgba(59,130,246,0.15)', bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.2))', iconColor: '#93C5FD', iconBorder: 'rgba(59,130,246,0.2)', iconPath: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'review', status: 'review', name: 'Review', color: 'bg-amber-100 dark:bg-amber-900/40', textColor: 'text-amber-700 dark:text-amber-300', glowColor: 'rgba(245,158,11,0.15)', bgGradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(217,119,6,0.2))', iconColor: '#FCD34D', iconBorder: 'rgba(245,158,11,0.2)', iconPath: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'completed', status: 'completed', name: 'Completed', color: 'bg-emerald-100 dark:bg-emerald-900/40', textColor: 'text-emerald-700 dark:text-emerald-300', glowColor: 'rgba(16,185,129,0.15)', bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))', iconColor: '#6EE7B7', iconBorder: 'rgba(16,185,129,0.2)', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const priorityConfig = {
  urgent: { label: 'Urgent', bg: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300', color: '#EF4444' },
  high: { label: 'High', bg: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-300', color: '#F97316' },
  medium: { label: 'Medium', bg: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-300', color: '#EAB308' },
  low: { label: 'Low', bg: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300', color: '#22C55E' },
};

// Project Settings Modal
const ProjectSettingsModal = ({ project, onClose, onUpdate, onAddMember, onRemoveMember, onTransferOwnership, user }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description || '');
  const [customFields, setCustomFields] = useState(project.customFields || []);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [transferEmail, setTransferEmail] = useState('');

  const getMyRole = () => {
    if (project.owner?._id === user?._id) return 'owner';
    const member = project.members?.find(m => m.user?._id === user?._id);
    return member?.role || 'viewer';
  };
  
  const myRole = getMyRole();
  const isAdmin = ['owner'].includes(myRole); // Only owner is full admin now

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onUpdate({ name, description, customFields });
      toast.success('Project updated');
    } catch (error) {
       // handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddField = () => {
    setCustomFields([...customFields, { name: '', type: 'text', options: [], required: false }]);
  };

  const handleUpdateField = (index, updates) => {
    const newFields = [...customFields];
    newFields[index] = { ...newFields[index], ...updates };
    setCustomFields(newFields);
  };

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setIsLoading(true);
    try {
      await onAddMember(inviteEmail, inviteRole);
      setInviteEmail('');
      toast.success('Invitation sent');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!transferEmail) return;
    // Find member by email
    const member = project.members.find(m => m.user.email === transferEmail);
    if (!member) {
        toast.error('User must be a member of the project first');
        return;
    }
    if (!window.confirm(`Transfer ownership to ${transferEmail}? You will become an editor.`)) return;

    setIsLoading(true);
    try {
        await onTransferOwnership(member.user._id);
        setTransferEmail('');
        toast.success('Ownership transferred');
        onClose();
    } catch (error) {
        toast.error('Failed to transfer ownership');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="kanban-settings-overlay">
      <div className="kanban-settings-modal">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Project Settings</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('general')}
            className={`kanban-tab-btn ${activeTab === 'general' ? 'kanban-tab-active' : 'kanban-tab-inactive'}`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`kanban-tab-btn ${activeTab === 'members' ? 'kanban-tab-active' : 'kanban-tab-inactive'}`}
          >
            Collaborators ({project.members?.length + 1})
          </button>
          <button
            onClick={() => setActiveTab('customFields')}
            className={`kanban-tab-btn ${activeTab === 'customFields' ? 'kanban-tab-active' : 'kanban-tab-inactive'}`}
          >
            Custom Fields
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'general' && (
            <div className="space-y-6">
                <form onSubmit={handleUpdateProject} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name</label>
                    <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={!isAdmin}
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                    placeholder="Enter project name"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!isAdmin}
                    rows="4"
                    className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                    placeholder="Enter project description"
                    />
                </div>
                {isAdmin && (
                    <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    </div>
                )}
                {!isAdmin && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl text-sm">
                    Only the Owner can edit project details.
                    </div>
                )}
                </form>

                {myRole === 'owner' && (
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                         <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Transfer Ownership</h3>
                         <form onSubmit={handleTransfer} className="flex gap-2">
                            <input
                                type="email"
                                value={transferEmail}
                                onChange={(e) => setTransferEmail(e.target.value)}
                                placeholder="Enter member email"
                                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-red-500 outline-none text-sm"
                            />
                             <button
                                type="submit"
                                disabled={isLoading || !transferEmail}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                            >
                                Transfer
                            </button>
                         </form>
                         <p className="text-xs text-gray-500 mt-2">Ownership can only be transferred to an existing project member.</p>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-6">
              {isAdmin && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <UserPlusIcon className="w-4 h-4" /> Invite Collaborator
                  </h3>
                  <form onSubmit={handleInvite} className="flex gap-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="flex-1 px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                      required
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                    >
                      Invite
                    </button>
                  </form>
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Project Members</h3>
                
                {/* Owner */}
                <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-gray-700">
                       {project.owner?.name?.charAt(0)}
                     </div>
                     <div>
                       <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                         {project.owner?.name} <span className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 rounded">OWNER</span>
                       </p>
                       <p className="text-xs text-gray-500">{project.owner?.email}</p>
                     </div>
                   </div>
                </div>

                {/* Members */}
                {project.members?.map((member) => (
                  <div key={member.user._id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-shadow">
                     <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                         {member.user.name?.charAt(0)}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                           {member.user.name} 
                           <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ml-2 ${
                             member.role === 'editor' 
                               ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
                               : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                           }`}>
                             {member.role}
                           </span>
                            {member.status === 'pending' && (
                                <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 uppercase tracking-wide">
                                    Pending
                                </span>
                            )}
                         </p>
                         <p className="text-xs text-gray-500">{member.user.email}</p>
                       </div>
                     </div>
                     
                     {/* Only Owner can remove members. Owner cannot remove themselves here. */}
                     {myRole === 'owner' && (
                       <button
                         onClick={() => onRemoveMember(member.user._id)}
                         className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                         title="Remove Member"
                       >
                         <TrashIcon className="w-4 h-4" />
                       </button>
                     )}
                  </div>
                ))}

                {project.members?.length === 0 && (
                  <p className="text-sm text-center text-gray-400 italic py-4">No other members yet.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'customFields' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Custom Fields</h3>
                  {isAdmin && (
                    <button onClick={handleAddField} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-xs font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors">
                      <PlusIcon className="w-4 h-4" /> Add Field
                    </button>
                  )}
               </div>

               {customFields.length === 0 ? (
                 <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">No custom fields defined yet.</p>
               ) : (
                 <div className="space-y-4">
                   {customFields.map((field, index) => (
                     <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                       <div className="flex gap-3">
                         <div className="flex-1">
                           <input
                             type="text"
                             value={field.name}
                             onChange={(e) => handleUpdateField(index, { name: e.target.value })}
                             placeholder="Field Name"
                             disabled={!isAdmin}
                             className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                           />
                         </div>
                         <div className="w-1/3">
                           <select
                             value={field.type}
                             onChange={(e) => handleUpdateField(index, { type: e.target.value })}
                             disabled={!isAdmin}
                             className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                           >
                             <option value="text">Text</option>
                             <option value="number">Number</option>
                             <option value="date">Date</option>
                             <option value="dropdown">Dropdown</option>
                             <option value="checkbox">Checkbox</option>
                           </select>
                         </div>
                         {isAdmin && (
                           <button onClick={() => handleRemoveField(index)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors mt-0.5">
                             <TrashIcon className="w-4 h-4" />
                           </button>
                         )}
                       </div>
                       
                       {field.type === 'dropdown' && (
                         <div>
                           <input
                             type="text"
                             value={field.options?.join(', ') || ''}
                             onChange={(e) => handleUpdateField(index, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                             placeholder="Options (comma separated)"
                             disabled={!isAdmin}
                             className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                           />
                         </div>
                       )}

                       <div className="flex items-center gap-2">
                         <input
                           type="checkbox"
                           id={`req-${index}`}
                           checked={field.required || false}
                           onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                           disabled={!isAdmin}
                           className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                         />
                         <label htmlFor={`req-${index}`} className="text-xs text-gray-600 dark:text-gray-400">Required Field</label>
                       </div>
                     </div>
                   ))}
                 </div>
               )}

               {isAdmin && customFields.length > 0 && (
                 <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                        onClick={() => handleUpdateProject({ customFields })}
                        disabled={isLoading}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Fields'}
                    </button>
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper to clean HTML string from rich text descriptions
const getCleanDesc = (htmlStr) => {
  if (!htmlStr) return '';
  return htmlStr.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').trim();
};

// Task card component - Minimal
const TaskCard = ({ task, onMoveTask, onDeleteTask, onOpenTask, columnIndex }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      // If click is outside the button AND outside the menu portal, close it
      if (
        showMenu && 
        menuRef.current && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 8, // Just below the button
        right: window.innerWidth - rect.right, // Align with right edge of button
      });
    }
    setShowMenu(!showMenu);
  };

  const priority = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <div 
      onClick={() => onOpenTask(task)}
      className="kanban-task-card group animate-fade-in-up"
    >
      {/* Priority Strip */}
      <div className="kanban-task-priority-strip" style={{ background: priority.color || '#6366F1', boxShadow: `0 0 10px ${priority.color}80` }} />
      
      {/* Avatar */}
      <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '15px',
          fontWeight: 'bold',
          color: '#fff',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
      }}>
         {task.assignees && task.assignees.length > 0 ? task.assignees[0].name?.charAt(0).toUpperCase() : 'U'}
      </div>

      {/* Content Stack */}
      <div className="flex-1 flex flex-col justify-center min-w-0 pr-4">
        <h3 className="kanban-task-title truncate">
          {task.title}
        </h3>
        
        {getCleanDesc(task.description).length > 0 && (
          <p className="kanban-task-desc">
            {getCleanDesc(task.description)}
          </p>
        )}

        {task.dueDate && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-500 font-medium tracking-wide">
            <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
            {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
      </div>

      {/* Menu Action (Top Right) */}
      <div className="absolute top-4 right-4 z-10">
        <button
          ref={buttonRef}
          onClick={toggleMenu}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100"
        >
          <EllipsisHorizontalIcon className="w-6 h-6" />
        </button>
        {showMenu && createPortal(
          <div 
            ref={menuRef}
            className="kanban-task-menu" 
            style={{ 
              position: 'fixed',
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 999999
            }}
            onClick={(e) => e.stopPropagation()} // stop portal clicks from triggering card open
          >
            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Move to</p>
            {columns.map((col, idx) => (
              <button
                key={col.id}
                disabled={idx === columnIndex}
                onClick={(e) => { e.stopPropagation(); onMoveTask(task._id, col.id, col.status); setShowMenu(false); }}
                className={`kanban-menu-item ${idx === columnIndex ? 'text-gray-300 cursor-default' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {col.name}
              </button>
            ))}
            <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
            <button
              onClick={(e) => { e.stopPropagation(); onDeleteTask(task._id); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <TrashIcon className="w-3.5 h-3.5" /> Delete
            </button>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { socket, joinProject, leaveProject } = useSocket();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [createTaskDefaultStatus, setCreateTaskDefaultStatus] = useState('todo');
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    loadProjectData();
    joinProject(projectId);
    if (socket) {
      socket.on('task:created', handleTaskCreated);
      socket.on('task:updated', handleTaskUpdated);
      socket.on('task:deleted', handleTaskDeleted);
      socket.on('task:moved', handleTaskMoved);
    }
    return () => {
      leaveProject(projectId);
      if (socket) {
        socket.off('task:created');
        socket.off('task:updated');
        socket.off('task:deleted');
        socket.off('task:moved');
      }
    };
  }, [projectId, socket]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectAPI.getProject(projectId),
        taskAPI.getTasks({ project: projectId })
      ]);
      setProject(projectRes.data.project);
      setTasks(tasksRes.data.tasks || []);
    } catch (error) {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateProject = async (data) => {
    await projectAPI.updateProject(projectId, data);
    setProject(prev => ({ ...prev, ...data }));
  };

  const handleAddMember = async (email, role) => {
     await projectAPI.addMember(projectId, { email, role });
     loadProjectData(); // Reload to get updated member list with details
  };

  const handleRemoveMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
        await projectAPI.removeMember(projectId, userId);
        setProject(prev => ({
            ...prev,
            members: prev.members.filter(m => m.user._id !== userId)
        }));
        toast.success('Member removed');
    }
  };

  const handleTransferOwnership = async (newOwnerId) => {
      // Logic handled in Modal, but we might want state update here if modal doesn't do full reload behavior
      // The modal reloads or the parent reloads... actually modal calls API.
      // If modal calls onTransferOwnership, we might want to reload project data.
      await projectAPI.transferOwnership(projectId, newOwnerId);
      loadProjectData();    
  };

  const handleTaskCreated = (newTask) => {
    if ((newTask.project?._id || newTask.project) === projectId) {
       setTasks(prev => [...prev, newTask]);
    }
  };

  const handleTaskUpdated = (updatedTask) => setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
  const handleTaskDeleted = ({ id }) => setTasks(prev => prev.filter(t => t._id !== id));
  const handleTaskMoved = (movedTask) => setTasks(prev => prev.map(t => t._id === movedTask._id ? movedTask : t));

  const getTasksByColumn = (col) => {
    return tasks.filter(task => {
      if (task.column === col.id || task.column === col.name) return true;
      if (!task.column && task.status === col.status) return true;
      return false;
    });
  };

  const moveTask = async (taskId, newColumnId, newStatus) => {
    const target = tasks.find(t => t._id === taskId);
    if (!target) return;
    const optimistic = { ...target, status: newStatus, column: newColumnId };
    setTasks(prev => prev.map(t => t._id === taskId ? optimistic : t));
    try {
      await taskAPI.updateTask(taskId, { status: newStatus, column: newColumnId });
      toast.success(`Moved to ${newColumnId}`);
    } catch (e) {
      loadProjectData();
    }
  };

  const deleteTask = async (taskId) => {
    if(!window.confirm('Delete this task?')) return;
    
    setTasks(prev => prev.filter(t => t._id !== taskId));
    try {
      await taskAPI.deleteTask(taskId);
      toast.success('Task deleted');
    } catch (e) {
      loadProjectData();
      toast.error('Failed to delete task');
    }
  };
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
    </div>
  );

  return (
    <div className="kanban-page">
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

      {/* Header - Minimal & Consistent */}
      <nav className="kanban-header-nav">
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
           <div className="flex items-center gap-4">
             <Link to="/dashboard" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
               <ArrowLeftIcon className="w-5 h-5" />
             </Link>
             <div>
               <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                 <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: project?.color || '#6366F1' }} />
                 {project?.name || 'Project'}
               </h1>
               <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                 <ClockIcon className="w-3 h-3" />
                 <span>{tasks.length} tasks</span>
                 <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></span>
                 <UserIcon className="w-3 h-3" />
                 <span>{project?.members?.length + 1} members</span>
               </div>
             </div>
           </div>

           <div className="flex items-center gap-3 relative">
             <button onClick={() => { setCreateTaskDefaultStatus('todo'); setShowCreateTask(true); }} className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all" style={{ border: 'none', cursor: 'pointer' }}>
               <PlusIcon className="w-4 h-4" />
               <span className="hidden md:inline">New Task</span>
             </button>
             
             {/* Bell Icon for Notifications */}
             <div className="relative">
                 <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors relative"
                 >
                    <BellIcon className="w-5 h-5" />
                 </button>
                 {showNotifications && <NotificationsPopover onClose={() => setShowNotifications(false)} />}
             </div>

             <button 
                onClick={() => setShowSettings(true)}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                title="Project Settings"
             >
                <Cog6ToothIcon className="w-5 h-5" />
             </button>
             <button onClick={toggleTheme} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? <SunIcon className="w-5 h-5 text-amber-400" /> : <MoonIcon className="w-5 h-5" />}
             </button>
             <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2.5 rounded-xl transition-colors ${isChatOpen ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400'}`}
                title="Project Chat"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5" />
              </button>
           </div>
        </div>
      </nav>

      {showSettings && (
        <ProjectSettingsModal 
           project={project} 
           user={user}
           onClose={() => setShowSettings(false)} 
           onUpdate={handleUpdateProject}
           onAddMember={handleAddMember}
           onRemoveMember={handleRemoveMember}
           onTransferOwnership={handleTransferOwnership}
        />
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={(updatedTask) => {
             setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
             setSelectedTask(updatedTask);
          }}
          onDelete={(taskId) => {
             deleteTask(taskId);
             setSelectedTask(null);
          }}
        />
      )}

      {showCreateTask && (
        <CreateTaskModal
          defaultProjectId={projectId}
          defaultStatus={createTaskDefaultStatus}
          onClose={() => setShowCreateTask(false)}
          onCreated={() => loadProjectData()}
        />
      )}

      {/* Main Scrolling Layout */}
      <div className="kanban-board-container custom-scrollbar" style={{ flex: 1, minWidth: 0, transition: 'all 300ms ease', overflowY: 'auto', overflowX: 'auto', padding: '24px' }}>
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: isChatOpen ? 24 : 0, transition: 'gap 300ms ease', minHeight: 'min-content' }}>
          
          {/* ── Left Side: Board & Metrics ── */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Columns Wrapper */}
            <div className="kanban-columns-wrapper" style={{ padding: 0 }}>
              {columns.map((col, colIndex) => {
                const colTasks = getTasksByColumn(col);
                return (
                  <div key={col.id} className="kanban-column" style={{ position: 'relative' }}>
                    {/* Decorative glow */}
                    <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, background: `radial-gradient(circle, ${col.glowColor || 'rgba(99,102,241,0.15)'}, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
                    
                    {/* Minimal Column Header */}
                    <div className="kanban-column-header" style={{ position: 'relative', zIndex: 1 }}>
                      <div className="flex items-center gap-3">
                        {/* Column Icon */}
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: col.bgGradient, border: `1px solid ${col.iconBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <svg style={{ width: 16, height: 16, color: col.iconColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={col.iconPath} /></svg>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${col.color} ${col.textColor}`}>
                          {col.name}
                        </span>
                        <span className="text-xs font-bold text-gray-400">{colTasks.length}</span>
                      </div>
                      <button onClick={() => { setCreateTaskDefaultStatus(col.status); setShowCreateTask(true); }} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <PlusIcon className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Task List */}
                    <div className="kanban-task-list custom-scrollbar overflow-y-auto max-h-[80vh]" style={{ position: 'relative', zIndex: 1 }}>
                      {colTasks.length === 0 ? (
                        <div className="kanban-empty-col">
                          <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 12.838c-.066.214-.1.437-.1.662z" />
                          </svg>
                          <p>No tasks yet</p>
                        </div>
                      ) : (
                        colTasks.map(task => (
                          <TaskCard 
                            key={task._id} 
                            task={task} 
                            onMoveTask={moveTask} 
                            onDeleteTask={deleteTask}
                            onOpenTask={(t) => setSelectedTask(t)}
                            columnIndex={colIndex}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Metrics Layout */}
            {tasks.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingBottom: 32 }}>
                
                {/* Task Progress Card */}
                <div style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                  {/* Decorative glow */}
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 180, height: 180, background: 'radial-gradient(circle, rgba(99,102,241,0.15), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: 18, height: 18, color: '#A5B4FC' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Task Progress</h3>
                  </div>

                  {(() => {
                    const total = tasks.length;
                    const statusData = columns.map(col => {
                      const count = getTasksByColumn(col).length;
                      const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                      return { ...col, count, pct };
                    });
                    const completedPct = total > 0 ? Math.round((getTasksByColumn(columns[3]).length / total) * 100) : 0;
                    const barColors = { 'todo': '#6B7280', 'in-progress': '#6366F1', 'review': '#F59E0B', 'completed': '#10B981' };
                    
                    // SVG donut ring
                    const radius = 64;
                    const circumference = 2 * Math.PI * radius;
                    let cumulativeOffset = 0;

                    return (
                      <div style={{ display: 'flex', gap: 28, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                        {/* Donut Chart */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <svg width="160" height="160" viewBox="0 0 160 160">
                            {/* Background ring */}
                            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
                            {/* Status segments */}
                            {statusData.map((s) => {
                              const segmentLength = (s.pct / 100) * circumference;
                              const offset = circumference - cumulativeOffset;
                              cumulativeOffset += segmentLength;
                              return (
                                <circle
                                  key={s.id}
                                  cx="80" cy="80" r={radius}
                                  fill="none"
                                  stroke={barColors[s.id]}
                                  strokeWidth="14"
                                  strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                                  strokeDashoffset={offset}
                                  strokeLinecap="round"
                                  style={{ filter: `drop-shadow(0 0 6px ${barColors[s.id]}66)`, transition: 'stroke-dasharray 0.8s ease' }}
                                  transform="rotate(-90 80 80)"
                                />
                              );
                            })}
                          </svg>
                          {/* Center text */}
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{completedPct}%</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>DONE</span>
                          </div>
                        </div>

                        {/* Status breakdown cards */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, flex: 1 }}>
                          {statusData.map((s) => (
                            <div key={s.id} style={{
                              background: `${barColors[s.id]}12`,
                              border: `1px solid ${barColors[s.id]}25`,
                              borderRadius: 14,
                              padding: '12px 14px',
                              transition: 'all 0.3s ease',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: barColors[s.id], boxShadow: `0 0 8px ${barColors[s.id]}88` }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.name}</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: barColors[s.id] }}>{s.count}</span>
                                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)' }}>({s.pct}%)</span>
                              </div>
                              {/* Mini progress bar */}
                              <div style={{ marginTop: 8, height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${s.pct}%`, background: barColors[s.id], borderRadius: 4, transition: 'width 0.6s ease', boxShadow: `0 0 8px ${barColors[s.id]}44` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Task Timeline Card */}
                <div style={{ background: 'rgba(17,24,39,0.8)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, boxShadow: '0 20px 60px rgba(0,0,0,0.4)', position: 'relative', overflow: 'hidden' }}>
                  {/* Decorative glows */}
                  <div style={{ position: 'absolute', bottom: -80, left: -80, width: 200, height: 200, background: 'radial-gradient(circle, rgba(99,102,241,0.12), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 160, height: 160, background: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(99,102,241,0.2))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg style={{ width: 18, height: 18, color: '#93C5FD' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Task Timeline</h3>
                        <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>14-day view · {tasks.length} tasks</p>
                      </div>
                    </div>
                    {/* Legend */}
                    <div style={{ display: 'flex', gap: 10, background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                      {[{c:'#6B7280',l:'To Do'},{c:'#6366F1',l:'Active'},{c:'#F59E0B',l:'Review'},{c:'#10B981',l:'Done'}].map(({c,l}) => (
                        <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: c, boxShadow: `0 0 6px ${c}88` }} />
                          <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const timelineTasks = tasks.slice(0, 8);
                    const now = new Date();
                    const rangeStart = new Date(now);
                    rangeStart.setDate(rangeStart.getDate() - 7);
                    const rangeEnd = new Date(now);
                    rangeEnd.setDate(rangeEnd.getDate() + 7);
                    const rangeDays = 14;
                    const statusColors = { 'todo': '#6B7280', 'in-progress': '#6366F1', 'review': '#F59E0B', 'completed': '#10B981' };
                    const todayPct = ((now - rangeStart) / (rangeEnd - rangeStart)) * 100;
                    const avatarGradients = ['linear-gradient(135deg,#6366F1,#8B5CF6)','linear-gradient(135deg,#3B82F6,#06B6D4)','linear-gradient(135deg,#10B981,#34D399)','linear-gradient(135deg,#F59E0B,#EF4444)','linear-gradient(135deg,#EC4899,#8B5CF6)'];

                    const getDayLabels = () => {
                      const labels = [];
                      const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                      for (let i = 0; i < rangeDays; i++) {
                        const d = new Date(rangeStart);
                        d.setDate(d.getDate() + i);
                        labels.push({ day: d.getDate(), wd: dayNames[d.getDay()], isToday: d.getDate() === now.getDate() && d.getMonth() === now.getMonth() });
                      }
                      return labels;
                    };

                    const getBarPosition = (task) => {
                      const created = task.startDate ? new Date(task.startDate) : (task.createdAt ? new Date(task.createdAt) : now);
                      const due = task.dueDate ? new Date(task.dueDate) : new Date(new Date(created).getTime() + 3 * 86400000);
                      const s = Math.max(0, ((new Date(created) - rangeStart) / (rangeEnd - rangeStart)) * 100);
                      const e = Math.min(100, ((new Date(due) - rangeStart) / (rangeEnd - rangeStart)) * 100);
                      return { left: `${s}%`, width: `${Math.max(e - s, 8)}%` };
                    };

                    const getAssignee = (task) => {
                      if (task.assignees && task.assignees.length > 0) {
                        const a = task.assignees[0];
                        if (typeof a === 'object' && a.name) return { initials: a.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2), name: a.name };
                      }
                      return null;
                    };

                    return (
                      <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex' }}>
                          {/* Left: Task labels + assignees */}
                          <div style={{ width: 155, flexShrink: 0, paddingRight: 10, borderRight: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ height: 38, display: 'flex', alignItems: 'flex-end', paddingBottom: 6 }}>
                              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Task</span>
                            </div>
                            {timelineTasks.map((task, idx) => {
                              const assignee = getAssignee(task);
                              return (
                                <div key={task._id} style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                  {assignee ? (
                                    <div title={assignee.name} style={{ width: 24, height: 24, borderRadius: 8, background: avatarGradients[idx % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                                      {assignee.initials}
                                    </div>
                                  ) : (
                                    <div title="Unassigned" style={{ width: 24, height: 24, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: '1px dashed rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                      <svg style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.2)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                  )}
                                  <div style={{ overflow: 'hidden', minWidth: 0 }}>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>{task.title}</p>
                                    <p style={{ fontSize: '0.55rem', fontWeight: 600, color: assignee ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>{assignee ? assignee.name : 'Unassigned'}</p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Right: Day headers + bars */}
                          <div style={{ flex: 1, paddingLeft: 10, minWidth: 0 }}>
                            {/* Day header */}
                            <div style={{ height: 38, display: 'flex' }}>
                              {getDayLabels().map((d, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6 }}>
                                  <span style={{ fontSize: '0.45rem', fontWeight: 600, color: d.isToday ? 'rgba(165,180,252,0.7)' : 'rgba(255,255,255,0.12)', marginBottom: 2 }}>{d.wd}</span>
                                  {d.isToday ? (
                                    <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#A5B4FC', background: 'rgba(99,102,241,0.2)', padding: '1px 7px', borderRadius: 6, border: '1px solid rgba(99,102,241,0.3)' }}>{d.day}</span>
                                  ) : (
                                    <span style={{ fontSize: '0.6rem', fontWeight: 600, color: 'rgba(255,255,255,0.18)' }}>{d.day}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                            {/* Bars area */}
                            <div style={{ position: 'relative' }}>
                              {/* Grid lines */}
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', pointerEvents: 'none', zIndex: 0 }}>
                                {getDayLabels().map((d, i) => (
                                  <div key={i} style={{ flex: 1, borderRight: `1px solid rgba(255,255,255,${d.isToday ? '0.06' : '0.025'})` }} />
                                ))}
                              </div>
                              {/* Today line */}
                              <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${todayPct}%`, width: 2, background: 'linear-gradient(180deg, #6366F1, #818CF8, rgba(129,140,248,0.15))', zIndex: 3, borderRadius: 2 }}>
                                <div style={{ position: 'absolute', top: -3, left: -3.5, width: 9, height: 9, borderRadius: '50%', background: '#818CF8', border: '2px solid rgba(17,24,39,0.9)', boxShadow: '0 0 10px rgba(129,140,248,0.7)' }} />
                              </div>
                              {/* Task bars */}
                              <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                                {timelineTasks.map((task, idx) => {
                                  const pos = getBarPosition(task);
                                  const color = statusColors[task.status] || '#6B7280';
                                  const assignee = getAssignee(task);
                                  return (
                                    <div key={task._id} style={{ height: 44, display: 'flex', alignItems: 'center', position: 'relative', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                      <div
                                        style={{
                                          position: 'absolute', top: 7, bottom: 7,
                                          left: pos.left, width: pos.width,
                                          background: `linear-gradient(135deg, ${color}EE, ${color}99)`,
                                          borderRadius: 20,
                                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                          padding: '0 8px 0 10px',
                                          boxShadow: `0 4px 18px ${color}40, inset 0 1px 0 rgba(255,255,255,0.18)`,
                                          overflow: 'hidden', whiteSpace: 'nowrap', cursor: 'pointer',
                                          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${color}55, inset 0 1px 0 rgba(255,255,255,0.22)`; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 18px ${color}40, inset 0 1px 0 rgba(255,255,255,0.18)`; }}
                                      >
                                        <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', textShadow: '0 1px 3px rgba(0,0,0,0.4)', flex: 1 }}>{task.title}</span>
                                        {assignee && (
                                          <div style={{ width: 18, height: 18, borderRadius: 6, flexShrink: 0, marginLeft: 4, background: avatarGradients[idx % 5], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.45rem', fontWeight: 800, color: '#fff', border: '1.5px solid rgba(255,255,255,0.25)' }}>
                                            {assignee.initials}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}
          </div>

          {/* ── Right Side: Floating Chat Card ── */}
          <div style={{ flexShrink: 0, position: 'sticky', top: 0, height: 'calc(100vh - 120px)' }}>
            <ChatDrawer
              projectId={projectId}
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;