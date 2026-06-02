import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { lostItemService } from '../services/lostItem.service';
import { foundItemService } from '../services/foundItem.service';
import ItemCard from '../components/common/ItemCard';
import MapView from '../components/common/MapView';

const Explore = () => {
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const { data: lostData, isLoading: loadingLost } = useQuery({
    queryKey: ['exploreLostItems'],
    queryFn: () => lostItemService.getAll({}),
  });

  const { data: foundData, isLoading: loadingFound } = useQuery({
    queryKey: ['exploreFoundItems'],
    queryFn: () => foundItemService.getAll({}),
  });

  const currentItems = activeTab === 'lost' ? (lostData?.items || []) : (foundData?.items || []);
  const isLoading = activeTab === 'lost' ? loadingLost : loadingFound;

  const mapMarkers = currentItems
    .filter(item => item.location?.coordinates)
    .map(item => ({
      lat: item.location.coordinates[1],
      lng: item.location.coordinates[0],
      id: item._id,
      title: item.title
    }));

  return (
    <div className="py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Explore Items</h1>
        
        <div className="flex glass rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setActiveTab('lost')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'lost' ? 'bg-indigo-600 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Lost
          </button>
          <button 
            onClick={() => setActiveTab('found')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${activeTab === 'found' ? 'bg-indigo-600 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Found
          </button>
        </div>

        <div className="flex glass rounded-lg p-1 border border-slate-200">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition ${viewMode === 'list' ? 'bg-gray-700 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            title="List View"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-md transition ${viewMode === 'map' ? 'bg-gray-700 text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}
            title="Map View"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : viewMode === 'map' ? (
        <div className="h-[600px] w-full rounded-xl overflow-hidden glass p-1">
          <MapView markers={mapMarkers} />
        </div>
      ) : currentItems.length === 0 ? (
        <div className="text-center py-20 glass rounded-xl border-dashed border-2 border-slate-200">
          <p className="text-slate-600 text-lg">No {activeTab} items found in your area.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentItems.map(item => (
            <ItemCard key={item._id} item={item} type={activeTab} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
