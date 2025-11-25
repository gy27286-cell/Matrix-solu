import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession, logout, api } from '../services/storage';
import { User, UserRole } from '../types';
import { useToast } from './Toast';
import { LogOut, User as UserIcon, Building2, Users, Plus, Trash2, Shield, MoreVertical } from 'lucide-react';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const currentUser = getSession();
  const [users, setUsers] = useState<User[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>(UserRole.STAFF);

  const canManageUsers = currentUser?.role === UserRole.OWNER;
  const canViewUsers = currentUser?.role === UserRole.OWNER || currentUser?.role === UserRole.STAFF; // Simplified: Manager typically can view too, but mapping UserRole enum (Owner/Staff/Viewer) doesn't strictly have Manager in types.ts yet. Assuming OWNER is main admin.

  useEffect(() => {
    if (currentUser && canManageUsers) {
      loadUsers();
    }
  }, [currentUser]);

  const loadUsers = () => {
    if (currentUser) {
      setUsers(api.users.list(currentUser.orgId));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!currentUser) return;
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: inviteEmail,
        name: inviteName,
        role: inviteRole,
        orgId: currentUser.orgId
      };
      
      api.users.invite(newUser);
      showToast('User invited successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      loadUsers();
    } catch (err: any) {
      showToast(err.message || 'Failed to invite user', 'error');
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    api.users.updateRole(userId, newRole);
    showToast('Role updated');
    loadUsers();
  };

  const handleRemoveUser = (userId: string) => {
    if (confirm("Are you sure you want to remove this user?")) {
      api.users.remove(userId);
      showToast('User removed');
      loadUsers();
    }
  };

  if (!currentUser) return null;

  return (
    <div className="pb-24 animate-slide-up max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 px-1">My Profile</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#1A73E8]">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
            <p className="text-slate-500">{currentUser.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded text-xs font-bold bg-blue-50 text-[#1A73E8] border border-blue-100">
              {currentUser.role}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 text-slate-600 mb-2">
            <Building2 size={18} className="text-slate-400" />
            <span className="text-sm">Organization ID: <span className="font-mono text-slate-800">{currentUser.orgId}</span></span>
          </div>
        </div>
      </div>

      {/* User Management (Owner Only) */}
      {canManageUsers && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={20} className="text-slate-500"/> Team Members
            </h3>
            <button 
              onClick={() => setShowInviteModal(true)}
              className="text-sm font-medium text-[#1A73E8] flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
            >
              <Plus size={16} /> Add User
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             {users.map((u) => (
               <div key={u.id} className="p-4 border-b border-slate-50 last:border-0 flex justify-between items-center">
                 <div>
                   <p className="font-semibold text-sm text-slate-800">{u.name} {u.id === currentUser.id && '(You)'}</p>
                   <p className="text-xs text-slate-500">{u.email}</p>
                 </div>
                 <div className="flex items-center gap-2">
                   {u.id !== currentUser.id && (
                     <>
                       <select 
                         value={u.role}
                         onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                         className="text-xs border-slate-200 rounded p-1 bg-slate-50 text-slate-600 focus:ring-1 focus:ring-blue-500 outline-none"
                       >
                         <option value={UserRole.OWNER}>Owner</option>
                         <option value={UserRole.STAFF}>Staff</option>
                         <option value={UserRole.VIEWER}>Viewer</option>
                       </select>
                       <button onClick={() => handleRemoveUser(u.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded">
                         <Trash2 size={16} />
                       </button>
                     </>
                   )}
                   {u.id === currentUser.id && <Shield size={16} className="text-green-500 mx-2"/>}
                 </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Logout */}
      <button 
        onClick={handleLogout}
        className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} /> Sign Out
      </button>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm animate-slide-up">
            <h3 className="text-lg font-bold mb-4 text-slate-800">Invite Team Member</h3>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label>
                <input 
                  required 
                  className="input-m3" 
                  placeholder="Jane Doe"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Email Address</label>
                <input 
                  required 
                  type="email" 
                  className="input-m3" 
                  placeholder="jane@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                <select 
                  className="input-m3"
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                >
                  <option value={UserRole.STAFF}>Staff (Restricted Access)</option>
                  <option value={UserRole.OWNER}>Owner (Full Access)</option>
                  <option value={UserRole.VIEWER}>Viewer (Read Only)</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 text-slate-500 font-medium hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#1A73E8] text-white font-medium rounded-lg shadow-sm shadow-blue-200">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;