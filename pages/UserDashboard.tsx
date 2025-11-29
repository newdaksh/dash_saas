import React, { useState } from 'react';
import { useApp } from '../context';
import { CheckSquare, Bell, Building2, Clock, CheckCircle2, Users, ArrowRight, Briefcase, XCircle, UserCheck } from 'lucide-react';
import { Button } from '../components/Button';

export const UserDashboard: React.FC = () => {
  const { user, tasks, notifications, invitations, acceptInvitation, declineInvitation, markNotificationRead } = useApp();
  
  // Filter tasks assigned to this user across all companies
  const myTasks = tasks.filter(t => t.assignee_id === user?.id);
  const pendingTasks = myTasks.filter(t => t.status === 'To Do' || t.status === 'In Progress');
  const completedTasks = myTasks.filter(t => t.status === 'Done');
  
  // Filter pending invitations
  const pendingInvitations = invitations.filter(inv => inv.status === 'Pending');
  const unreadNotifications = notifications.filter(n => !n.read);

  const handleAcceptInvitation = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDeclineInvitation = async (invitationId: string) => {
    try {
      await declineInvitation(invitationId);
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    }
  };

  return (
    <div className="relative h-full flex flex-col overflow-hidden">
      <div className="flex-1 flex flex-col space-y-8 relative z-10 p-1">
        
        {/* Welcome Header */}
        <div className="animate-slide-up rounded-2xl p-6 md:p-8 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 backdrop-blur-md border border-purple-200/50 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg ring-4 ring-white">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt={user.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0]}! 👋
              </h1>
              <p className="text-slate-600 mt-1">
                Here's what's happening with your tasks and invitations.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <CheckSquare size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pendingTasks.length}</p>
                <p className="text-sm text-slate-500">Pending Tasks</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{completedTasks.length}</p>
                <p className="text-sm text-slate-500">Completed</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                <Bell size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{unreadNotifications.length}</p>
                <p className="text-sm text-slate-500">Notifications</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                <Building2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{pendingInvitations.length}</p>
                <p className="text-sm text-slate-500">Invitations</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Pending Invitations */}
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={20} className="text-purple-600" />
                Company Invitations
              </h2>
              {pendingInvitations.length > 0 && (
                <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded-full">
                  {pendingInvitations.length} pending
                </span>
              )}
            </div>
            
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500">No pending invitations</p>
                <p className="text-slate-400 text-sm mt-1">When companies invite you, they'll appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingInvitations.map(invitation => (
                  <div 
                    key={invitation.id}
                    className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white font-bold">
                          {invitation.company_name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-800">{invitation.company_name}</h3>
                          <p className="text-sm text-slate-500">
                            Invited by {invitation.inviter_name} as <span className="font-medium">{invitation.role}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {invitation.message && (
                      <p className="text-sm text-slate-600 mt-3 italic">"{invitation.message}"</p>
                    )}
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        variant="primary" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleAcceptInvitation(invitation.id)}
                      >
                        <CheckCircle2 size={16} className="mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => handleDeclineInvitation(invitation.id)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CheckSquare size={20} className="text-blue-600" />
                My Tasks
              </h2>
              <a href="#/user/tasks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View all <ArrowRight size={14} />
              </a>
            </div>
            
            {pendingTasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <CheckSquare size={32} className="text-slate-400" />
                </div>
                <p className="text-slate-500">No pending tasks</p>
                <p className="text-slate-400 text-sm mt-1">Tasks assigned to you will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map(task => (
                  <div 
                    key={task.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-800">{task.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                          {task.project_name && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              {task.project_name}
                            </span>
                          )}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === 'High' ? 'bg-red-100 text-red-700' :
                            task.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
                        task.status === 'To Do' ? 'bg-slate-100 text-slate-600' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.due_date && (
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                        <Clock size={12} />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white/80 backdrop-blur-md border border-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Bell size={20} className="text-amber-600" />
              Recent Notifications
            </h2>
            <a href="#/user/notifications" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight size={14} />
            </a>
          </div>
          
          {notifications.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-500">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 5).map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                    notification.read 
                      ? 'bg-slate-50 border-slate-100' 
                      : notification.type === 'invitation_response' && notification.data?.isDeclined
                        ? 'bg-red-50 border-red-100'
                        : 'bg-amber-50 border-amber-100'
                  }`}
                  onClick={() => markNotificationRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.type === 'invitation' ? 'bg-purple-100 text-purple-600' :
                      notification.type === 'invitation_response' ? 
                        (notification.data?.isDeclined ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600') :
                      notification.type === 'task_assigned' ? 'bg-blue-100 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {notification.type === 'invitation' ? <Building2 size={18} /> :
                       notification.type === 'invitation_response' ? 
                        (notification.data?.isDeclined ? <XCircle size={18} /> : <UserCheck size={18} />) :
                       notification.type === 'task_assigned' ? <CheckSquare size={18} /> :
                       <Bell size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm ${notification.read ? 'text-slate-600' : 'text-slate-800 font-medium'}`}>
                        {notification.title || (notification.type === 'invitation_response' ? 
                          (notification.data?.isDeclined ? 'Invitation Declined' : 'Invitation Accepted') : 
                          'Notification')}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(notification.created_at || notification.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className={`w-2 h-2 rounded-full ${
                        notification.type === 'invitation_response' && notification.data?.isDeclined 
                          ? 'bg-red-500' 
                          : 'bg-amber-500'
                      }`}></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
