import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetLink, setResetLink] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await api.post('/auth/forgot', { email: data.email });
      if (res.data.success) {
        setSuccess(true);
        
        if (res.data.resetToken) {
          const clientUrl = window.location.origin;
          setResetLink(`${clientUrl}/reset-password/${res.data.resetToken}`);
        }
        toast.success('Reset link generated!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to request reset. Verify email address.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-darkBg-dark px-4 py-12 transition-colors duration-300">
      
      <div className="w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 shadow-xl">
        
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Forgot Password</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/20 p-4 border border-emerald-200/50 dark:border-emerald-800/30 flex items-start gap-3">
              <CheckCircle className="text-emerald-500 shrink-0" size={20} />
              <div className="text-left">
                <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Reset instructions dispatched</h3>
                <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-500">
                  We have logged a stateless JWT reset link in the server console for local testing.
                </p>
              </div>
            </div>

            {resetLink && (
              <div className="bg-slate-100 dark:bg-slate-950/60 p-4 rounded-xl text-left border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Sandbox Quick Bypass Link:</span>
                <Link to={resetLink.replace(window.location.origin, '')} className="text-xs text-primary-500 break-all font-mono hover:underline">
                  {resetLink}
                </Link>
              </div>
            )}

            <Link 
              to="/login"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                    errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-800'
                  }`}
                  {...register('email', { required: 'Email address is required' })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                  <AlertCircle size={12} />
                  {errors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
            >
              {submitting ? 'Sending Request...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link 
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;
