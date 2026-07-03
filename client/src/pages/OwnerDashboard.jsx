import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { Home, FileText, Check, X, Sparkles, Plus, Trash2, Edit, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import UserAvatar from '../components/Common/UserAvatar';
import { useSocket } from '../context/SocketContext';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { socket } = useSocket() || {};
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      
      const listingsRes = await api.get('/listings');
      if (listingsRes.data.success) {
        const owned = listingsRes.data.data.filter(l => l.owner._id === user._id);
        setListings(owned);
      }

      const interestRes = await api.get('/interest');
      if (interestRes.data.success) {
        setInterests(interestRes.data.data);
      }
    } catch (err) {
      console.error("Failed to load owner dashboard details:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  useEffect(() => {
    if (socket) {
      const handleNewInterest = () => {
        toast.success("New tenant interest request received!");
        fetchOwnerData();
      };
      socket.on('new_interest', handleNewInterest);
      return () => {
        socket.off('new_interest', handleNewInterest);
      };
    }
  }, [socket]);

  const handleInterestDecision = async (interestId, decision) => {
    try {
      
      const res = await api.patch(`/interest/${interestId}`, { status: decision });
      if (res.data.success) {
        toast.success(`Interest request ${decision}!`);
        fetchOwnerData(); 
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    }
  };

  const handleToggleStatus = async (listing) => {
    try {
      const nextStatus = listing.status === 'available' ? 'filled' : 'available';
      const res = await api.put(`/listings/${listing._id}`, { status: nextStatus });
      if (res.data.success) {
        toast.success(`Room listing marked as ${nextStatus}!`);
        fetchOwnerData();
      }
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing? All images and application logs will be deleted.")) return;
    try {
      const res = await api.delete(`/listings/${listingId}`);
      if (res.data.success) {
        toast.success("Listing deleted successfully");
        fetchOwnerData();
      }
    } catch (err) {
      toast.error("Failed to delete listing.");
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Owner Control Panel</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Sarah, manage your room listings, view tenant requests, and coordinate match deals.</p>
        </div>
        <Link to="/owner/create-listing" className="inline-flex items-center gap-1.5 justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/20">
          <Plus size={16} />
          Create New Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Home className="text-primary-500" size={18} />
            My Active Properties ({listings.length})
          </h3>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2].map(n => <div key={n} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-slate-500 dark:text-slate-400">You haven't listed any rooms yet. Click 'Create New Listing' to start.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((listing) => (
                <div key={listing._id} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <img 
                      src={listing.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600"} 
                      alt="Listing Room"
                      className="h-16 w-16 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{listing.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{listing.location}, {listing.city}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-primary-500">₹{listing.rent}/mo</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <button 
                          onClick={() => handleToggleStatus(listing)}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            listing.status === 'available' 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                          }`}
                        >
                          {listing.status}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link 
                      to={`/owner/edit-listing/${listing._id}`}
                      className="p-2 rounded-xl text-slate-500 hover:text-primary-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition-all"
                    >
                      <Edit size={14} />
                    </Link>
                    <button 
                      onClick={() => handleDeleteListing(listing._id)}
                      className="p-2 rounded-xl text-slate-500 hover:text-red-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/40 dark:hover:bg-slate-800 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 col: Tenant interests list */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="text-primary-500" size={18} />
            Interested Tenants ({interests.length})
          </h3>

          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            </div>
          ) : interests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30">
              <p className="text-slate-400 text-sm">No incoming interest inquiries yet. Verify your listings are 'available'.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {interests.map((interest) => (
                <div key={interest._id} className="p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md space-y-4 shadow-sm">
                  
                  {/* Tenant user info card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <UserAvatar 
                        name={interest.tenant.name}
                        avatar={interest.tenant.avatar} 
                        className="h-9 w-9 rounded-xl"
                      />
                      <div className="text-left">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{interest.tenant.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Applied for {interest.listing?.title || 'Unknown Room'}</p>
                      </div>
                    </div>

                    {/* AI Score Badge */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
                      AI
                    </div>
                  </div>

                  {/* Status Indicator / Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
                    {interest.status === 'pending' ? (
                      <>
                        <button 
                          onClick={() => handleInterestDecision(interest._id, 'declined')}
                          className="flex-1 inline-flex items-center gap-1 justify-center py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all"
                        >
                          <X size={12} />
                          Decline
                        </button>
                        <button 
                          onClick={() => handleInterestDecision(interest._id, 'accepted')}
                          className="flex-1 inline-flex items-center gap-1 justify-center py-2 rounded-xl text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 transition-all shadow-md shadow-primary-500/10"
                        >
                          <Check size={12} />
                          Accept
                        </button>
                      </>
                    ) : (
                      <span className={`w-full text-center py-1.5 rounded-lg text-xs font-bold uppercase ${
                        interest.status === 'accepted' 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {interest.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default OwnerDashboard;
