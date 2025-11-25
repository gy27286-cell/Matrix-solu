import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getSession, logout } from './services/storage';
import { UserRole } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import BikeForm from './components/BikeForm';
import BikeDetail from './components/BikeDetail';
import CashFlow from './components/CashFlow';
import Profile from './components/Profile';
import { ToastProvider } from './components/Toast';
import { Home, Layers, DollarSign, LogOut, Plus, Menu as MenuIcon, User as UserIcon } from 'lucide-react';

interface LayoutProps {
  children?: React.ReactNode;
}

const PrivateRoute = ({ children }: LayoutProps) => {
  const session = getSession();
  return session ? <>{children}</> : <Navigate to="/login" />;
};

const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getSession();

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItemClass = (active: boolean) => 
    `flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-[#1A73E8]' : 'text-slate-400'}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col md:flex-row">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 z-30">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-[#1A73E8] flex items-center gap-2">
            MotoDesk
          </h1>
          <p className="text-xs text-slate-400 mt-1">Dealer Management System</p>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => navigate('/')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/') ? 'bg-blue-50 text-[#1A73E8]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Home size={20} /> Dashboard
          </button>
          <button onClick={() => navigate('/inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/inventory') ? 'bg-blue-50 text-[#1A73E8]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Layers size={20} /> Inventory
          </button>
          <button onClick={() => navigate('/bike/new')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-slate-600 hover:bg-slate-50`}>
            <Plus size={20} /> Add Bike
          </button>
          <button onClick={() => navigate('/cashflow')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive('/cashflow') ? 'bg-blue-50 text-[#1A73E8]' : 'text-slate-600 hover:bg-slate-50'}`}>
            <DollarSign size={20} /> Cash & Reports
          </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
           <button onClick={() => navigate('/profile')} className="flex items-center gap-3 mb-4 px-2 w-full hover:bg-slate-50 rounded-lg py-2 transition-colors">
             <div className="bg-slate-100 p-2 rounded-full"><UserIcon size={16} className="text-slate-500"/></div>
             <div className="overflow-hidden text-left">
               <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
               <p className="text-[10px] text-slate-500 uppercase">{user?.role}</p>
             </div>
           </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-sm border-b border-slate-100">
        <h1 className="text-lg font-bold text-[#1A73E8]">MotoDesk</h1>
        <div className="flex items-center gap-3">
          <div className="text-xs text-right hidden sm:block">
            <div className="font-semibold text-slate-700">{user?.name}</div>
            <div className="text-slate-400">{user?.orgId}</div>
          </div>
           {/* Mobile Menu / Profile Link */}
           <button onClick={() => navigate('/profile')} className="text-slate-400 hover:text-[#1A73E8]">
             <UserIcon size={24} />
           </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen pb-24 md:pb-8 p-3 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bottom-nav-custom">
        <button onClick={() => navigate('/')} className={navItemClass(isActive('/'))}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Home</span>
        </button>
        
        <button onClick={() => navigate('/inventory')} className={navItemClass(isActive('/inventory'))}>
          <Layers size={22} strokeWidth={isActive('/inventory') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Inventory</span>
        </button>

        {/* Floating Action Button (Center) */}
        <div className="fab-container">
          <button onClick={() => navigate('/bike/new')} className="fab-button" aria-label="Add Bike">
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>

        <button onClick={() => navigate('/cashflow')} className={navItemClass(isActive('/cashflow'))}>
          <DollarSign size={22} strokeWidth={isActive('/cashflow') ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">Cash</span>
        </button>

        <button onClick={() => navigate('/profile')} className={navItemClass(isActive('/profile'))}>
           <UserIcon size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
           <span className="text-[10px] font-medium mt-1">Profile</span>
        </button>
      </div>

    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
          <Route path="/inventory" element={<PrivateRoute><Layout><Inventory /></Layout></PrivateRoute>} />
          <Route path="/bike/new" element={<PrivateRoute><Layout><BikeForm /></Layout></PrivateRoute>} />
          <Route path="/bike/:id" element={<PrivateRoute><Layout><BikeDetail /></Layout></PrivateRoute>} />
          <Route path="/bike/:id/edit" element={<PrivateRoute><Layout><BikeForm /></Layout></PrivateRoute>} />
          <Route path="/cashflow" element={<PrivateRoute><Layout><CashFlow /></Layout></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;