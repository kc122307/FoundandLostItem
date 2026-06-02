import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { lostItemService } from '../services/lostItem.service';
import { ITEM_CATEGORIES, QUESTION_SUGGESTIONS } from '../utils/constants';
import MapView from '../components/common/MapView';
import ImageUploader from '../components/common/ImageUploader';
import useGeolocation from '../hooks/useGeolocation';

const ReportLost = () => {
  const navigate = useNavigate();
  const { coords, getLocation, isLoading: gettingLocation } = useGeolocation();
  
  const [images, setImages] = useState([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'mobile_phone',
    description: '',
    color: '',
    brand: '',
    dateLost: new Date().toISOString().split('T')[0],
    timeLost: '',
    rewardAmount: 0,
    contactPreference: 'chat',
    location: null,
    addressString: ''
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
    mutationFn: lostItemService.create,
    onSuccess: (data) => {
      toast.success('Lost item reported successfully!');
      navigate(`/item/lost/${data.lostItem._id}`);
    },
    onError: (err) => toast.error(err.message || 'Failed to report item')
  });

  const handleNext = () => {
    if (step === 1 && (!formData.title || !formData.description)) {
      return toast.error('Please fill required fields');
    }
    if (step === 2 && !formData.location) {
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
    submitData.append('dateLost', formData.dateLost);
    submitData.append('timeLost', formData.timeLost);
    submitData.append('rewardAmount', formData.rewardAmount);
    submitData.append('contactPreference', formData.contactPreference);
    
    const locObj = {
      type: 'Point',
      coordinates: [formData.location.lng, formData.location.lat],
      address: formData.addressString
    };
    submitData.append('location', JSON.stringify(locObj));

    images.forEach(file => {
      submitData.append('images', file);
    });

    mutation.mutate(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="glass rounded-2xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Report Lost Item</h1>
        <p className="text-slate-600 mb-8">Provide details to help AI match your lost item with found items.</p>

        {/* Progress Bar */}
        <div className="flex mb-8 border-b border-slate-200">
          {['Details', 'Location', 'Images & Finalize'].map((label, i) => (
            <div key={label} className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${step === i + 1 ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>
              {i + 1}. {label}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Basic Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Title (What did you lose?) *</label>
                  <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" placeholder="e.g. iPhone 13 Pro Max" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Category *</label>
                  <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900">
                    {ITEM_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-700 mb-1">Description *</label>
                <textarea required rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" placeholder="Describe the item, any distinct marks, scratches..."></textarea>
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

          {/* STEP 2: Location & Date */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Where & When</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Date Lost *</label>
                  <input type="date" required value={formData.dateLost} onChange={e => setFormData({...formData, dateLost: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Approximate Time</label>
                  <input type="time" value={formData.timeLost} onChange={e => setFormData({...formData, timeLost: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm text-slate-700">Pin Location on Map *</label>
                  <button type="button" onClick={getLocation} className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center">
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
                <p className="text-xs text-slate-500">Click on the map to pin where you think you lost the item.</p>
              </div>
            </div>
          )}

          {/* STEP 3: Images & Finalize */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-semibold border-b border-slate-200 pb-2">Upload Images & Finalize</h2>
              <p className="text-sm text-slate-600 mb-4">Our AI needs at least one image of the item (or a very similar reference image) to match it with found items.</p>
              
              <ImageUploader images={images} setImages={setImages} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Reward Amount (₹) (Optional)</label>
                  <input type="number" min="0" value={formData.rewardAmount} onChange={e => setFormData({...formData, rewardAmount: Number(e.target.value)})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900" />
                </div>
                <div>
                  <label className="block text-sm text-slate-700 mb-1">Contact Preference</label>
                  <select value={formData.contactPreference} onChange={e => setFormData({...formData, contactPreference: e.target.value})} className="w-full bg-white border border-slate-300 rounded-lg p-3 text-slate-900">
                    <option value="chat">In-App Chat Only</option>
                    <option value="email">Email</option>
                    <option value="phone">Phone Number</option>
                  </select>
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
            
            {step < 3 ? (
              <button type="button" onClick={handleNext} className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition font-medium">
                Next Step
              </button>
            ) : (
              <button type="submit" disabled={mutation.isPending} className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-slate-900 font-bold rounded-lg transition shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50">
                {mutation.isPending ? 'Reporting...' : 'Submit Report'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportLost;
