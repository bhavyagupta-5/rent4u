import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: signup } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await signup(data.name, data.email, data.password, data.phone, data.role);
      if (res.success) {
        toast.success(`Account registered! Welcome, ${res.user.name}.`);
        if (res.user.role === 'Owner') navigate('/owner');
        else navigate('/tenant');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-darkBg-dark px-4 py-12 transition-colors duration-300">
      
      <div className="absolute top-1/2 left-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary-400 to-indigo-400 opacity-20 blur-3xl dark:from-primary-600 dark:to-indigo-500 dark:opacity-20"></div>

      <div className="w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md p-8 shadow-xl">
        
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-indigo-500 shadow-md mb-4">
            <span className="text-xl font-extrabold text-white">R</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create a new account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400">
              Sign in
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User size={16} />
              </span>
              <input
                type="text"
                placeholder="Peter Parker"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-800'
                }`}
                {...register('name', { required: 'Full name is required' })}
              />
            </div>
            {errors.name && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {errors.name.message}
              </p>
            )}
          </div>

          {}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                placeholder="peter@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-800'
                }`}
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Please enter a valid email address' }
                })}
              />
            </div>
            {errors.email && (
              <p className="mt-1 flex items-center gap-1 text-xs text-red-500">
                <AlertCircle size={12} />
                {errors.email.message}
              </p>
            )}
          </div>

          {}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone size={16} />
              </span>
              <input
                type="tel"
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-primary-500 focus:ring-primary-200 dark:border-slate-800 dark:focus:ring-primary-950 transition-all"
                {...register('phone')}
              />
            </div>
          </div>

          {}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                <input
                  type="radio"
                  value="Tenant"
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                  defaultChecked
                  {...register('role')}
                />
                <span className="text-sm font-medium">Tenant</span>
              </label>
              <label className="flex items-center justify-center p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850 transition-all">
                <input
                  type="radio"
                  value="Owner"
                  className="mr-2 text-primary-600 focus:ring-primary-500"
                  {...register('role')}
                />
                <span className="text-sm font-medium">Owner</span>
              </label>
            </div>
          </div>

          {}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
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
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50 mt-6"
          >
            {submitting ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                Register Account
                <ArrowRight size={16} />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default Register;
