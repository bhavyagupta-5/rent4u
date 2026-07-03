import React, { useContext, useState } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { useAuth, api } from '../context/AuthContext';
import { Sun, Moon, Shield, Lock, Bell, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const Settings = () => {
  const { darkMode, toggleTheme } = useContext(ThemeContext);
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handlePasswordChange = async (data) => {
    try {
      setSubmitting(true);
      
      
      const res = await api.put('/auth/profile', { password: data.password });
      if (res.data.success) {
        toast.success("Security password modified successfully!");
        reset();
      }
    } catch (err) {
      toast.error("Failed to modify password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      <div>
        <h2 className="text-xl font-bold">Account Settings</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Customize preferences, notifications, and security options.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {}
        <div className="md:col-span-1 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settings</h3>
          <div className="space-y-1">
            <button className="w-full text-left py-2 px-3 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-primary-500">Security & Privacy</button>
            <button className="w-full text-left py-2 px-3 rounded-lg text-xs text-slate-500 dark:text-slate-400 font-semibold hover:bg-slate-100/50 dark:hover:bg-slate-800/30">Interface theme</button>
          </div>
        </div>

        {}
        <div className="md:col-span-2 space-y-6">
          
          {}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5"><Lock size={15} className="text-primary-500" /> Change Password</h3>
            
            <form onSubmit={handleSubmit(handlePasswordChange)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full glass-input text-xs text-slate-900 dark:text-slate-100"
                  {...register('password', { required: 'Password is required', minLength: 6 })}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 justify-center px-4 py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 shadow-md shadow-primary-500/10 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5"><Sun size={15} className="text-primary-500" /> Interface Theme</h3>
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-bold">Dark Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Toggle dark/light backdrop systems</p>
              </div>
              <button 
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850"
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

          {}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-1.5"><Shield size={15} className="text-primary-500" /> Account Status</h3>
            <div className="flex items-center gap-3 text-left">
              <CheckCircle className="text-emerald-500" size={24} />
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Profile • Verified Role ({user?.role})</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Your email {user?.email} is verified on the Rent4u ledger.</p>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Settings;
