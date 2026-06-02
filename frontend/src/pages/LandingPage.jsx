import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-grow flex items-center relative overflow-hidden py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            Lost something? <br />
            <span className="bg-gradient-to-r from-indigo-500 to-sky-400 bg-clip-text text-transparent">
              AI will find it.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-4 text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10"
          >
            LostLink uses cutting-edge AI image matching and geospatial tracking to instantly connect lost items with their finders. 
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Link to="/report-lost" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-slate-900 rounded-lg font-bold text-lg shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all transform hover:scale-105">
              I Lost Something
            </Link>
            <Link to="/report-found" className="w-full sm:w-auto px-8 py-4 bg-slate-100 hover:bg-gray-700 text-slate-900 rounded-lg font-bold text-lg border border-slate-300 hover:border-gray-600 transition-all transform hover:scale-105">
              I Found Something
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats/Features Section */}
      <section className="py-20 bg-white/50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="glass p-8 rounded-2xl">
              <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Smart AI Matching</h3>
              <p className="text-slate-600">Our CLIP vision model analyzes your images and automatically suggests the highest probability matches.</p>
            </div>
            
            <div className="glass p-8 rounded-2xl">
              <div className="w-14 h-14 bg-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-sky-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Location Awareness</h3>
              <p className="text-slate-600">Interactive maps allow you to pinpoint exactly where items were lost or found for accurate radius searching.</p>
            </div>
            
            <div className="glass p-8 rounded-2xl">
              <div className="w-14 h-14 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2">Secure Claims</h3>
              <p className="text-slate-600">Anti-fraud verification questions ensure your lost belongings only end up back in your hands.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
