import { useState, useEffect, useCallback, useRef } from 'react';
import { activityApi } from '../api/index.js';
import { useSocket } from '../context/SocketContext.jsx';
import { SOCKET_EVENTS, ACTIVITY_LABELS } from '../utils/constants.js';

const ACTIVITY_ICONS = {
  'team.created':       '🏗️',
  'team.deleted':       '🗑️',
  'team.member_joined': '👋',
  'proposal.created':   '📝',
  'proposal.deleted':   '🗑️',
  'proposal.resolved':  '🎯',
  'vote.cast':          '🗳️',
  'vote.changed':       '🔄',
  'comment.added':      '💬',
};

const TYPE_COLORS = {
  'team.created':       'bg-blue-700',
  'team.deleted':       'bg-red-700',
  'team.member_joined': 'bg-green-700',
  'proposal.created':   'bg-primary-700',
  'proposal.deleted':   'bg-red-700',
  'proposal.resolved':  'bg-green-600',
  'vote.cast':          'bg-yellow-700',
  'vote.changed':       'bg-yellow-600',
  'comment.added':      'bg-gray-600',
};

const fmtTime = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
};

const ActivityItem = ({ activity, isNew = false }) => (
  <div className={`flex gap-4 transition-all duration-500 ${isNew ? 'animate-slide-in' : ''}`}>
    {/* Icon */}
    <div className="flex-shrink-0 flex flex-col items-center">
      <div className={`w-9 h-9 rounded-full ${TYPE_COLORS[activity.action] || 'bg-gray-700'} flex items-center justify-center text-base`}>
        {ACTIVITY_ICONS[activity.action] || '•'}
      </div>
      <div className="flex-1 w-0.5 bg-gray-700 mt-2 mb-1" />
    </div>

    {/* Content */}
    <div className="flex-1 pb-6 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200">
            <span className="font-semibold text-white">{activity.userName}</span>
            {' '}
            <span className="text-gray-400">{ACTIVITY_LABELS[activity.action] || activity.action}</span>
            {activity.targetTitle && (
              <>
                {' '}
                <span className="text-primary-400 font-medium">"{activity.targetTitle}"</span>
              </>
            )}
          </p>
          {activity.teamId && (
            <p className="text-xs text-gray-600 mt-0.5">
              {activity.targetType === 'team' ? '' : `in ${activity.meta?.teamName || 'a team'}`}
            </p>
          )}
        </div>
        <div className="flex-shrink-0 text-xs text-gray-600">{fmtTime(activity.createdAt)}</div>
      </div>
    </div>
  </div>
);

const ActivitySkeleton = () => (
  <div className="flex gap-4 animate-pulse">
    <div className="flex-shrink-0">
      <div className="w-9 h-9 rounded-full bg-gray-700" />
    </div>
    <div className="flex-1 pb-6 space-y-2">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-1/4" />
    </div>
  </div>
);

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [newIds, setNewIds] = useState(new Set());
  const { socket, connected } = useSocket();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const fetchPage = useCallback(async (pageNum, append = false) => {
    try {
      const data = await activityApi.getFeed(pageNum, 20);
      if (!isMounted.current) return;
      const items = data.activities || [];
      setActivities((prev) => append ? [...prev, ...items] : items);
      setHasMore(data.hasMore || false);
      setError('');
    } catch (err) {
      if (isMounted.current) setError(err.message || 'Failed to load activity');
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => { fetchPage(1, false); }, [fetchPage]);

  // Real-time: prepend new activities
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewActivity = (activity) => {
      setActivities((prev) => {
        if (prev.some((a) => a.id === activity.id)) return prev;
        return [activity, ...prev];
      });
      setNewIds((prev) => new Set(prev).add(activity.id));
      setTimeout(() => {
        setNewIds((prev) => { const next = new Set(prev); next.delete(activity.id); return next; });
      }, 2000);
    };

    socket.on(SOCKET_EVENTS.ACTIVITY_CREATED, handleNewActivity);
    return () => { socket.off(SOCKET_EVENTS.ACTIVITY_CREATED, handleNewActivity); };
  }, [socket, connected]);

  const loadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchPage(nextPage, true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
            Activity Timeline
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Real-time audit log of all platform events
            {connected && (
              <span className="ml-2 inline-flex items-center gap-1.5 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
                Live
              </span>
            )}
          </p>
        </div>

        {/* Feed */}
        {loading ? (
          <div className="space-y-0">
            {Array.from({ length: 10 }).map((_, i) => <ActivitySkeleton key={i} />)}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-red-400 mb-4">{error}</p>
            <button onClick={() => { setLoading(true); fetchPage(1, false); }} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
              Retry
            </button>
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-gray-400 text-lg">No activity yet.</p>
            <p className="text-gray-600 text-sm mt-2">Events will appear here as your team takes actions.</p>
          </div>
        ) : (
          <>
            <div className="space-y-0">
              {activities.map((a) => (
                <ActivityItem key={a.id} activity={a} isNew={newIds.has(a.id)} />
              ))}
            </div>

            {hasMore && (
              <div className="text-center pt-4">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {!hasMore && activities.length > 0 && (
              <div className="text-center py-6 text-gray-600 text-sm">You've reached the beginning of time.</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
