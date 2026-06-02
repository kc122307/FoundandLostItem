import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/notification.service';
import useNotificationStore from '../store/notificationStore';
import { formatTimeAgo } from '../utils/formatters';
import { Link } from 'react-router-dom';
import AnswerChallengeModal from '../components/claim/AnswerChallengeModal';
import { useState } from 'react';

const Notifications = () => {
  const queryClient = useQueryClient();
  const { notifications, setNotifications, markRead: storeMarkRead, markAllRead: storeMarkAllRead } = useNotificationStore();
  const [activeChallengeId, setActiveChallengeId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getMyNotifications,
  });

  useEffect(() => {
    if (data) {
      setNotifications(data.notifications, data.unreadCount);
    }
  }, [data, setNotifications]);

  const markReadMutation = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: (updatedNotif) => {
      storeMarkRead(updatedNotif._id);
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationService.markAllRead,
    onSuccess: () => {
      storeMarkAllRead();
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  if (isLoading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_match': return '🔍';
      case 'claim_submitted': return '📝';
      case 'claim_approved': return '✅';
      case 'claim_rejected': return '❌';
      case 'challenge_received': return '❓';
      case 'challenge_approved': return '🤝';
      case 'item_returned': return '🎉';
      default: return '🔔';
    }
  };

  const getNotificationLink = (n) => {
    if (n.type === 'new_match') return '/matches';
    if (n.type === 'claim_approved' && n.data?.chatId) return '/chat';
    if (n.type === 'claim_rejected' && n.data?.foundItemId) return `/item/found/${n.data.foundItemId}`;
    if (n.type === 'challenge_approved' && n.data?.chatId) return '/chat';
    if (n.type === 'challenge_received') return '#';
    if (n.data?.itemId) return `/item/${n.type.includes('found') ? 'found' : 'lost'}/${n.data.itemId}`;
    return '#';
  };

  const handleNotificationClick = (e, n) => {
    if(!n.isRead) markReadMutation.mutate(n._id);
    if (n.type === 'challenge_received' && n.data?.challengeId) {
      e.preventDefault();
      setActiveChallengeId(n.data.challengeId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-slate-600 mt-1">Stay updated on your items and matches.</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button 
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
          >
            Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-slate-200">
            <div className="text-5xl mb-4 text-gray-600">🔕</div>
            <p className="text-slate-600">You're all caught up!</p>
          </div>
        ) : (
          notifications.map(n => (
            <div 
              key={n._id} 
              className={`glass rounded-xl p-4 flex gap-4 transition-all border ${n.isRead ? 'border-slate-200 opacity-70' : 'border-indigo-500/50 bg-indigo-900/10'}`}
              onClick={(e) => handleNotificationClick(e, n)}
            >
              <div className="text-3xl flex-shrink-0 pt-1">
                {getNotificationIcon(n.type)}
              </div>
              <div className="flex-1 min-w-0">
                <Link to={getNotificationLink(n)} onClick={(e) => n.type === 'challenge_received' && e.preventDefault()} className="block">
                  <h4 className={`text-lg mb-1 ${n.isRead ? 'text-slate-700' : 'font-bold text-slate-900'}`}>
                    {n.title}
                  </h4>
                  <p className="text-slate-600 text-sm">{n.body || n.message}</p>
                </Link>
                <div className="text-xs text-slate-500 mt-2 font-medium">
                  {formatTimeAgo(n.createdAt)}
                </div>
              </div>
              <div className="flex flex-col justify-between items-end">
                {!n.isRead && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></div>}
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(n._id); }}
                  className="text-slate-500 hover:text-rose-500 transition mt-auto"
                  title="Delete notification"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {activeChallengeId && (
        <AnswerChallengeModal
          challengeId={activeChallengeId}
          onClose={() => setActiveChallengeId(null)}
          onSuccess={(chatId) => {
            setActiveChallengeId(null);
            // navigate('/chats') could go here, but Link handles it if they click again
          }}
        />
      )}
    </div>
  );
};

export default Notifications;
