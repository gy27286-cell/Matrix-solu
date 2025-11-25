import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, getSession } from '../services/storage';
import { generateBikeDescription } from '../services/geminiService';
import { Bike, BikeStatus, UserRole, PaymentMode } from '../types';
import { ChevronLeft, ChevronDown, ChevronUp, Save, Sparkles, Loader2, Camera, X, Lock } from 'lucide-react';

const Section = ({ title, isOpen, onToggle, children, isLocked = false }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
    <button 
      type="button"
      onClick={isLocked ? undefined : onToggle}
      className={`w-full p-4 flex justify-between items-center ${isLocked ? 'opacity-50 cursor-not-allowed' : 'active:bg-slate-50'}`}
    >
      <div className="flex items-center gap-2">
         {isLocked && <Lock size={14} className="text-slate-400"/>}
         <span className="font-semibold text-slate-800 text-sm">{title}</span>
      </div>
      {!isLocked && (isOpen ? <ChevronUp size={18} className="text-slate-400"/> : <ChevronDown size={18} className="text-slate-400"/>)}
    </button>
    {!isLocked && isOpen && (
      <div className="p-4 pt-0 border-t border-slate-100 mt-4 animate-slide-up">
        {children}
      </div>
    )}
  </div>
);

const BikeForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getSession();
  const isEdit = !!id;
  const isAdmin = user?.role === UserRole.OWNER;

  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);

  // Section States
  const [openSections, setOpenSections] = useState({
    photos: true,
    details: true,
    purchase: false,
    rc: false
  });

  const toggleSection = (key: string) => setOpenSections(prev => ({...prev, [key]: !prev[key as keyof typeof openSections]}));

  const [formData, setFormData] = useState<Partial<Bike>>({
    brand: '', model: '', year: new Date().getFullYear(), color: '',
    engineNumber: '', chassisNumber: '', odometer: 0,
    description: '', images: [], status: BikeStatus.AVAILABLE,
    purchasePrice: 0,
    purchasePaymentMode: PaymentMode.CASH,
    purchasedFrom: { name: '', phone: '', address: '' },
    purchaseDate: new Date().toISOString().split('T')[0],
    rcNumber: '', rcDate: '', expenses: []
  });

  useEffect(() => {
    if (isEdit && id) {
      const bike = api.bikes.get(id);
      if (bike) {
        setFormData(bike);
        // If owner editing, maybe open purchase by default?
        if (isAdmin) setOpenSections(prev => ({ ...prev, purchase: false })); 
      }
    }
  }, [id, isEdit, isAdmin]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, images: [...(prev.images || []), reader.result as string] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
  };

  const handleGenerateDescription = async () => {
    setIsGeneratingDesc(true);
    const desc = await generateBikeDescription(
      formData.brand || 'Bike',
      formData.model || 'Model',
      formData.year || 2020,
      'Good'
    );
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingDesc(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.brand || !formData.model) {
      // Basic validation UI
      alert("Brand and Model are required");
      setIsLoading(false);
      return;
    }

    const bikeData = {
      ...formData,
      id: isEdit && id ? id : `bike_${Date.now()}`,
      orgId: user?.orgId || 'org_default',
    } as Bike;

    if (isEdit) {
      api.bikes.update(bikeData);
    } else {
      api.bikes.add(bikeData);
    }

    setTimeout(() => {
      setIsLoading(false);
      navigate('/inventory');
    }, 500);
  };

  const InputGroup = ({ label, children }: any) => (
    <div className="mb-3">
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="pb-24 animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 sticky top-0 bg-[#F7F9FC] z-20 py-2">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-lg font-bold text-slate-800">{isEdit ? 'Edit Bike' : 'New Bike'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
        
        {/* PHOTOS */}
        <Section title="Photos" isOpen={openSections.photos} onToggle={() => toggleSection('photos')}>
           <div className="grid grid-cols-3 gap-2">
            {formData.images?.map((img, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                <img src={img} alt="Bike" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded-full"><X size={12}/></button>
              </div>
            ))}
            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-[#1A73E8] hover:bg-blue-50 transition-colors">
              <Camera className="text-slate-400 mb-1" size={20} />
              <span className="text-[10px] text-slate-500">Add</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </Section>

        {/* DETAILS */}
        <Section title="Bike Details" isOpen={openSections.details} onToggle={() => toggleSection('details')}>
           <div className="grid grid-cols-2 gap-3">
             <InputGroup label="Brand">
                <input required type="text" className="input-m3" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} />
             </InputGroup>
             <InputGroup label="Model">
                <input required type="text" className="input-m3" value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
             </InputGroup>
           </div>
           <div className="grid grid-cols-3 gap-3">
             <InputGroup label="Year">
                <input type="number" className="input-m3" value={formData.year} onChange={e => setFormData({...formData, year: parseInt(e.target.value)})} />
             </InputGroup>
             <InputGroup label="Color">
                <input type="text" className="input-m3" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
             </InputGroup>
             <InputGroup label="Odo (km)">
                <input type="number" className="input-m3" value={formData.odometer} onChange={e => setFormData({...formData, odometer: parseInt(e.target.value)})} />
             </InputGroup>
           </div>
           
           <div className="relative mt-2">
              <label className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1">
                Description
                <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="text-[#1A73E8] flex items-center gap-1">
                   {isGeneratingDesc ? <Loader2 size={10} className="animate-spin"/> : <Sparkles size={10} />} AI Auto
                </button>
              </label>
              <textarea 
                rows={3} 
                className="input-m3"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
           </div>
        </Section>

        {/* PURCHASE (Restricted) */}
        <Section 
          title="Purchase Info (Owner Only)" 
          isOpen={openSections.purchase} 
          onToggle={() => toggleSection('purchase')}
          isLocked={!isAdmin}
        >
          <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Price (₹)">
                <input type="number" className="input-m3" value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value)})} />
              </InputGroup>
              <InputGroup label="Mode">
                 <select className="input-m3" value={formData.purchasePaymentMode} onChange={e => setFormData({...formData, purchasePaymentMode: e.target.value as PaymentMode})}>
                   <option value={PaymentMode.CASH}>Cash</option>
                   <option value={PaymentMode.ONLINE}>Online</option>
                 </select>
              </InputGroup>
          </div>
          <InputGroup label="Seller Name">
             <input type="text" className="input-m3" value={formData.purchasedFrom?.name} onChange={e => setFormData({...formData, purchasedFrom: {...formData.purchasedFrom!, name: e.target.value}})} />
          </InputGroup>
          <div className="grid grid-cols-2 gap-3">
              <InputGroup label="Phone">
                <input type="tel" className="input-m3" value={formData.purchasedFrom?.phone} onChange={e => setFormData({...formData, purchasedFrom: {...formData.purchasedFrom!, phone: e.target.value}})} />
              </InputGroup>
              <InputGroup label="Date">
                <input type="date" className="input-m3" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} />
              </InputGroup>
          </div>
        </Section>

        {/* RC DETAILS */}
        <Section title="RC & Documents" isOpen={openSections.rc} onToggle={() => toggleSection('rc')}>
           <div className="grid grid-cols-2 gap-3">
              <InputGroup label="RC Number">
                <input type="text" className="input-m3 uppercase" value={formData.rcNumber} onChange={e => setFormData({...formData, rcNumber: e.target.value})} />
              </InputGroup>
              <InputGroup label="Registration Date">
                <input type="date" className="input-m3" value={formData.rcDate} onChange={e => setFormData({...formData, rcDate: e.target.value})} />
              </InputGroup>
           </div>
           <InputGroup label="Engine Number">
              <input type="text" className="input-m3" value={formData.engineNumber} onChange={e => setFormData({...formData, engineNumber: e.target.value})} />
           </InputGroup>
           <InputGroup label="Chassis Number">
              <input type="text" className="input-m3" value={formData.chassisNumber} onChange={e => setFormData({...formData, chassisNumber: e.target.value})} />
           </InputGroup>
        </Section>

        <div className="mt-6">
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#1A73E8] text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            {isEdit ? 'Update Bike' : 'Save Bike'}
          </button>
        </div>
        
      </form>
    </div>
  );
};

export default BikeForm;