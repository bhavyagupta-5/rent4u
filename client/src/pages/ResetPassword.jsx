import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Lock, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await api.post(`/auth/reset/${token}`, { password: data.password });
      if (res.data.success) {
        setSuccess(true);
        toast.success('Password updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Token is invalid or has expired.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-darkBg-dark px-4 py-12 transition-colors duration-300">
      
      <div className="w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Reset Password</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Please enter your new security password.
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200/50 dark:border-emerald-800/30 flex items-start gap-3">
              <CheckCircle className="text-emerald-500 shrink-0" size={20} />
              <div className="text-left">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Security Password Saved</h3>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-500">
                  Your password has been modified. You can now log in using your updated password.
                </p>
              </div>
            </div>

            <Link 
              to="/login"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/20 transition-all"
            >
              Log In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            {}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.password ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-800'
                  }`}
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
              </div>
              {errors.password && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            {}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-800'
                  }`}
                  {...register('confirmPassword', { 
                    required: 'Confirm password is required',
                    validate: (val) => val === watch('password') || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Password'}
            </button>

          </form>
        )}

      </div>
    </div>
  );
};

export default ResetPassword;
