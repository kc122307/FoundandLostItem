import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../services/notification.service';
import useNotificationStore from '../../store/notificationStore';
import useAuthStore from '../../store/authStore';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const { isAuthenticated } = useAuthStore();
  const { setNotifications } = useNotificationStore();

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getMyNotifications,
    enabled: !!isAuthenticated
  });

  useEffect(() => {
    if (notifData) {
      setNotifications(notifData.notifications, notifData.unreadCount);
    }
  }, [notifData, setNotifications]);
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-50 text-slate-900">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-200/40 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-sky-200/40 blur-[120px]"></div>
      </div>

      <Navbar />
      
      <main className="flex-grow pt-16 relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
