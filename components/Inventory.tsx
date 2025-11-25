import React, { useState, useEffect } from 'react';
import { api } from '../services/storage';
import { Bike, BikeStatus } from '../types';
import { Search, Filter, LayoutGrid, List as ListIcon, FileImage } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Inventory: React.FC = () => {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<Bike[]>([]);
  const [filter, setFilter] = useState<BikeStatus | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const navigate = useNavigate();

  useEffect(() => {
    const data = api.bikes.list();
    setBikes(data);
    setFilteredBikes(data);
  }, []);

  useEffect(() => {
    let result = bikes;
    if (filter !== 'ALL') {
      result = result.filter(b => b.status === filter);
    }
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(b => 
        b.brand.toLowerCase().includes(lower) || 
        b.model.toLowerCase().includes(lower) || 
        b.rcNumber.toLowerCase().includes(lower)
      );
    }
    setFilteredBikes(result);
  }, [filter, search, bikes]);

  const getStatusColor = (status: BikeStatus) => {
    switch (status) {
      case BikeStatus.AVAILABLE: return 'bg-[#34A853] text-white'; // Green
      case BikeStatus.SOLD: return 'bg-[#1A73E8] text-white'; // Blue
      case BikeStatus.UNDER_REPAIR: return 'bg-orange-500 text-white';
      case BikeStatus.RESERVED: return 'bg-purple-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-4 pb-20 animate-slide-up">
      {/* Sticky Header with Search */}
      <div className="sticky top-0 bg-[#F7F9FC] pt-1 pb-3 z-20 space-y-3">
         <div className="flex justify-between items-center px-1">
           <h2 className="text-lg font-bold text-slate-800">Inventory ({filteredBikes.length})</h2>
           <div className="flex gap-2">
             <button onClick={() => setViewMode('LIST')} className={`p-2 rounded-lg ${viewMode === 'LIST' ? 'bg-white shadow-sm text-[#1A73E8]' : 'text-slate-400'}`}>
               <ListIcon size={18} />
             </button>
             <button onClick={() => setViewMode('GRID')} className={`p-2 rounded-lg ${viewMode === 'GRID' ? 'bg-white shadow-sm text-[#1A73E8]' : 'text-slate-400'}`}>
               <LayoutGrid size={18} />
             </button>
           </div>
         </div>

         <div className="flex gap-2">
            <div className="flex-1 relative shadow-sm">
              <Search className="absolute left-3 top-3 text-slate-400 h-4 w-4" />
              <input 
                type="text" 
                placeholder="Search brand, model, RC..." 
                className="input-m3 pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                className="h-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
              >
                <option value="ALL">All</option>
                <option value={BikeStatus.AVAILABLE}>Avl</option>
                <option value={BikeStatus.SOLD}>Sold</option>
                <option value={BikeStatus.UNDER_REPAIR}>Fix</option>
              </select>
              <Filter className="absolute right-2 top-2.5 text-slate-400 h-3 w-3 pointer-events-none" />
            </div>
         </div>
      </div>

      {/* Grid / List View */}
      <div className={viewMode === 'GRID' ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
        {filteredBikes.map(bike => (
          <div 
            key={bike.id} 
            onClick={() => navigate(`/bike/${bike.id}`)}
            className={`bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden active:scale-[0.99] transition-transform ${viewMode === 'LIST' ? 'flex h-24' : 'flex flex-col'}`}
          >
            {/* Thumbnail */}
            <div className={`bg-slate-100 relative ${viewMode === 'LIST' ? 'w-24 h-full' : 'w-full h-32'}`}>
              {bike.images.length > 0 ? (
                <img src={bike.images[0]} alt={bike.model} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <FileImage size={24} />
                </div>
              )}
              {/* Status Tag */}
              <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(bike.status)}`}>
                {bike.status === 'AVAILABLE' ? 'Stock' : bike.status.substring(0,4)}
              </div>
            </div>
            
            {/* Details */}
            <div className="p-3 flex-1 flex flex-col justify-center min-w-0">
              <div className="flex justify-between items-start">
                 <h3 className="font-bold text-sm text-slate-800 truncate w-full">{bike.brand} {bike.model}</h3>
              </div>
              <p className="text-xs text-slate-500">{bike.year} • {bike.odometer}km</p>
              
              <div className="mt-2 flex justify-between items-end">
                <span className="text-[10px] text-slate-400 font-mono tracking-wide">{bike.rcNumber}</span>
                {bike.status === BikeStatus.SOLD && bike.sale ? (
                   <span className="text-xs font-bold text-[#1A73E8]">Sold: ₹{(bike.sale.sellingPrice/1000).toFixed(0)}k</span>
                ) : (
                   /* Optional: Show expected price if available, currently just placeholder or hidden */
                   <span className="text-xs font-medium text-slate-400">View</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredBikes.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-sm">
            No results found.
          </div>
      )}
    </div>
  );
};

export default Inventory;