import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Menu, Copyright } from 'lucide-react';
import Logo from './Logo';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 bg-blue-600">
            <div className="flex justify-center w-full">
              <Logo className="h-36 w-auto" />
            </div>
            <button onClick={() => setSidebarOpen(false)} className="text-white hover:text-gray-200">
              <span className="sr-only">Close sidebar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <Sidebar />
          <div className="mt-auto p-4 text-center text-sm text-gray-500 border-t">
            <div className="flex items-center justify-center">
              <Copyright className="h-4 w-4 mr-1" />
              2025 - 340060155
            </div>
            BPS Kabupaten Buru
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="h-16 flex items-center justify-center border-b border-gray-200 bg-blue-600">
            <Logo className="h-36 w-auto" />
          </div>
          <Sidebar />
          <div className="mt-auto p-4 text-center text-sm text-gray-500 border-t">
            <div className="flex items-center justify-center">
              <Copyright className="h-4 w-4 mr-1" />
              2025 - 340060155
            </div>
            BPS Kabupaten Buru
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>
        </Header>
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;