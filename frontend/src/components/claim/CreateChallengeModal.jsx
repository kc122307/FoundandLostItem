import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMutation } from '@tanstack/react-query';
import { challengeService } from '../../services/challenge.service';

const CreateChallengeModal = ({ lostItemId, onClose, onSuccess }) => {
  const [questions, setQuestions] = useState([
    { question: '', expectedAnswer: '' },
    { question: '', expectedAnswer: '' }
  ]);
  
  const challengeMutation = useMutation({
    mutationFn: challengeService.createChallenge,
    onSuccess: (data) => {
      toast.success(data.message || 'Challenge sent successfully!');
      onSuccess && onSuccess(data);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to send challenge');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    if (questions.some(q => !q.question.trim() || !q.expectedAnswer.trim())) {
      return toast.error('Please fill in both questions and answers.');
    }
    challengeMutation.mutate({ lostItemId, questions });
  };

  const updateQuestion = (index, field, value) => {
    const newQs = [...questions];
    newQs[index][field] = value;
    setQuestions(newQs);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
          disabled={challengeMutation.isPending}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Challenge the Owner</h2>
            <p className="text-sm text-slate-500 mt-2">
              Since you found this item, set 2 questions that only the true owner would know.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-4 text-sm text-sky-800">
              <strong>Tip:</strong> Ask about specific physical details, scratches, or hidden contents.
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-sky-100 text-sky-700 font-bold px-2.5 py-0.5 rounded text-xs">Q{idx + 1}</span>
                  <span className="font-semibold text-slate-700">Verification Question</span>
                </div>
                
                <div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. What color is the phone case?"
                    value={q.question}
                    onChange={e => updateQuestion(idx, 'question', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Expected Answer (Secret)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Red with a scratch"
                    value={q.expectedAnswer}
                    onChange={e => updateQuestion(idx, 'expectedAnswer', e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-sky-500 outline-none transition text-sm"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition font-medium"
                disabled={challengeMutation.isPending}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition shadow-lg shadow-indigo-200 flex items-center justify-center min-w-[120px]"
                disabled={challengeMutation.isPending}
              >
                {challengeMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send Challenge'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateChallengeModal;
