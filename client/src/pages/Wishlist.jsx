import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { Heart, MapPin, Compass } from 'lucide-react';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const [savedRooms, setSavedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedRooms = async () => {
    try {
      setLoading(true);
      const res = await api.get('/listings/wishlist');
      if (res.data.success) {
        setSavedRooms(res.data.data);
      }
    } catch (err) {
      toast.error('Could not fetch saved rooms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedRooms();
  }, []);

  const handleUnsave = async (listingId) => {
    try {
      const res = await api.post(`/listings/${listingId}/wishlist`);
      if (res.data.success) {
        toast.success(res.data.message || 'Room removed from saved list.');
        
        setSavedRooms(prev => prev.filter(r => r._id !== listingId));
      }
    } catch (err) {
      toast.error('Could not remove room from saved list.');
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {}
      <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <h2 className="text-2xl font-bold tracking-tight">My Saved Rooms</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Keep track of room listings you have bookmarked. Complete your questionnaire profile to view compatibility scores.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-80 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 animate-pulse space-y-4">
              <div className="h-44 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : savedRooms.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-xs flex flex-col items-center justify-center space-y-4">
          <Heart className="text-slate-300 dark:text-slate-700" size={48} />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No saved rooms yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              Explore available flatmate rooms and save your favorites to compare or apply later.
            </p>
          </div>
          <Link 
            to="/browse" 
            className="inline-flex items-center gap-1.5 justify-center px-5 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/20"
          >
            <Compass size={14} />
            Browse Rooms
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedRooms.map((room) => (
            <div key={room._id} className="group flex flex-col rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 relative">
              
              {}
              <div className="relative h-48 w-full overflow-hidden">
                <img 
                  src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600"} 
                  alt={room.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {}
                <button 
                  onClick={() => handleUnsave(room._id)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-red-500 hover:scale-105 transition-all"
                  title="Remove from Saved"
                >
                  <Heart size={16} fill="currentColor" />
                </button>
              </div>

              {}
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">
                    <span>{room.roomType}</span>
                    <span>•</span>
                    <span>{room.furnishing}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-2">
                    {room.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4">
                    <MapPin size={12} />
                    {room.location}, {room.city}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent</span>
                    <span className="text-lg font-black text-primary-500 flex items-center">
                      ₹{room.rent}
                      <span className="text-xs font-medium text-slate-400">/mo</span>
                    </span>
                  </div>
                  <Link 
                    to={`/listings/${room._id}`}
                    className="inline-flex items-center gap-1 justify-center px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-primary-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg transition-all"
                  >
                    View Details
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
