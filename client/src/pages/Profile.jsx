import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { User, Phone, MapPin, DollarSign, Calendar, FileText, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../context/AuthContext';

const Profile = () => {
  const { user, tenantProfile, updateProfile, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [idUploaded, setIdUploaded] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const handleVerify = async () => {
    if (!idUploaded) {
      toast.error("Please upload a valid mock government-issued ID card photo.");
      return;
    }
    try {
      setVerifying(true);
      const res = await api.post('/auth/verify');
      if (res.data.success) {
        toast.success("Identity verified successfully!");
        if (refreshUser) await refreshUser();
      }
    } catch (err) {
      toast.error("Failed to verify identity.");
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('phone', user.phone || '');
      setValue('avatar', user.avatar || '');
    }
    if (tenantProfile) {
      setValue('preferredLocation', tenantProfile.preferredLocation);
      setValue('budgetMin', tenantProfile.budgetMin);
      setValue('budgetMax', tenantProfile.budgetMax);
      setValue('moveInDate', tenantProfile.moveInDate ? new Date(tenantProfile.moveInDate).toISOString().split('T')[0] : '');
      setValue('occupation', tenantProfile.occupation || '');
      setValue('gender', tenantProfile.gender || 'Prefer Not to Say');
      setValue('smoking', tenantProfile.smoking || 'No');
      setValue('pets', tenantProfile.pets || 'No');
      setValue('foodPreference', tenantProfile.foodPreference || 'Any');
      setValue('preferredBedrooms', tenantProfile.preferredBedrooms || 'Any');
      setValue('requiredAmenities', tenantProfile.requiredAmenities || []);
      setValue('about', tenantProfile.about || '');
    }
  }, [user, tenantProfile]);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await updateProfile(data);
      if (res.success) {
        toast.success('Profile details saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save profile updates.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      <div>
        <h2 className="text-xl font-bold">Edit Profile</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal info and matchmaking questionnaire settings.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        
        {}
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><User size={15} className="text-primary-500" /> General Info</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <input
                type="text"
                className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                {...register('name', { required: 'Name is required' })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
              <input
                type="text"
                className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                {...register('phone')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Avatar Image URL</label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
              {...register('avatar')}
            />
          </div>
        </div>

        {}
        {user?.role === 'Tenant' && (
          <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-6">
            <h3 className="text-sm font-bold flex items-center gap-1.5"><MapPin size={15} className="text-primary-500" /> Tenant Match Criteria</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preferred Location</label>
                <input
                  type="text"
                  placeholder="e.g. Astoria, Queens"
                  className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                  {...register('preferredLocation', { required: 'Location is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Desired Move-in Date</label>
                <input
                  type="date"
                  className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                  {...register('moveInDate', { required: 'Move in date is required' })}
                />
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Min Monthly Rent (₹)</label>
                <input
                  type="number"
                  className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                  {...register('budgetMin', { required: 'Min budget is required' })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Max Monthly Rent (₹)</label>
                <input
                  type="number"
                  className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                  {...register('budgetMax', { required: 'Max budget is required' })}
                />
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Engineer"
                  className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                  {...register('occupation')}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                <select className="w-full glass-input text-sm bg-white dark:bg-slate-950" {...register('gender')}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer Not to Say">Prefer Not to Say</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Food preference</label>
                <select className="w-full glass-input text-sm bg-white dark:bg-slate-950" {...register('foodPreference')}>
                  <option value="Any">Any food</option>
                  <option value="Veg">Vegetarian only</option>
                  <option value="Non-Veg">Non-vegetarian</option>
                </select>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Smoking</label>
                <select className="w-full glass-input text-sm bg-white dark:bg-slate-950" {...register('smoking')}>
                  <option value="No">Non-smoker</option>
                  <option value="Yes">Smoker</option>
                  <option value="Outside Only">Outside Only</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pets</label>
                <select className="w-full glass-input text-sm bg-white dark:bg-slate-950" {...register('pets')}>
                  <option value="No">No pets</option>
                  <option value="Yes">Own pets</option>
                  <option value="Fish/Birds Only">Fish/Birds Only</option>
                </select>
              </div>
            </div>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Preferred Bedrooms / Layout</label>
                <select className="w-full glass-input text-sm bg-white dark:bg-slate-950" {...register('preferredBedrooms')}>
                  <option value="Any">Any Layout</option>
                  <option value="Studio Room">Studio Room</option>
                  <option value="1 BHK">1 BHK Apartment</option>
                  <option value="2 BHK">2 BHK Apartment</option>
                  <option value="3 BHK">3 BHK Apartment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Required Room Amenities</label>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {['WiFi', 'AC', 'Kitchen', 'Laundry', 'Gym', 'Parking'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        value={amenity}
                        className="rounded text-primary-600 focus:ring-primary-500 h-3.5 w-3.5"
                        {...register('requiredAmenities')}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">About Me (Bio)</label>
              <textarea
                rows={3}
                placeholder="Share some details about yourself so owners get to know you..."
                className="w-full glass-input text-sm text-slate-900 dark:text-slate-100 resize-none"
                {...register('about')}
              />
            </div>
          </div>
        )}

        {}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/20 disabled:opacity-50"
          >
            {submitting ? 'Saving Details...' : 'Save Profile'}
          </button>
        </div>

      </form>

      {}
      <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <ShieldCheck className="text-emerald-500" size={16} />
            Identity Verification Status
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
            user?.verified 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {user?.verified ? 'Verified' : 'Unverified'}
          </span>
        </div>

        {user?.verified ? (
          <div className="flex items-center gap-3 bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
            <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
            <div className="text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">You are a Verified Platform Member</p>
              <p className="text-[10px] text-slate-400 mt-0.5">A verification badge is displayed on your listings and matching profiles.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6 text-left">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Complete these steps to verify your account identity, build trust with listings owners, and display a verified badge.
            </p>

            {}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {}
              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-850 bg-white/30 dark:bg-slate-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">1</span>
                  <h4 className="text-xs font-bold">Government-Issued ID</h4>
                </div>
                <p className="text-[10px] text-slate-400">Upload a scan/photo of your driving license, passport, or state ID document.</p>
                
                {idUploaded ? (
                  <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle size={12} /> ID uploaded successfully
                  </div>
                ) : (
                  <label className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 hover:border-primary-500 cursor-pointer text-[10px] font-semibold text-slate-500 hover:text-primary-500 transition-colors bg-white/40 dark:bg-slate-950/20">
                    Choose Photo File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={() => setIdUploaded(true)} 
                      className="hidden" 
                    />
                  </label>
                )}
              </div>

              {}
              <div className="p-4 rounded-xl border border-slate-105 dark:border-slate-850 bg-white/30 dark:bg-slate-950/20 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-5 w-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">2</span>
                  <h4 className="text-xs font-bold">Submit Identity Checklist</h4>
                </div>
                <p className="text-[10px] text-slate-400">Review your profile details above, confirm your details, and request immediate verification approval.</p>
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={verifying}
                  className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold text-[10px] shadow-sm disabled:opacity-50"
                >
                  {verifying ? 'Submitting...' : 'Submit Verification'}
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Profile;
