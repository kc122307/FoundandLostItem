const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-sky-500 bg-clip-text text-transparent">
              LostLink
            </span>
            <p className="text-slate-500 text-sm mt-2">
              Reuniting people with their belongings through AI.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-slate-500 hover:text-indigo-400 transition">About</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 transition">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 transition">Terms</a>
            <a href="#" className="text-slate-500 hover:text-indigo-400 transition">Contact</a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-600 text-sm">
          &copy; {new Date().getFullYear()} LostLink. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
