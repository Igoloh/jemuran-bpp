import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Database, HelpCircle } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Program', path: '/programs', icon: <FileText className="h-5 w-5" /> },
    { name: 'Kode Anggaran', path: '/budget-codes', icon: <Database className="h-5 w-5" /> },
    { name: 'FAQ', path: '/faq', icon: <HelpCircle className="h-5 w-5" /> }
  ];

  return (
    <div className="flex flex-col flex-grow overflow-y-auto">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;