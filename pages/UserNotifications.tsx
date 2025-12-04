import React from 'react';
import { useApp } from '../context';
import { Bell, Building2, CheckSquare, Trash2, Check, CheckCircle2, XCircle, UserCheck } from 'lucide-react';
import { Button } from '../components/Button';

export const UserNotifications: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification } = useApp();
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string, data?: any) => {
    switch (type) {
      case 'invitation':
        return <Building2 size={20} className="text-purple-600" />;
      case 'invitation_response':
        // Show different icon based on accept/decline
        if (data?.isDeclined) {
          return <XCircle size={20} className="text-red-600" />;
        }
        return <UserCheck size={20} className="text-green-600" />;
      case 'user_joined':
        return <UserCheck size={20} className="text-green-600" />;
      case 'task_assigned':
        return <CheckSquare size={20} className="text-blue-600" />;
      case 'task_updated':
        return <CheckCircle2 size={20} className="text-green-600" />;
      default:
        return <Bell size={20} className="text-amber-600" />;
    }
  };

  const getNotificationColor = (type: string, data?: any) => {
    switch (type) {
      case 'invitation':
        return 'bg-purple-100';
      case 'invitation_response':
        // Red for declined, green for accepted
        if (data?.isDeclined) {
          return 'bg-red-100';
        }
        return 'bg-green-100';
      case 'user_joined':
        return 'bg-green-100';
      case 'task_assigned':
        return 'bg-blue-100';
      case 'task_updated':
        return 'bg-green-100';
      default:
        return 'bg-amber-100';
    }
  };

  return (
    <div className="relative min-h-full flex flex-col">
      <div className="flex-1 flex flex-col space-y-6 relative z-10 p-1 pb-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-slide-up rounded-2xl p-4 md:p-6 bg-white/40 backdrop-blur-md border border-white/40 shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/50 bg-amber-100/80 text-amber-700">
                Alerts
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight drop-shadow-sm">
              Notifications
            </h1>
            <p className="text-slate-600 font-medium mt-1">
              Stay updated with invitations, task assignments, and more.
            </p>
          </div>
          
          {unreadCount > 0 && (
            <Button 
              variant="outline"
              onClick={markAllNotificationsRead}
              className="whitespace-nowrap"
            >
              <Check size={16} className="mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="bg-white/60 backdrop-blur-md border border-white rounded-2xl shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Bell size={40} className="text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">No notifications</p>
              <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-5 transition-colors hover:bg-slate-50 ${
                    !notification.read ? 'bg-amber-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getNotificationColor(notification.type, notification.data)}`}>
                      {getNotificationIcon(notification.type, notification.data)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-medium ${notification.read ? 'text-slate-600' : 'text-slate-800'}`}>
                            {notification.title || (notification.type === 'invitation_response' ? 
                              (notification.data?.isDeclined ? 'Invitation Declined' : 'Invitation Accepted') : 
                              'Notification')}
                          </h3>
                          <p className="text-sm text-slate-500 mt-1">{notification.message}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            {new Date(notification.created_at || notification.createdAt || Date.now()).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          {!notification.read && (
                            <button
                              onClick={() => markNotificationRead(notification.id)}
                              className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-green-600 transition-colors"
                              title="Mark as read"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="p-2 hover:bg-white rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      {!notification.read && (
                        <div className="absolute top-5 right-5 w-2 h-2 rounded-full bg-amber-500"></div>
                      )}
                    </div>
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
