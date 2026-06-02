import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import useAuthStore from '../store/authStore';
import { Navigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminPanel = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Basic role check
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: async () => {
      const { data } = await api.get('/admin/analytics');
      return data;
    }
  });

  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const { data } = await api.get('/admin/users');
      return data;
    }
  });

  const banMutation = useMutation({
    mutationFn: async ({ id, reason }) => {
      await api.post(`/admin/users/${id}/ban`, { reason });
    },
    onSuccess: () => {
      toast.success('User banned');
      queryClient.invalidateQueries(['adminUsers']);
    }
  });

  const unbanMutation = useMutation({
    mutationFn: async (id) => {
      await api.post(`/admin/users/${id}/unban`);
    },
    onSuccess: () => {
      toast.success('User unbanned');
      queryClient.invalidateQueries(['adminUsers']);
    }
  });

  if (loadingAnalytics || loadingUsers) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;
  }

  const handleBan = (id) => {
    const reason = prompt('Enter reason for ban:');
    if (reason) banMutation.mutate({ id, reason });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8 border-b border-slate-200 pb-6">
        <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Control Panel</h1>
          <p className="text-slate-600">System overview and user management.</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="glass p-6 rounded-2xl border border-slate-200 border-l-4 border-l-sky-500">
          <div className="text-sm text-slate-600 uppercase font-semibold tracking-wider mb-2">Total Users</div>
          <div className="text-4xl font-bold text-slate-900">{analytics?.users || 0}</div>
        </div>
        <div className="glass p-6 rounded-2xl border border-slate-200 border-l-4 border-l-rose-500">
          <div className="text-sm text-slate-600 uppercase font-semibold tracking-wider mb-2">Lost Items</div>
          <div className="text-4xl font-bold text-slate-900">{analytics?.lostItems || 0}</div>
        </div>
        <div className="glass p-6 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500">
          <div className="text-sm text-slate-600 uppercase font-semibold tracking-wider mb-2">Found Items</div>
          <div className="text-4xl font-bold text-slate-900">{analytics?.foundItems || 0}</div>
        </div>
        <div className="glass p-6 rounded-2xl border border-slate-200 border-l-4 border-l-yellow-500">
          <div className="text-sm text-slate-600 uppercase font-semibold tracking-wider mb-2">Successful Matches</div>
          <div className="text-4xl font-bold text-slate-900">{analytics?.successfulMatches || 0}</div>
        </div>
      </div>

      {/* User Management */}
      <div className="glass rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 bg-white/50">
          <h2 className="text-xl font-bold">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">Email</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {usersData?.users?.map(u => (
                <tr key={u._id} className="hover:bg-slate-100/30 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-900 flex items-center justify-center font-bold text-indigo-300 text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600">{u.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-100 text-slate-700'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    {u.isBanned ? (
                      <span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold">Banned</span>
                    ) : (
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold">Active</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {u.role !== 'admin' && (
                      u.isBanned ? (
                        <button onClick={() => unbanMutation.mutate(u._id)} className="text-emerald-400 hover:text-emerald-300 font-medium text-sm transition">
                          Unban
                        </button>
                      ) : (
                        <button onClick={() => handleBan(u._id)} className="text-rose-400 hover:text-rose-300 font-medium text-sm transition">
                          Ban User
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
