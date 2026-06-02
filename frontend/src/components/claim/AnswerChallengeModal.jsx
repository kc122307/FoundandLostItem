import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { challengeService } from '../../services/challenge.service';

const AnswerChallengeModal = ({ challengeId, onClose, onSuccess }) => {
  const [answers, setAnswers] = useState(['', '']);
  const [step, setStep] = useState('questions'); // questions, submitting, result
  const [result, setResult] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: () => challengeService.getChallengeById(challengeId),
  });

  const answerMutation = useMutation({
    mutationFn: challengeService.answerChallenge,
    onSuccess: (data) => {
      setResult(data);
      setStep('result');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit answers');
      setStep('questions');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answers.some(a => !a.trim())) {
      return toast.error('Please answer both questions');
    }
    
    setStep('submitting');
    const ownerAnswers = answers.map((ans, idx) => ({
      questionIndex: idx,
      answer: ans
    }));

    answerMutation.mutate({ challengeId, ownerAnswers });
  };

  const handleTryAgain = () => {
    setStep('questions');
    setAnswers(['', '']);
    setResult(null);
  };

  const challenge = data?.challenge;

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
          disabled={step === 'submitting'}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {step === 'questions' && (
              <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Someone Found Your Item!</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Answer these questions accurately to prove the item is yours and chat with the finder.
                  </p>
                </div>

                {isLoading ? (
                  <div className="py-12 flex justify-center">
                    <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
                  </div>
                ) : !challenge ? (
                  <div className="text-center py-8 text-red-500">Challenge not found.</div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-800">
                      <strong>Important:</strong> Answer precisely. The AI will evaluate your answers against the finder's secret answers.
                    </div>

                    {challenge.questions.map((q, idx) => (
                      <div key={idx} className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                          <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs mr-2">Q{idx + 1}</span>
                          {q.question}
                        </label>
                        <input
                          type="text"
                          required
                          value={answers[idx]}
                          onChange={e => {
                            const newAns = [...answers];
                            newAns[idx] = e.target.value;
                            setAnswers(newAns);
                          }}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                      </div>
                    ))}

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button type="button" onClick={onClose} className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition">
                        Cancel
                      </button>
                      <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-200">
                        Submit Answers
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}

            {step === 'submitting' && (
              <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4" />
                <p className="text-slate-600 font-medium">Verifying your answers...</p>
              </motion.div>
            )}

            {step === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {result.approved ? (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Verified! 🎉</h2>
                    <p className="text-slate-600 mb-8">
                      Your answers were correct. You can now chat with the finder to arrange handover.
                    </p>
                    <button 
                      onClick={() => onSuccess && onSuccess(result.chatId)}
                      className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl transition shadow-lg shadow-green-200"
                    >
                      Open Chat
                    </button>
                  </div>
                ) : result.canRetry ? (
                  <div>
                    <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-center text-slate-800 mb-2">Some answers didn't match</h2>
                    <p className="text-center text-slate-600 mb-6">Score: {result.score.toFixed(0)}/100</p>
                    
                    <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {result.feedback.map((fb, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {fb.passed ? <span className="text-green-500">✅</span> : <span className="text-red-500">❌</span>}
                          <span className="text-sm text-slate-700">Question {fb.questionIndex + 1}</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-center text-sm font-medium text-amber-600 mb-6">You have 1 more attempt.</p>
                    
                    <div className="flex gap-3">
                      <button onClick={onClose} className="flex-1 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition">
                        Cancel
                      </button>
                      <button onClick={handleTryAgain} className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition shadow-lg shadow-amber-200">
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-800 mb-2">Verification Failed</h2>
                    <p className="text-slate-600 mb-8">
                      Your answers did not match what the finder expected. The challenge is closed.
                    </p>
                    <button onClick={onClose} className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition shadow-lg">
                      Close
                    </button>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AnswerChallengeModal;
