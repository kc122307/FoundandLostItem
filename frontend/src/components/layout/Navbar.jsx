import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import useNotificationStore from '../../store/notificationStore';
import { useState } from 'react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Explore', path: '/explore' },
    { name: 'Report Lost', path: '/report-lost' },
    { name: 'Report Found', path: '/report-found' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed w-full z-50 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
                LostLink
              </span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/notifications" className="relative p-2 text-slate-600 hover:text-slate-900 transition">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                    </span>
                  )}
                </Link>

                <Link to="/chat" className="p-2 text-slate-600 hover:text-slate-900 transition">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </Link>

                <div className="relative group">
                  <button className="flex items-center space-x-2 focus:outline-none">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-slate-900 font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-2 glass rounded-md shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/dashboard" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Dashboard</Link>
                    <Link to="/profile" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Profile</Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-rose-400 hover:bg-slate-100">Admin Panel</Link>
                    )}
                    <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100">Sign out</button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login" className="text-slate-700 hover:text-slate-900 px-3 py-2 text-sm font-medium transition">Log in</Link>
                <Link to="/register" className="bg-indigo-600 hover:bg-indigo-700 text-slate-900 px-4 py-2 rounded-md text-sm font-medium shadow-[0_0_15px_rgba(79,70,229,0.5)] transition">Sign up</Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-slate-900">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block px-3 py-2 text-base font-medium text-slate-700">Log in</Link>
                <Link to="/register" className="block px-3 py-2 text-base font-medium text-indigo-400">Sign up</Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="block px-3 py-2 text-base font-medium text-slate-700">Dashboard</Link>
                <Link to="/notifications" className="block px-3 py-2 text-base font-medium text-slate-700">Notifications ({unreadCount})</Link>
                <Link to="/chat" className="block px-3 py-2 text-base font-medium text-slate-700">Messages</Link>
                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-base font-medium text-slate-700">Sign out</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
