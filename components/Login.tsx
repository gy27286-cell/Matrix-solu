import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, signup } from '../services/storage';
import { Bike, PlayCircle, UserPlus, LogIn } from 'lucide-react';

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        login(email, password);
      } else {
        if (!name || !orgName) {
           setError("Name and Dealership Name are required");
           return;
        }
        signup(email, password, name, orgName);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    }
  };

  const handleDemo = () => {
    login('demo@motodesk.com', 'demo');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 p-8 text-center">
           <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
             <Bike className="text-white w-8 h-8" />
           </div>
           <h1 className="text-2xl font-bold text-white">MotoDesk</h1>
           <p className="text-blue-100 mt-2">Dealer Management System</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100">
          <button 
            className={`flex-1 py-4 font-medium text-sm transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Sign In
          </button>
          <button 
            className={`flex-1 py-4 font-medium text-sm transition-colors ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required={!isLogin}
                    className="input-m3"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Dealership Name</label>
                  <input
                    type="text"
                    required={!isLogin}
                    className="input-m3"
                    placeholder="Super Bikes Motors"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
              <input
                type="email"
                required
                className="input-m3"
                placeholder="dealer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
              <input
                type="password"
                required
                className="input-m3"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 mt-2"
            >
              {isLogin ? <LogIn size={18} /> : <UserPlus size={18} />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Demo Section */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400 mb-3">Just exploring?</p>
            <button
              onClick={handleDemo}
              className="w-full bg-slate-100 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-200 transition-colors border border-slate-200 flex items-center justify-center gap-2"
            >
              <PlayCircle size={18} className="text-orange-500" />
              Try Demo Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;