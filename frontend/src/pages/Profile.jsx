import { useState } from 'react';
import useAuthStore from '../store/authStore';
import { BADGES } from '../utils/constants';

const Profile = () => {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    city: user?.city || '',
    college: user?.college || '',
    mobile: user?.mobile || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate update since user endpoint isn't fully wired for updates in MVP
    alert('Profile update simulated!');
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="glass rounded-3xl overflow-hidden border border-slate-200">
        
        {/* Header Cover */}
        <div className="h-48 bg-gradient-to-r from-indigo-900 to-sky-900 relative">
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <div className="w-32 h-32 rounded-full bg-white border-4 border-gray-950 flex items-center justify-center text-5xl font-bold text-indigo-400 shadow-xl">
              {user?.name?.charAt(0)}
            </div>
            <div className="pb-2">
              <h1 className="text-3xl font-bold text-slate-900 shadow-sm">{user?.name}</h1>
              <p className="text-slate-700 font-medium">{user?.college || 'LostLink Member'}</p>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end p-6 border-b border-slate-200">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 bg-slate-100 hover:bg-gray-700 text-slate-900 rounded-lg font-medium transition border border-slate-300"
          >
            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
          </button>
        </div>

        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Left Col: Details */}
          <div className="md:col-span-2 space-y-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Full Name</label>
                    <input type="text" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">Mobile Number</label>
                    <input type="tel" value={formData.mobile} onChange={e=>setFormData({...formData, mobile:e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">City</label>
                    <input type="text" value={formData.city} onChange={e=>setFormData({...formData, city:e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-1">College/Workplace</label>
                    <input type="text" value={formData.college} onChange={e=>setFormData({...formData, college:e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                  </div>
                </div>
                <button type="submit" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-slate-900 rounded-lg font-bold shadow-lg shadow-indigo-500/20">
                  Save Changes
                </button>
              </form>
            ) : (
              <div className="animate-fadeIn space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">About Me</h3>
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <div className="text-slate-500 text-sm mb-1">Email Address</div>
                      <div className="text-slate-900 font-medium">{user?.email}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm mb-1">City</div>
                      <div className="text-slate-900 font-medium">{user?.city || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm mb-1">Mobile</div>
                      <div className="text-slate-900 font-medium">{user?.mobile || 'Not specified'}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm mb-1">Joined</div>
                      <div className="text-slate-900 font-medium">{new Date(user?.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Stats & Badges */}
          <div className="space-y-8">
            <div className="glass bg-white/50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-lg font-bold mb-1">Reputation Score</h3>
              <div className="flex items-end gap-3 mb-4">
                <span className="text-5xl font-extrabold text-indigo-400">{user?.reputationScore || 0}</span>
                <span className="text-slate-500 font-medium mb-1">pts</span>
              </div>
              <p className="text-xs text-slate-600">Earn points by successfully returning items to their rightful owners.</p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Earned Badges</h3>
              {(!user?.badges || user.badges.length === 0) ? (
                <div className="text-sm text-slate-600 bg-white/50 p-4 rounded-lg border border-dashed border-slate-300">
                  You haven't earned any badges yet. Help the community to unlock them!
                </div>
              ) : (
                <div className="space-y-3">
                  {user.badges.map(b => {
                    const badge = BADGES[b];
                    if (!badge) return null;
                    return (
                      <div key={b} className={`flex items-center gap-3 p-3 rounded-xl border border-slate-200/50 ${badge.color}`}>
                        <span className="text-2xl">{badge.icon}</span>
                        <span className="font-semibold text-sm">{badge.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;
