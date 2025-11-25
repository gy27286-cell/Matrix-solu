import React, { useState, useEffect } from 'react';
import { api, getSession } from '../services/storage';
import { CashTransaction, TransactionType, UserRole, PaymentMode } from '../types';
import { ArrowDownLeft, ArrowUpRight, Wallet, CreditCard } from 'lucide-react';

const CashFlow: React.FC = () => {
  const [transactions, setTransactions] = useState<CashTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [bankBalance, setBankBalance] = useState(0);
  const user = getSession();
  
  const [showForm, setShowForm] = useState(false);
  const [manualTx, setManualTx] = useState({ 
    type: TransactionType.IN, amount: '', description: '', paymentMode: PaymentMode.CASH 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setTransactions(api.cash.list());
    setBalance(api.cash.getBalance());
    setCashBalance(api.cash.getBalance(PaymentMode.CASH));
    setBankBalance(api.cash.getBalance(PaymentMode.ONLINE));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTx.amount || !manualTx.description) return;

    api.cash.add({
      id: `man_${Date.now()}`,
      amount: parseFloat(manualTx.amount),
      type: manualTx.type,
      category: 'ADJUSTMENT',
      description: manualTx.description,
      date: new Date().toISOString(),
      paymentMode: manualTx.paymentMode
    });

    setManualTx({ type: TransactionType.IN, amount: '', description: '', paymentMode: PaymentMode.CASH });
    setShowForm(false);
    loadData();
  };

  if (user?.role !== UserRole.OWNER) {
    return <div className="p-8 text-center text-slate-400">Restricted Access</div>;
  }

  return (
    <div className="pb-24 animate-slide-up space-y-4">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-lg font-bold text-slate-800">Cash & Reports</h2>
        <button onClick={() => setShowForm(!showForm)} className="text-[#1A73E8] text-sm font-medium">
          {showForm ? 'Cancel' : 'Add Entry'}
        </button>
      </div>

      {/* Balance Cards */}
      <div className="bg-[#1A73E8] rounded-xl p-5 text-white shadow-lg">
          <p className="text-blue-100 text-xs uppercase tracking-wide mb-1">Total Net Balance</p>
          <h1 className="text-3xl font-bold">₹{balance.toLocaleString('en-IN')}</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-100 text-green-700 rounded"><Wallet size={14}/></div>
            <p className="text-slate-500 text-[10px] uppercase font-bold">Cash</p>
          </div>
          <h3 className="text-lg font-bold text-slate-800">₹{cashBalance.toLocaleString('en-IN')}</h3>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-2">
             <div className="p-1.5 bg-blue-100 text-blue-700 rounded"><CreditCard size={14}/></div>
             <p className="text-slate-500 text-[10px] uppercase font-bold">Bank</p>
          </div>
          <h3 className="text-lg font-bold text-slate-800">₹{bankBalance.toLocaleString('en-IN')}</h3>
        </div>
      </div>

      {/* Manual Entry Form */}
      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 animate-slide-up">
          <h3 className="text-sm font-bold mb-3">Add Manual Transaction</h3>
          <form onSubmit={handleManualSubmit} className="space-y-3">
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="type" checked={manualTx.type === TransactionType.IN} onChange={() => setManualTx({...manualTx, type: TransactionType.IN})} />
                <span className="text-green-600 font-bold">IN (+)</span>
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" name="type" checked={manualTx.type === TransactionType.OUT} onChange={() => setManualTx({...manualTx, type: TransactionType.OUT})} />
                <span className="text-red-600 font-bold">OUT (-)</span>
              </label>
            </div>
            <div className="flex gap-2">
               <input type="number" placeholder="Amount" className="w-1/2 input-m3" value={manualTx.amount} onChange={e => setManualTx({...manualTx, amount: e.target.value})} />
               <select className="w-1/2 input-m3" value={manualTx.paymentMode} onChange={e => setManualTx({...manualTx, paymentMode: e.target.value as PaymentMode})}>
                 <option value={PaymentMode.CASH}>Cash</option>
                 <option value={PaymentMode.ONLINE}>Online</option>
               </select>
            </div>
            <input type="text" placeholder="Description" className="w-full input-m3" value={manualTx.description} onChange={e => setManualTx({...manualTx, description: e.target.value})} />
            <button type="submit" className="w-full bg-slate-800 text-white py-2.5 rounded-lg text-sm font-medium">Save Record</button>
          </form>
        </div>
      )}

      {/* Ledger */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-3 border-b border-slate-50 bg-slate-50/50 text-xs font-bold text-slate-500 uppercase">Recent Activity</div>
        <div className="divide-y divide-slate-50">
          {transactions.map(tx => (
            <div key={tx.id} className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-full ${tx.type === TransactionType.IN ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {tx.type === TransactionType.IN ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 line-clamp-1">{tx.description}</p>
                  <p className="text-[10px] text-slate-400">{new Date(tx.date).toLocaleDateString('en-IN')} • {tx.paymentMode}</p>
                </div>
              </div>
              <span className={`text-sm font-bold whitespace-nowrap ${tx.type === TransactionType.IN ? 'text-green-600' : 'text-slate-800'}`}>
                {tx.type === TransactionType.IN ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CashFlow;