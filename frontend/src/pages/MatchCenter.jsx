import { useQuery } from '@tanstack/react-query';
import { matchService } from '../services/match.service';
import { chatService } from '../services/chat.service';
import { Link, useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../utils/formatters';
import toast from 'react-hot-toast';
import { claimService } from '../services/claim.service';
import ClaimModal from '../components/claim/ClaimModal';
import { useState } from 'react';

const MatchCenter = () => {
  const navigate = useNavigate();
  const [activeClaimModal, setActiveClaimModal] = useState(null);
  const [isRetry, setIsRetry] = useState(false);
  const [originalClaimId, setOriginalClaimId] = useState(null);

  const { data: myMatches, isLoading: loadingMatches } = useQuery({
    queryKey: ['myMatches'],
    queryFn: matchService.getMyMatches
  });

  const { data: myClaimsData, isLoading: loadingClaims } = useQuery({
    queryKey: ['myClaims'],
    queryFn: claimService.getMyClaims
  });

  const handleStartChat = async (matchId) => {
    try {
      const chat = await chatService.startChat(matchId);
      navigate('/chat', { state: { activeChatId: chat._id } });
    } catch (error) {
      toast.error('Could not start chat');
    }
  };

  if (loadingMatches || loadingClaims) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-500"></div></div>;
  }

  const matches = myMatches?.matches || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI Match Center</h1>
          <p className="text-slate-600">High probability matches identified by our CLIP vision model.</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-20 glass rounded-2xl border-dashed border-2 border-slate-200">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No matches found yet</h3>
          <p className="text-slate-600">We continuously scan new items. You'll be notified if a match is found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {matches.map(match => {
            const existingClaim = myClaimsData?.claims?.find(c => c.itemId._id === match.foundItemId._id || c.itemId === match.foundItemId._id);
            return (
            <div key={match._id} className="glass rounded-2xl p-6 border border-slate-200 relative overflow-hidden group">
              {/* Score Indicator Background */}
              <div 
                className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-20 -mt-20 opacity-20 pointer-events-none ${
                  match.score >= 80 ? 'bg-emerald-500' : match.score >= 60 ? 'bg-yellow-500' : 'bg-rose-500'
                }`}
              ></div>

              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {/* Lost Item */}
                <div className="flex-1 text-center w-full">
                  <div className="text-rose-400 font-semibold mb-2 text-sm uppercase tracking-wider">Lost Item</div>
                  <div className="h-48 rounded-xl bg-white border border-slate-200 overflow-hidden mb-3 relative">
                    <img 
                      src={`/uploads/items/${match.lostItemId.images[0]}`}
                      className="w-full h-full object-cover" 
                      alt="Lost"
                    />
                  </div>
                  <Link to={`/item/lost/${match.lostItemId._id}`} className="font-semibold hover:text-indigo-400">{match.lostItemId.title}</Link>
                </div>

                {/* VS / Score */}
                <div className="flex flex-col items-center px-4 w-full md:w-auto">
                  <div className="relative">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="40" stroke="#1f2937" strokeWidth="8" fill="none" />
                      <circle cx="48" cy="48" r="40" stroke={match.score >= 80 ? '#10b981' : match.score >= 60 ? '#f59e0b' : '#ef4444'} strokeWidth="8" fill="none" strokeDasharray={`${match.score * 2.51} 251`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-slate-900">{match.score}%</span>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 mt-2 uppercase tracking-wider font-semibold">AI Match Score</span>
                </div>

                {/* Found Item */}
                <div className="flex-1 text-center w-full">
                  <div className="text-emerald-400 font-semibold mb-2 text-sm uppercase tracking-wider">Found Item</div>
                  <div className="h-48 rounded-xl bg-white border border-slate-200 overflow-hidden mb-3 relative">
                    <img 
                      src={`/uploads/items/${match.foundItemId.images[0]}`}
                      className="w-full h-full object-cover" 
                      alt="Found"
                    />
                  </div>
                  <Link to={`/item/found/${match.foundItemId._id}`} className="font-semibold hover:text-indigo-400">{match.foundItemId.title}</Link>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-slate-600">
                  Match found {formatTimeAgo(match.createdAt)}
                </div>
                <div className="flex gap-4 w-full sm:w-auto items-center">
                  {!existingClaim ? (
                    <button 
                      onClick={() => {
                        setIsRetry(false);
                        setActiveClaimModal({ id: match.foundItemId._id, category: match.foundItemId.category });
                      }}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-bold transition shadow-lg shadow-emerald-500/20"
                    >
                      Claim Now
                    </button>
                  ) : existingClaim.status === 'pending' ? (
                    <span className="px-4 py-2 bg-sky-100 text-sky-700 font-medium rounded-lg">
                      Claim Submitted — Awaiting Result
                    </span>
                  ) : existingClaim.status === 'approved' ? (
                    <button 
                      onClick={() => navigate('/chats')}
                      className="px-6 py-2.5 bg-green-500 hover:bg-green-600 rounded-lg text-white font-bold transition shadow-lg"
                    >
                      Claimed ✅ — Open Chat
                    </button>
                  ) : existingClaim.status === 'rejected' && existingClaim.canRetry ? (
                    <div className="flex items-center gap-3">
                      <span className="text-red-500 font-medium">Rejected ❌</span>
                      <button 
                        onClick={() => {
                          setIsRetry(true);
                          setOriginalClaimId(existingClaim._id);
                          setActiveClaimModal({ id: match.foundItemId._id, category: match.foundItemId.category });
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition shadow-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <span className="text-red-500 font-medium">Rejected ❌</span>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}

      {activeClaimModal && (
        <ClaimModal
          foundItemId={activeClaimModal.id}
          foundItemCategory={activeClaimModal.category}
          isRetry={isRetry}
          originalClaimId={originalClaimId}
          onSuccess={(chatId) => {
            setActiveClaimModal(null);
            navigate('/chats');
          }}
          onClose={() => setActiveClaimModal(null)}
        />
      )}
    </div>
  );
};

export default MatchCenter;
