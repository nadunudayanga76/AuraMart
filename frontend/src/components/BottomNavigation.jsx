import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiShoppingCart, FiUser } from 'react-icons/fi';

const BottomNavigation = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/', icon: <FiHome size={22} /> },
    { name: 'Categories', path: '/shop', icon: <FiGrid size={22} /> },
    { name: 'Cart', path: '/cart', icon: <FiShoppingCart size={22} /> },
    { name: 'Profile', path: '/profile', icon: <FiUser size={22} /> },
  ];

  return (
    <>
      {/* Spacer to prevent content from hiding behind the fixed navbar on mobile */}
      <div className="md:hidden h-[60px] w-full"></div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-5px_20px_-15px_rgba(0,0,0,0.1)] z-50 pb-safe">
      <div className="flex justify-around items-center h-[60px]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
    </>
  );
};

export default BottomNavigation;
