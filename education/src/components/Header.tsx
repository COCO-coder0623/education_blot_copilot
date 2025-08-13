import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, BookOpen, Target, User, BarChart3, Upload } from 'lucide-react';

interface User {
  id: number;
  name: string;
  avatar: string;
  grade: string;
  subject: string;
}

interface HeaderProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: BarChart3, label: '学习概览' },
    { path: '/upload', icon: Upload, label: '上传作业' },
    { path: '/errorbook', icon: BookOpen, label: '错题本' },
    { path: '/practice', icon: Target, label: '练习推荐' },
    { path: '/profile', icon: User, label: '个人中心' }
  ];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">智能作业助手</h1>
              <p className="text-sm text-gray-500">AI驱动的学习辅导平台</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.grade} · {user.subject}</p>
            </div>
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 rounded-full border-2 border-blue-200"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;