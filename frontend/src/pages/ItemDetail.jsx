import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { lostItemService } from '../services/lostItem.service';
import { foundItemService } from '../services/foundItem.service';
import { claimService } from '../services/claim.service';
import useAuthStore from '../store/authStore';
import { formatDate, formatTimeAgo, formatCurrency } from '../utils/formatters';
import { ITEM_CATEGORIES } from '../utils/constants';
import MapView from '../components/common/MapView';
import toast from 'react-hot-toast';
import ClaimModal from '../components/claim/ClaimModal';
import CreateChallengeModal from '../components/claim/CreateChallengeModal';
import { challengeService } from '../services/challenge.service';

const ItemDetail = ({ type = 'lost' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [isRetry, setIsRetry] = useState(false);
  const [originalClaimId, setOriginalClaimId] = useState(null);
  const [answers, setAnswers] = useState({});
  const queryClient = useQueryClient();

  const isLost = type === 'lost';
  const service = isLost ? lostItemService : foundItemService;

  const { data: item, isLoading } = useQuery({
    queryKey: ['item', type, id],
    queryFn: () => service.getById(id),
  });

  const { data: myClaimsData } = useQuery({
    queryKey: ['myClaims'],
    queryFn: () => claimService.getMyClaims(),
    enabled: !!user && type === 'found'
  });

  const { data: myChallengesData } = useQuery({
    queryKey: ['myChallenges'],
    queryFn: () => challengeService.getMyChallenges(),
    enabled: !!user && type === 'lost'
  });

  const claimMutation = useMutation({
    mutationFn: claimService.submitClaim,
    onSuccess: () => {
      toast.success('Claim submitted! The owner will review it.');
      setShowClaimModal(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to submit claim');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => service.remove(id),
    onSuccess: () => {
      toast.success('Item deleted successfully');
      navigate('/explore');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to delete item');
    }
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => service.update(id, { status: 'resolved' }),
    onSuccess: () => {
      toast.success('Item marked as resolved');
      queryClient.invalidateQueries(['item', type, id]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to resolve item');
    }
  });

  if (isLoading) {
    return <div className="min-h-[50vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div>;
  }

  if (!item) {
    return <div className="text-center py-20"><h2 className="text-2xl font-bold">Item not found</h2></div>;
  }

  const itemOwnerId = item?.userId?._id || item?.userId;
  const isOwner = user && itemOwnerId && String(user._id) === String(itemOwnerId);
  const category = ITEM_CATEGORIES.find(c => c.id === item.category);
  const itemDate = isLost ? item.dateLost : item.dateFound;

  // Find if there's an existing claim for this item
  const existingClaim = myClaimsData?.claims?.find(c => c.itemId._id === id || c.itemId === id);
  const existingChallenge = myChallengesData?.challenges?.find(c => c.lostItemId === id || c.lostItemId?._id === id);

  return (
    <div className="py-8 max-w-6xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Col: Images & Details */}
        <div className="lg:w-2/3 space-y-6">
          <div className="glass rounded-2xl overflow-hidden p-2 border border-slate-200">
            {item.images?.length > 0 ? (
              <img 
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/uploads/items/${item.images[0]}`} 
                alt={item.title} 
                className="w-full h-96 object-contain bg-black/50 rounded-xl"
              />
            ) : (
              <div className="w-full h-96 bg-white flex items-center justify-center rounded-xl">
                <span className="text-slate-500">No images available</span>
              </div>
            )}
            {/* Image Thumbnails could go here */}
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
                <div className="flex gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${isLost ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {isLost ? 'LOST' : 'FOUND'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
                    {category?.icon} {category?.label}
                  </span>
                </div>
              </div>
              {isLost && item.rewardAmount > 0 && (
                <div className="text-right">
                  <div className="text-xs text-slate-600 uppercase tracking-wider">Reward</div>
                  <div className="text-2xl font-bold text-emerald-400">{formatCurrency(item.rewardAmount)}</div>
                </div>
              )}
            </div>

            <p className="text-slate-700 text-lg leading-relaxed mb-6 whitespace-pre-wrap">
              {item.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-200">
              <div>
                <div className="text-xs text-slate-500 mb-1">Color</div>
                <div className="font-medium">{item.color || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Brand</div>
                <div className="font-medium">{item.brand || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Date {isLost ? 'Lost' : 'Found'}</div>
                <div className="font-medium">{formatDate(itemDate)}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Status</div>
                <div className="font-medium capitalize text-indigo-400">{item.status}</div>
              </div>
            </div>
            
            {/* Location Map */}
            {item.location?.coordinates && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Location {isLost ? 'Lost' : 'Found'}
                </h3>
                <p className="text-sm text-slate-600 mb-3">{item.location.address}</p>
                <div className="h-48 rounded-xl overflow-hidden border border-slate-300">
                  <MapView 
                    center={[item.location.coordinates[1], item.location.coordinates[0]]} 
                    zoom={15}
                    markers={[{lat: item.location.coordinates[1], lng: item.location.coordinates[0]}]}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: User Info & Actions */}
        <div className="lg:w-1/3 space-y-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm text-slate-500 uppercase tracking-wider mb-4 font-semibold">Posted By</h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-900 rounded-full flex items-center justify-center font-bold text-lg text-indigo-300">
                {item.userId?.name?.charAt(0) || '?'}
              </div>
              <div>
                <div className="font-bold text-lg">
                  {/* Mask name if not owner or not matched (Logic could be refined based on backend data) */}
                  {isOwner ? 'You' : item.userId?.name}
                </div>
                <div className="text-sm text-slate-600">Reputation: {item.userId?.reputationScore || 0}</div>
              </div>
            </div>

            {!isOwner && item.status === (isLost ? 'active' : 'available') && (
              <div className="space-y-4">
                {isLost ? (
                  <>
                    {!existingChallenge ? (
                      <button 
                        onClick={() => setShowClaimModal(true)}
                        className="w-full py-3 rounded-lg font-bold text-white transition shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30"
                      >
                        I Found This Item
                      </button>
                    ) : (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                        <p className="text-indigo-800 font-medium">You have already reported finding this item. The owner has been notified.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {!existingClaim ? (
                      <button 
                        onClick={() => {
                          setIsRetry(false);
                          setShowClaimModal(true);
                        }}
                        className="w-full py-3 rounded-lg font-bold text-slate-900 transition shadow-lg bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30"
                      >
                        This Is My Item
                      </button>
                    ) : existingClaim.status === 'approved' ? (
                      <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                        <div className="text-green-600 font-bold mb-2">Claim Approved!</div>
                        <button onClick={() => navigate('/chats')} className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">
                          Open Chat
                        </button>
                      </div>
                    ) : existingClaim.status === 'rejected' && existingClaim.canRetry ? (
                      <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-center">
                        <div className="text-amber-600 font-bold mb-2">Claim Rejected</div>
                        <p className="text-sm text-slate-600 mb-3">Your answers didn't match. You have one more attempt.</p>
                        <button 
                          onClick={() => {
                            setIsRetry(true);
                            setOriginalClaimId(existingClaim._id);
                            setShowClaimModal(true);
                          }} 
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg"
                        >
                          Try Again
                        </button>
                      </div>
                    ) : existingClaim.status === 'rejected' ? (
                      <div className="bg-red-50 p-4 rounded-xl border border-red-200 text-center">
                        <div className="text-red-600 font-bold mb-1">Claim Rejected</div>
                        <p className="text-sm text-slate-600">Your answers did not match. Out of attempts.</p>
                      </div>
                    ) : (
                      <div className="bg-sky-50 p-4 rounded-xl border border-sky-200 text-center text-sky-700 font-medium">
                        You attempted to claim this. Awaiting result.
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {isOwner && (
              <div className="space-y-3 mt-4">
                <button 
                  onClick={() => toast.error('Edit page not implemented yet. Please delete and recreate the item for now.')}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg transition border border-slate-300"
                >
                  Edit Item
                </button>
                {item.status !== 'resolved' && (
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to mark this item as resolved?')) {
                        resolveMutation.mutate(item._id);
                      }
                    }}
                    disabled={resolveMutation.isPending}
                    className="w-full py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition border border-emerald-200"
                  >
                    Mark as Resolved
                  </button>
                )}
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                      deleteMutation.mutate(item._id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="w-full py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition font-medium"
                >
                  Delete Item
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showClaimModal && isLost && (
        <CreateChallengeModal
          lostItemId={item._id}
          onClose={() => setShowClaimModal(false)}
          onSuccess={() => setShowClaimModal(false)}
        />
      )}

      {showClaimModal && !isLost && (
        <ClaimModal
          foundItemId={item._id}
          foundItemCategory={item.category}
          verificationQuestions={item.verificationQuestions}
          isRetry={isRetry}
          originalClaimId={originalClaimId}
          onSuccess={(chatId) => {
            setShowClaimModal(false);
            navigate('/chats');
          }}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  );
};

export default ItemDetail;
