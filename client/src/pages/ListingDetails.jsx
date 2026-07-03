import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  ArrowLeft, 
  Check, 
  User, 
  MessageSquare,
  ShieldCheck,
  FileText,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import UserAvatar from '../components/Common/UserAvatar';

const ListingDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [interestStatus, setInterestStatus] = useState('none'); 
  const [interestId, setInterestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expressing, setExpressing] = useState(false);
  const [activeImage, setActiveImage] = useState('');
  const [saved, setSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);

  const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return Number(d.toFixed(2));
  };

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      
      
      const roomRes = await api.get(`/listings/${id}`);
      if (roomRes.data.success) {
        const roomData = roomRes.data.data;
        setRoom(roomData);
        setActiveImage(roomData.images[0] || '');
      }

      
      if (user?.role === 'Tenant') {
        try {
          const compRes = await api.get(`/compatibility/${id}`);
          if (compRes.data.success) {
            setCompatibility(compRes.data.data);
          }
        } catch (compErr) {
          console.warn("Could not load compatibility score:", compErr.response?.data?.message);
        }

        
        const interestRes = await api.get('/interest');
        if (interestRes.data.success) {
          const matchingInterest = interestRes.data.data.find(i => i.listing._id === id);
          if (matchingInterest) {
            setInterestStatus(matchingInterest.status);
            setInterestId(matchingInterest._id);
          }
        }

        
        try {
          const meRes = await api.get('/auth/me');
          if (meRes.data.success && meRes.data.user?.savedListings) {
            const isSaved = meRes.data.user.savedListings.some(
              sid => sid === id || sid?._id === id || sid?.toString() === id
            );
            setSaved(isSaved);
          }
        } catch (meErr) {
          console.warn('Could not check wishlist status');
        }
      }

    } catch (err) {
      toast.error("Error loading listing details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
  }, [id, user]);

  const handleExpressInterest = async () => {
    if (expressing) return;
    try {
      setExpressing(true);
      const res = await api.post('/interest', { listingId: id });
      if (res.data.success) {
        toast.success("Interest expressed successfully! Owner notified.");
        setInterestStatus('pending');
        fetchListingDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to express interest.");
    } finally {
      setExpressing(false);
    }
  };

  const handleToggleSave = async () => {
    if (savingToggle) return;
    try {
      setSavingToggle(true);
      const res = await api.post(`/listings/${id}/wishlist`);
      if (res.data.success) {
        const nowSaved = res.data.saved;
        setSaved(nowSaved);
        toast.success(nowSaved ? 'Room saved to wishlist!' : 'Room removed from wishlist.');
      }
    } catch (err) {
      toast.error('Could not update wishlist.');
    } finally {
      setSavingToggle(false);
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Listing not found or was removed.</p>
        <Link to="/browse" className="text-primary-500 underline mt-4 inline-block">Back to listings</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto">
      
      {}
      <div className="flex items-center justify-between">
        <Link 
          to="/browse"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={16} />
          Back to Browse
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {}
        <div className="lg:col-span-2 space-y-6">
          
          {}
          <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden shadow-sm">
            <div className="h-96 w-full relative bg-slate-100 dark:bg-slate-900">
              <img 
                src={activeImage || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800"} 
                alt={room.title} 
                className="h-full w-full object-cover"
              />
            </div>
            
            {}
            {room.images && room.images.length > 1 && (
              <div className="p-4 flex gap-3 overflow-x-auto border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                {room.images.map((imgUrl, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      activeImage === imgUrl ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-transparent hover:border-slate-300'
                    }`}
                  >
                    <img src={imgUrl} alt="thumb" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {}
          <div className="grid grid-cols-3 gap-4 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rent</span>
              <p className="text-lg font-black text-primary-500 mt-1">₹{room.rent}/mo</p>
            </div>
            <div className="text-center border-x border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Deposit</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-1">₹{room.deposit}</p>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Room Type</span>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1.5">{room.roomType}</p>
            </div>
          </div>

          {}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-3">
            <h3 className="text-base font-bold">Property Description</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{room.description}</p>
          </div>

          {}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
            <h3 className="text-base font-bold">Amenities Included</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {room.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Check size={12} />
                  </div>
                  {amenity}
                </div>
              ))}
            </div>
          </div>

        </div>

        {}
        <div className="space-y-6">
          
          {}
          {user?.role === 'Tenant' && (
            <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-gradient-to-br from-white/70 to-white/30 dark:from-slate-900/70 dark:to-slate-900/30 backdrop-blur-md space-y-6 shadow-md relative overflow-hidden">
              
              <div className="absolute top-0 right-0 h-28 w-28 rounded-full bg-primary-500/10 blur-2xl"></div>

              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles className="text-primary-500" size={15} />
                  Match Score Analysis
                </h3>
                <span className="text-[9px] font-bold bg-primary-100 dark:bg-primary-950/40 text-primary-600 px-2 py-0.5 rounded uppercase">
                  {compatibility?.generatedBy || 'loading'}
                </span>
              </div>

              {compatibility ? (
                <div className="space-y-4">
                  
                  {}
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
                      <span className="text-2xl font-black text-white">{compatibility.score}%</span>
                    </div>
                    <div className="text-left">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {compatibility.score >= 90 ? 'Excellent Match' : compatibility.score >= 70 ? 'Good Match' : 'Potential Conflict'}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Predicted by Rent4u matching engine</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-850 p-3 rounded-xl italic">
                    "{compatibility.explanation}"
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Complete your tenant questionnaire profile details to display compatibility scores.</p>
              )}

            </div>
          )}

          {}
          <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Owner</h3>
            
            <div className="flex items-center gap-3">
              <UserAvatar 
                name={room.owner?.name}
                avatar={room.owner?.avatar}
                className="h-11 w-11 rounded-xl ring-2 ring-primary-500/10"
              />
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{room.owner?.name}</h4>
                  {room.owner?.verified && (
                    <ShieldCheck className="text-emerald-500 shrink-0" size={15} />
                  )}
                </div>
                <p className="text-[10px] text-slate-400 truncate">Owner account</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Available From</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {new Date(room.availableFrom).toDateString()}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Address</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                  {room.location}
                </span>
              </div>
            </div>

          </div>

          {}
          {user?.role === 'Tenant' && (
            <div className="space-y-3">
              {interestStatus === 'none' ? (
                <button
                  onClick={handleExpressInterest}
                  disabled={expressing}
                  className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15 disabled:opacity-50"
                >
                  {expressing ? 'Sending...' : 'Express Interest'}
                </button>
              ) : interestStatus === 'pending' ? (
                <div className="w-full py-3 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold text-sm text-center flex items-center justify-center gap-1.5">
                  <FileText size={15} />
                  Application Pending
                </div>
              ) : interestStatus === 'accepted' ? (
                <div className="space-y-3">
                  <div className="w-full py-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-sm text-center flex items-center justify-center gap-1.5">
                    <Check size={15} />
                    Application Approved
                  </div>
                  <Link
                    to="/chats"
                    className="w-full py-3 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/15 text-center"
                  >
                    <MessageSquare size={15} />
                    Start Chatting Now
                  </Link>
                </div>
              ) : (
                <div className="w-full py-3 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-bold text-sm text-center">
                  Application Declined
                </div>
              )}
            </div>
          )}

          {}
          {user?.role === 'Tenant' && (
            <button
              onClick={handleToggleSave}
              disabled={savingToggle}
              className={`w-full py-3 rounded-2xl border font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 ${
                saved
                  ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Heart size={15} fill={saved ? 'currentColor' : 'none'} />
              {savingToggle ? 'Updating...' : saved ? 'Saved to Wishlist' : 'Save Room'}
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default ListingDetails;
