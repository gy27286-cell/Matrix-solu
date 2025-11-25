import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, getSession } from '../services/storage';
import { Bike, BikeStatus, UserRole, PaymentMode } from '../types';
import { ChevronLeft, Edit, Trash2, Wrench, CheckCircle, IndianRupee, Banknote, User as UserIcon, Lock, ChevronDown, ChevronUp } from 'lucide-react';

const Collapsible = ({ title, children, defaultOpen = false, icon: Icon, restricted = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  if (restricted) return null;
  
  return (
    <div className="bg-white border-t border-slate-100 last:border-b">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center p-4 text-left"
      >
        <div className="flex items-center gap-3">
          {Icon && <div className="p-1.5 bg-slate-50 rounded text-slate-500"><Icon size={16}/></div>}
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-slate-400"/> : <ChevronDown size={16} className="text-slate-400"/>}
      </button>
      {isOpen && <div className="px-4 pb-4 animate-slide-up">{children}</div>}
    </div>
  );
};

const BikeDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getSession();
  const isAdmin = user?.role === UserRole.OWNER;
  
  const [bike, setBike] = useState<Bike | null>(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);
  
  const [expenseData, setExpenseData] = useState({ amount: '', description: '', mechanic: '', paymentMode: PaymentMode.CASH });
  const [sellData, setSellData] = useState({ price: '', customerName: '', phone: '', address: '', paymentMode: PaymentMode.CASH });

  useEffect(() => {
    if (id) setBike(api.bikes.get(id) || null);
  }, [id]);

  if (!bike) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  const totalExpenses = bike.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalCost = bike.purchasePrice + totalExpenses;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData.amount || !expenseData.description) return;
    api.bikes.addExpense(bike.id, {
      id: `exp_${Date.now()}`, bikeId: bike.id, amount: parseFloat(expenseData.amount),
      description: expenseData.description, mechanicName: expenseData.mechanic,
      date: new Date().toISOString(), paymentMode: expenseData.paymentMode
    });
    setExpenseData({ amount: '', description: '', mechanic: '', paymentMode: PaymentMode.CASH });
    setShowExpenseForm(false);
    setBike(api.bikes.get(bike.id) || null);
  };

  const handleMarkSold = (e: React.FormEvent) => {
    e.preventDefault();
    api.bikes.markSold(bike.id, {
      id: `sale_${Date.now()}`, bikeId: bike.id, customerId: `cust_${Date.now()}`,
      customer: { name: sellData.customerName, phone: sellData.phone, address: sellData.address },
      sellingPrice: parseFloat(sellData.price), soldByUserId: user?.id || 'unknown',
      date: new Date().toISOString(), paymentMode: sellData.paymentMode
    });
    setShowSellForm(false);
    setBike(api.bikes.get(bike.id) || null);
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this bike permanently?")) {
      api.bikes.delete(bike.id);
      navigate('/inventory');
    }
  };

  const SpecItem = ({ label, value }: any) => (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );

  return (
    <div className="pb-24 animate-slide-up bg-[#F7F9FC]">
      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 bg-white sticky top-0 z-20 shadow-sm">
        <button onClick={() => navigate('/inventory')} className="text-slate-600"><ChevronLeft size={24} /></button>
        <div className="flex gap-4">
           {isAdmin && <button onClick={() => navigate(`/bike/${bike.id}/edit`)} className="text-slate-600"><Edit size={20} /></button>}
           {isAdmin && <button onClick={handleDelete} className="text-red-500"><Trash2 size={20} /></button>}
        </div>
      </div>

      {/* Image Carousel (Simplified) */}
      <div className="bg-white mb-2">
        <div className="aspect-video bg-slate-100 relative overflow-hidden">
          {bike.images[0] ? (
            <img src={bike.images[0]} alt="Bike" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">No Image</div>
          )}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded uppercase backdrop-blur-sm">
            {bike.status}
          </div>
        </div>
        <div className="p-4">
          <h1 className="text-xl font-bold text-slate-900">{bike.year} {bike.brand} {bike.model}</h1>
          <p className="text-sm text-slate-500 mt-1">{bike.description}</p>
        </div>
      </div>

      {/* Action Buttons */}
      {bike.status !== BikeStatus.SOLD && (
        <div className="px-4 mb-4 flex gap-3">
          <button onClick={() => setShowExpenseForm(true)} className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
            <Wrench size={16} /> Add Expense
          </button>
          <button onClick={() => setShowSellForm(true)} className="flex-1 py-2.5 bg-[#34A853] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-sm">
            <CheckCircle size={16} /> Mark Sold
          </button>
        </div>
      )}

      {/* Specs Panel */}
      <div className="bg-white mb-2 px-4 py-2">
        <SpecItem label="Odometer" value={`${bike.odometer} km`} />
        <SpecItem label="RC Number" value={bike.rcNumber} />
        <SpecItem label="Color" value={bike.color} />
        <SpecItem label="Engine No." value={bike.engineNumber} />
      </div>

      {/* Purchase & Financials (Admin Only) */}
      <Collapsible title="Purchase & Profit" icon={Banknote} restricted={!isAdmin}>
         <div className="bg-slate-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Bought From</span>
              <span className="font-medium">{bike.purchasedFrom?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Purchase Price</span>
              <span className="font-medium">₹{bike.purchasePrice.toLocaleString('en-IN')}</span>
            </div>
             <div className="flex justify-between">
              <span className="text-slate-500">Total Repairs</span>
              <span className="font-medium text-red-500">+ ₹{totalExpenses.toLocaleString('en-IN')}</span>
            </div>
             <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
              <span>Total Cost</span>
              <span>₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
            {bike.status === BikeStatus.SOLD && bike.sale && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="flex justify-between text-green-700 font-bold">
                  <span>Sold Price</span>
                  <span>₹{bike.sale.sellingPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#1A73E8] font-bold mt-1">
                  <span>Profit</span>
                  <span>₹{(bike.sale.sellingPrice - totalCost).toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
         </div>
      </Collapsible>

      {/* Expenses History */}
      <Collapsible title={`Repairs (${bike.expenses.length})`} icon={Wrench}>
         {bike.expenses.length === 0 ? (
           <div className="text-center text-slate-400 text-xs py-2">No repairs added</div>
         ) : (
           <div className="space-y-3">
             {bike.expenses.map(e => (
               <div key={e.id} className="flex justify-between text-sm border-b border-slate-50 pb-2 last:border-0">
                 <div>
                   <p className="font-medium text-slate-700">{e.description}</p>
                   <p className="text-xs text-slate-400">{new Date(e.date).toLocaleDateString()}</p>
                 </div>
                 <span className="font-medium text-orange-600">-₹{e.amount}</span>
               </div>
             ))}
           </div>
         )}
      </Collapsible>
      
      {/* Sold Info */}
      {bike.status === BikeStatus.SOLD && bike.sale && (
        <Collapsible title="Customer Info" icon={UserIcon} defaultOpen>
          <div className="text-sm space-y-1">
             <p><span className="text-slate-500">Name:</span> {bike.sale.customer.name}</p>
             <p><span className="text-slate-500">Phone:</span> {bike.sale.customer.phone}</p>
          </div>
        </Collapsible>
      )}

      {/* Modals */}
      {showExpenseForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs animate-slide-up">
            <h3 className="font-bold mb-3">Add Expense</h3>
            <div className="space-y-3">
              <input type="number" placeholder="Amount" className="input-m3" value={expenseData.amount} onChange={e => setExpenseData({...expenseData, amount: e.target.value})} />
              <input type="text" placeholder="Description" className="input-m3" value={expenseData.description} onChange={e => setExpenseData({...expenseData, description: e.target.value})} />
              <div className="flex gap-2">
                <button onClick={() => setShowExpenseForm(false)} className="flex-1 py-2 text-slate-500">Cancel</button>
                <button onClick={handleAddExpense} className="flex-1 py-2 bg-[#1A73E8] text-white rounded font-medium">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSellForm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs animate-slide-up">
            <h3 className="font-bold mb-3">Sell Bike</h3>
            <div className="space-y-3">
               <input type="number" placeholder="Sold Price (₹)" className="input-m3" value={sellData.price} onChange={e => setSellData({...sellData, price: e.target.value})} />
               <input type="text" placeholder="Customer Name" className="input-m3" value={sellData.customerName} onChange={e => setSellData({...sellData, customerName: e.target.value})} />
               <input type="tel" placeholder="Phone" className="input-m3" value={sellData.phone} onChange={e => setSellData({...sellData, phone: e.target.value})} />
               <div className="flex gap-2">
                <button onClick={() => setShowSellForm(false)} className="flex-1 py-2 text-slate-500">Cancel</button>
                <button onClick={handleMarkSold} className="flex-1 py-2 bg-[#34A853] text-white rounded font-medium">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BikeDetail;