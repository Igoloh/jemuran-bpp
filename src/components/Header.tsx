import React, { ReactNode, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import UserMenu from './UserMenu';

interface HeaderProps {
  children?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ children }) => {
  const { activityLogs } = useAppContext();
  const [showNotifications, setShowNotifications] = useState(false);

  // Get today's notifications
  const todayNotifications = activityLogs.filter(log => {
    const today = new Date();
    const logDate = new Date(log.created_at || '');
    return today.getDate() === logDate.getDate() &&
           today.getMonth() === logDate.getMonth() &&
           today.getFullYear() === logDate.getFullYear();
  });

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          {children}
          <h1 className="ml-2 text-xl font-semibold text-gray-900">Manajemen Penggunaan Anggaran</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-6 w-6" />
              {todayNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  {todayNotifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900">Notifikasi Hari Ini</h3>
                  <div className="mt-2 divide-y divide-gray-200">
                    {todayNotifications.length > 0 ? (
                      todayNotifications.map((log) => (
                        <div key={log.id} className="py-3">
                          <p className="text-sm text-gray-600">
                            {log.type === 'create' ? 'Penambahan' :
                             log.type === 'update' ? 'Perubahan' :
                             'Penghapusan'} kegiatan: {(log.details as any).activity_title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(log.created_at || '').toLocaleTimeString('id-ID')}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="py-3 text-sm text-gray-500">
                        Tidak ada notifikasi baru
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;