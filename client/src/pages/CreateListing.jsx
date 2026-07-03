import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { ArrowLeft, Upload, X, Home, Info, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateListing = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [generatingDesc, setGeneratingDesc] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    
    if (imageFiles.length + files.length > 5) {
      toast.error('You can upload up to 5 images only');
      return;
    }

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...previews]);
  };

  const removeImage = (index) => {
    const files = [...imageFiles];
    files.splice(index, 1);
    setImageFiles(files);

    const previews = [...imagePreviews];
    previews.splice(index, 1);
    setImagePreviews(previews);
  };

  const handleGenerateDescription = async () => {
    const titleVal = watch('title');
    const cityVal = watch('city');
    const roomTypeVal = watch('roomType');
    const rentVal = watch('rent');
    const furnishingVal = watch('furnishing');

    if (!titleVal || !cityVal || !rentVal) {
      toast.error("Please fill out Title, City, and Rent first to generate description.");
      return;
    }

    try {
      setGeneratingDesc(true);
      const amenitiesList = [];
      if (watch('wifi')) amenitiesList.push('WiFi');
      if (watch('ac')) amenitiesList.push('AC');
      if (watch('kitchen')) amenitiesList.push('Kitchen');
      if (watch('laundry')) amenitiesList.push('Laundry');
      if (watch('gym')) amenitiesList.push('Gym');
      if (watch('parking')) amenitiesList.push('Parking');

      const res = await api.post('/listings/generate-description', {
        title: titleVal,
        city: cityVal,
        roomType: roomTypeVal || 'Single',
        rent: rentVal,
        furnishing: furnishingVal || 'Furnished',
        amenities: amenitiesList.join(', ')
      });

      if (res.data.success) {
        setValue('description', res.data.data);
        toast.success("AI Room Description generated!");
      }
    } catch (err) {
      toast.error("Failed to generate AI description.");
    } finally {
      setGeneratingDesc(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('location', data.location);
      formData.append('city', data.city);
      formData.append('state', data.state);
      formData.append('rent', data.rent);
      formData.append('deposit', data.deposit);
      formData.append('availableFrom', data.availableFrom);
      formData.append('roomType', data.roomType);
      formData.append('furnishing', data.furnishing);
      
      
      const selectedAmenities = [];
      if (data.wifi) selectedAmenities.push('WiFi');
      if (data.ac) selectedAmenities.push('AC');
      if (data.kitchen) selectedAmenities.push('Kitchen');
      if (data.laundry) selectedAmenities.push('Laundry');
      if (data.gym) selectedAmenities.push('Gym');
      if (data.parking) selectedAmenities.push('Parking');
      if (data.petFriendly) selectedAmenities.push('Pet Friendly');
      formData.append('amenities', selectedAmenities.join(','));

      
      imageFiles.forEach(file => {
        formData.append('images', file);
      });

      const res = await api.post('/listings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Room listing created successfully!');
        navigate('/owner');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl mx-auto">
      
      <div className="flex items-center gap-3">
        <Link to="/owner" className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white/50 dark:bg-slate-900/50">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h2 className="text-xl font-bold">List a New Room</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Share your property details to match with potential flatmates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        
        {}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Listing Title</label>
          <input
            type="text"
            placeholder="e.g. Spacious Astoria Room with Balcony"
            className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Detailed Description</label>
            <button
              type="button"
              disabled={generatingDesc}
              onClick={handleGenerateDescription}
              className="inline-flex items-center gap-1 text-[10px] bg-primary-500 hover:bg-primary-600 text-white px-2.5 py-1 rounded-lg font-bold transition-all shadow-sm disabled:opacity-50"
            >
              {generatingDesc ? 'Generating...' : '⚡ AI Autofill'}
            </button>
          </div>
          <textarea
            rows={4}
            placeholder="Describe the room, building amenities, flatmate vibes, and rules..."
            className="w-full glass-input text-sm text-slate-900 dark:text-slate-100 resize-none"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Monthly Rent (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1200"
              className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
              {...register('rent', { required: 'Rent is required', min: 0 })}
            />
            {errors.rent && <p className="text-xs text-red-500 mt-1">{errors.rent.message}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Security Deposit (₹)</label>
            <input
              type="number"
              placeholder="e.g. 1000"
              className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
              {...register('deposit', { required: 'Deposit is required', min: 0 })}
            />
            {errors.deposit && <p className="text-xs text-red-500 mt-1">{errors.deposit.message}</p>}
          </div>
        </div>

        {}
        <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-4">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Home size={14} className="text-primary-500" /> Location Details</h3>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Street Address</label>
            <input
              type="text"
              placeholder="e.g. 123 Main St, Astoria"
              className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
              {...register('location', { required: 'Address is required' })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">City</label>
              <input
                type="text"
                placeholder="e.g. Queens"
                className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                {...register('city', { required: 'City is required' })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">State</label>
              <input
                type="text"
                placeholder="e.g. NY"
                className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                {...register('state', { required: 'State is required' })}
              />
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6 border-t border-slate-100 dark:border-slate-800 pt-4">
          <h3 className="text-sm font-bold flex items-center gap-1.5"><Info size={14} className="text-primary-500" /> Specifications</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Room Type</label>
              <select className="w-full glass-input text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" {...register('roomType')}>
                <option value="Single">Single Room</option>
                <option value="Shared">Shared Room</option>
                <option value="Entire Flat">Entire Flat</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Furnishing Status</label>
              <select className="w-full glass-input text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-950" {...register('furnishing')}>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Available From</label>
              <input
                type="date"
                className="w-full glass-input text-sm text-slate-900 dark:text-slate-100"
                {...register('availableFrom', { required: 'Availability date is required' })}
              />
            </div>
          </div>
        </div>

        {}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Amenities Included</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('wifi')} /> WiFi
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('ac')} /> Air Conditioning
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('kitchen')} /> Kitchen access
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('laundry')} /> Laundry on-site
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('gym')} /> Gym Access
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('parking')} /> Parking Garage
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
              <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500" {...register('petFriendly')} /> Pet Friendly
            </label>
          </div>
        </div>

        {}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-4">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Property Images (Max 5)</label>
          
          <div className="flex flex-wrap gap-4">
            
            {}
            {imageFiles.length < 5 && (
              <label className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-primary-500 cursor-pointer bg-white/30 dark:bg-slate-950/20 text-slate-400 hover:text-primary-500 transition-colors">
                <Upload size={18} />
                <span className="text-[10px] font-bold mt-1">Upload</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}

            {}
            {imagePreviews.map((preview, index) => (
              <div key={index} className="h-24 w-24 relative rounded-xl overflow-hidden group">
                <img src={preview} alt="Upload Preview" className="h-full w-full object-cover" />
                <button 
                  type="button" 
                  onClick={() => removeImage(index)}
                  className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 group-hover:opacity-100 text-white transition-opacity duration-200"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-end gap-3">
          <Link to="/owner" className="px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80">Cancel</Link>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-1.5 justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/20 disabled:opacity-50"
          >
            {submitting ? 'Creating Listing...' : 'Publish Listing'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateListing;
