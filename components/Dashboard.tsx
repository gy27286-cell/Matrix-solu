import React, { useEffect, useState } from 'react';
import { api, getSession } from '../services/storage';
import { Bike, BikeStatus, UserRole } from '../types';
import { Wallet, TrendingUp, Wrench, Package, ArrowRight, Bike as BikeIcon, Plus, User, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [cashInHand, setCashInHand] = useState(0);
  const user = getSession();
  const navigate = useNavigate();
  const isAdmin = user?.role === UserRole.OWNER;

  useEffect(() => {
    setBikes(api.bikes.list());
    setCashInHand(api.cash.getBalance());
  }, []);

  const stats = {
    totalInventory: bikes.filter(b => b.status === BikeStatus.AVAILABLE || b.status === BikeStatus.RESERVED).length,
    soldThisMonth: bikes.filter(b => b.status === BikeStatus.SOLD).length,
    underRepair: bikes.filter(b => b.status === BikeStatus.UNDER_REPAIR).length,
    profit: bikes.reduce((acc, bike) => {
      if (bike.status === BikeStatus.SOLD && bike.sale) {
        const totalCost = bike.purchasePrice + bike.expenses.reduce((sum, e) => sum + e.amount, 0);
        return acc + (bike.sale.sellingPrice - totalCost);
      }
      return acc;
    }, 0)
  };

  const StatCard = ({ icon: Icon, label, value, colorClass, visible = true }: any) => {
    if (!visible) return null;
    return (
      <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 flex flex-col justify-center h-24 relative overflow-hidden">
        <div className={`absolute top-2 right-2 p-1.5 rounded-full opacity-20 ${colorClass}`}>
          <Icon size={16} />
        </div>
        <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</div>
        <div className={`text-2xl font-bold ${colorClass.replace('bg-', 'text-').split(' ')[0]}`}>
          {value}
        </div>
      </div>
    );
  };

  const QuickAction = ({ label, icon: Icon, onClick, color }: any) => (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border shadow-sm active:scale-95 transition-transform whitespace-nowrap ${color}`}
    >
      <Icon size={14} /> {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-xs text-slate-500">Welcome, {user?.name}</p>
        </div>
        <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">
           {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Stats Grid (2 Cols) */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard 
          icon={Package} 
          label="Stock" 
          value={stats.totalInventory} 
          colorClass="bg-blue-600 text-blue-600" 
        />
        <StatCard 
          icon={TrendingUp} 
          label="Sold" 
          value={stats.soldThisMonth} 
          colorClass="bg-green-600 text-green-600" 
        />
        
        {/* Owner Only Stats */}
        {isAdmin ? (
          <>
            <StatCard 
              icon={Wallet} 
              label="Cash" 
              value={`₹${(cashInHand/1000).toFixed(1)}k`} 
              colorClass="bg-purple-600 text-purple-600" 
            />
            <StatCard 
              icon={DollarSign} 
              label="Profit" 
              value={`₹${(stats.profit/1000).toFixed(1)}k`} 
              colorClass="bg-emerald-600 text-emerald-600" 
            />
          </>
        ) : (
          <>
            <StatCard 
               icon={Wrench} 
               label="Repair" 
               value={stats.underRepair} 
               colorClass="bg-orange-500 text-orange-500" 
            />
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col justify-center h-24">
              <span className="text-xs text-slate-400 uppercase">Restricted</span>
              <span className="text-sm text-slate-300 font-medium">Manager View</span>
            </div>
          </>
        )}
      </div>

      {/* Quick Actions Scroll View */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3 ml-1">Quick Actions</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar px-1">
          <QuickAction 
            label="Add Bike" 
            icon={Plus} 
            onClick={() => navigate('/bike/new')} 
            color="bg-blue-50 text-blue-700 border-blue-100" 
          />
          <QuickAction 
            label="View Stock" 
            icon={Package} 
            onClick={() => navigate('/inventory')} 
            color="bg-white text-slate-700 border-slate-200" 
          />
          <QuickAction 
            label="Cash In/Out" 
            icon={DollarSign} 
            onClick={() => navigate('/cashflow')} 
            color="bg-white text-slate-700 border-slate-200" 
          />
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-semibold text-slate-700">Recent Arrivals</h3>
          <button onClick={() => navigate('/inventory')} className="text-[#1A73E8] text-xs font-medium flex items-center">
            View All <ArrowRight size={12} className="ml-1" />
          </button>
        </div>
        <div className="divide-y divide-slate-50">
          {bikes.slice(0, 4).map(bike => (
            <div key={bike.id} className="p-3 flex items-center gap-3 active:bg-slate-50 transition-colors" onClick={() => navigate(`/bike/${bike.id}`)}>
              <div className="h-10 w-10 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-100">
                 {bike.images[0] ? <img src={bike.images[0]} alt="" className="h-full w-full object-cover" /> : <BikeIcon size={18} className="m-auto mt-2.5 text-slate-300" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                   <p className="font-semibold text-sm text-slate-800 truncate pr-2">{bike.model}</p>
                   <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${bike.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                     {bike.status === 'AVAILABLE' ? 'AVL' : bike.status.substring(0,4)}
                   </span>
                </div>
                <p className="text-xs text-slate-500 truncate">{bike.year} • {bike.brand}</p>
              </div>
            </div>
          ))}
          {bikes.length === 0 && <div className="p-6 text-center text-xs text-slate-400">Inventory is empty.</div>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;