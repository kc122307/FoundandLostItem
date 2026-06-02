import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/auth.service';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', city: '', college: '', mobile: '' 
  });
  const navigate = useNavigate();
  const loginAction = useAuthStore(state => state.login);

  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      loginAction(data.user, data.token);
      toast.success('Account created! Please check your email to verify.');
      navigate('/dashboard');
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 glass p-10 rounded-2xl">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Already have an account? <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition">Sign in</Link>
          </p>
        </div>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input
              type="text" required
              className="w-full px-4 py-3 bg-white/50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-gray-500"
              placeholder="John Doe"
              value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email address</label>
            <input
              type="email" required
              className="w-full px-4 py-3 bg-white/50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-gray-500"
              placeholder="you@example.com"
              value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password" required minLength="6"
              className="w-full px-4 py-3 bg-white/50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-gray-500"
              placeholder="••••••••"
              value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City (Required)</label>
              <input
                type="text" required
                className="w-full px-4 py-3 bg-white/50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-gray-500"
                placeholder="Mumbai"
                value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College/Work</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-white/50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-gray-500"
                placeholder="Optional"
                value={formData.college} onChange={e => setFormData({ ...formData, college: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-slate-900 bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all mt-4"
          >
            {mutation.isPending ? 'Creating...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
