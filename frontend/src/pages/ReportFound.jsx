import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { foundItemService } from '../services/foundItem.service';
import { ITEM_CATEGORIES } from '../utils/constants';
import MapView from '../components/common/MapView';
import ImageUploader from '../components/common/ImageUploader';
import useGeolocation from '../hooks/useGeolocation';
import api from '../services/api';

const ReportFound = () => {
  const navigate = useNavigate();
  const { coords, getLocation, isLoading: gettingLocation } = useGeolocation();
  
  const [images, setImages] = useState([]);
  const [step, setStep] = useState(1);
  const [customQuestions, setCustomQuestions] = useState([
    { question: '', answer: '' },
    { question: '', answer: '' }
  ]);
  const [formData, setFormData] = useState({
    title: '',
    category: 'mobile_phone',
    description: '',
    color: '',
    brand: '',
    dateFound: new Date().toISOString().split('T')[0],
    location: null,
    addressString: '',
    handoverLocation: '',
    additionalNotes: ''
  });

  useEffect(() => {
    if (coords) {
      setFormData(prev => ({ 
        ...prev, 
        location: coords, 
        addressString: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` 
      }));
    }
  }, [coords]);

  const mutation = useMutation({
    mutationFn: foundItemService.create,
    onSuccess: (data) => {
      toast.success('Found item reported successfully!');
      navigate(`/item/found/${data.foundItem._id}`);
    },
    onError: (err) => toast.error(err.message || 'Failed to report item')
  });

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      return toast.error('Please fill required fields');
    }
    if (step === 2) {
      if (!customQuestions[0].question.trim() || !customQuestions[0].answer.trim() || 
          !customQuestions[1].question.trim() || !customQuestions[1].answer.trim()) {
        return toast.error('Please provide two questions and their answers');
      }
    }
    if (step === 3 && !formData.location) {
      return toast.error('Please select a location on the map');
    }
    setStep(prev => prev + 1);
  };

  const handleLocationSelect = (loc) => {
    setFormData(prev => ({ ...prev, location: loc, addressString: `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}` }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (images.length === 0) {
      return toast.error('Please upload at least one image of the item');
    }

    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('category', formData.category);
    submitData.append('description', formData.description);
    submitData.append('color', formData.color);
    submitData.append('brand', formData.brand);
    submitData.append('dateFound', formData.dateFound);
    submitData.append('handoverLocation', formData.handoverLocation);
    submitData.append('additionalNotes', formData.additionalNotes);
    
    const locObj = {
      type: 'Point',
      coordinates: [formData.location.lng, formData.location.lat],
      address: formData.addressString
    };
    submitData.append('location', JSON.stringify(locObj));
    const formattedQuestions = customQuestions.map(q => ({
      question: q.question,
      answer: q.answer,
      answerType: 'descriptive'
    }));
    submitData.append('verificationQuestions', JSON.stringify(formattedQuestions));

    images.forEach(file => {
      submitData.append('images', file);
    });

    mutation.mutate(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-sky-400">Report Found Item</h1>
        <p className="text-slate-600 mb-8">Help reunite this item with its owner using our AI matching system.</p>

        {/* Progress Bar */}
        <div className="flex mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`flex-1 h-2 rounded-full mx-1 transition-colors ${step >= i ? 'bg-sky-500' : 'bg-slate-100'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Title (What did you find?) *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" placeholder="e.g. Set of Keys" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Category *</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900">
                    {ITEM_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Description (Be somewhat vague to prevent fraud) *</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" placeholder="Don't reveal everything (like ID numbers). Let the owner prove it's theirs!"></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Brand</label>
                  <input type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Primary Color</label>
                  <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Verification Questions */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Set Verification Answer Key</h2>
              <p className="text-sm text-slate-600 mb-4">
                To prevent fraud and ensure this item is returned to its rightful owner, please ask two specific questions that only the true owner would know the answer to. Provide the correct answers based on what you see on the item.
              </p>
              
              {[0, 1].map((idx) => (
                <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    <span className="inline-block bg-sky-100 text-sky-700 px-2 py-0.5 rounded mr-2">Q{idx + 1}</span>
                    Question {idx + 1}
                  </label>
                  <input
                    type="text"
                    required
                    value={customQuestions[idx].question}
                    onChange={e => {
                      const newQs = [...customQuestions];
                      newQs[idx].question = e.target.value;
                      setCustomQuestions(newQs);
                    }}
                    placeholder="e.g. What color is the inner lining of the bag?"
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900 mb-4"
                  />
                  <label className="block text-sm font-semibold text-slate-800 mb-2">
                    Expected Answer
                  </label>
                  <input
                    type="text"
                    required
                    value={customQuestions[idx].answer}
                    onChange={e => {
                      const newQs = [...customQuestions];
                      newQs[idx].answer = e.target.value;
                      setCustomQuestions(newQs);
                    }}
                    placeholder="e.g. Red lining"
                    className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900"
                  />
                </div>
              ))}
              <div className="text-xs text-slate-500 mt-4 flex items-start gap-2">
                <span className="text-sky-500 text-base">🔒</span>
                <p>Your answers are encrypted and only used to verify the owner. They are never shown publicly.</p>
              </div>
            </div>
          )}

          {/* STEP 3: Location & Date */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Where & When</h2>
              
              <div>
                <label className="block text-sm text-slate-700 mb-1">Date Found *</label>
                <input type="date" required value={formData.dateFound} onChange={e => setFormData({...formData, dateFound: e.target.value})} className="w-full max-w-sm bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-slate-700">Pin Location Where Found *</label>
                  <button type="button" onClick={getLocation} className="text-sm text-sky-400 hover:text-sky-300 flex items-center">
                    {gettingLocation ? 'Getting location...' : 'Use current location'}
                  </button>
                </div>
                <div className="h-64 rounded-lg overflow-hidden border border-slate-300 mb-2">
                  <MapView 
                    selectable 
                    onLocationSelect={handleLocationSelect} 
                    selectedLocation={formData.location || coords}
                    center={coords ? [coords.lat, coords.lng] : undefined}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Images & Finalize */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Images & Handover</h2>
              <p className="text-sm text-slate-600 mb-4">Upload images of the item. This is required for AI matching.</p>
              
              <ImageUploader images={images} setImages={setImages} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Current Item Location / Handover Preference</label>
                  <input type="text" value={formData.handoverLocation} onChange={e => setFormData({...formData, handoverLocation: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" placeholder="e.g. Left at Security Desk, or I kept it" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Additional Notes</label>
                  <input type="text" value={formData.additionalNotes} onChange={e => setFormData({...formData, additionalNotes: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" placeholder="Any other info?" />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-slate-200 mt-8">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(step - 1)} className="px-6 py-2 bg-slate-100 hover:bg-gray-700 text-slate-900 rounded-lg transition">
                Back
              </button>
            ) : <div />}
            
            {step < 4 ? (
              <button type="button" onClick={handleNext} className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-slate-900 rounded-lg transition shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                Next Step
              </button>
            ) : (
              <button type="submit" disabled={mutation.isPending} className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50">
                {mutation.isPending ? 'Reporting...' : 'Submit Found Report'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportFound;
