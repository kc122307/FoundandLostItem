import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { lostItemService } from '../services/lostItem.service';
import { foundItemService } from '../services/foundItem.service';
import useAuthStore from '../store/authStore';
import ItemCard from '../components/common/ItemCard';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('lost');

  const { data: lostData, isLoading: loadingLost } = useQuery({
    queryKey: ['myLostItems', user?._id],
    queryFn: () => lostItemService.getAll({ user: user._id }), 
  });

  const { data: foundData, isLoading: loadingFound } = useQuery({
    queryKey: ['myFoundItems', user?._id],
    queryFn: () => foundItemService.getAll({ user: user._id }),
  });

  // Filter items manually since backend getAll returns all (if no user filter implemented in query)
  // Assuming the backend returns items belonging to all, we will filter by userId locally for this MVP dashboard
  const myLostItems = lostData?.items?.filter(item => String(item.userId?._id || item.userId) === String(user?._id)) || [];
  const myFoundItems = foundData?.items?.filter(item => String(item.userId?._id || item.userId) === String(user?._id)) || [];

  const currentItems = activeTab === 'lost' ? myLostItems : myFoundItems;
  const isLoading = activeTab === 'lost' ? loadingLost : loadingFound;

  return (
    <div className="py-8">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-8 mb-8 flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-gray-900/50 to-indigo-900/10">
        <div className="flex items-center gap-6 mb-6 md:mb-0">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold border-4 border-slate-200">
            {user?.name?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
            <p className="text-slate-600 mt-1">Reputation Score: <span className="text-indigo-400 font-semibold">{user?.reputationScore || 0}</span></p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/report-lost" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium transition text-sm">
            Report Lost
          </Link>
          <Link to="/report-found" className="px-5 py-2.5 bg-slate-100 hover:bg-gray-700 border border-slate-300 rounded-lg font-medium transition text-sm">
            Report Found
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200 mb-8">
        <button 
          onClick={() => setActiveTab('lost')}
          className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'lost' ? 'text-indigo-400' : 'text-slate-600 hover:text-gray-200'}`}
        >
          My Lost Items
          {activeTab === 'lost' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></span>}
        </button>
        <button 
          onClick={() => setActiveTab('found')}
          className={`pb-4 px-2 font-medium transition-colors relative ${activeTab === 'found' ? 'text-indigo-400' : 'text-slate-600 hover:text-gray-200'}`}
        >
          My Found Items
          {activeTab === 'found' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500"></span>}
        </button>
      </div>

      {/* Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-[300px] rounded-xl bg-slate-100/50 animate-pulse border border-slate-200"></div>
          ))}
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-20 glass rounded-xl border-dashed border-2 border-slate-200">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">No {activeTab} items yet</h3>
          <p className="text-slate-600">When you report an item, it will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentItems.map(item => (
            <ItemCard key={item._id} item={item} type={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
