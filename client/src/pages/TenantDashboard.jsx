import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api, useAuth } from '../context/AuthContext';
import { Sparkles, MapPin, Compass, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) return null;
  if (lat1 === null || lon1 === null || lat2 === null || lon2 === null) return null;
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TenantDashboard = () => {
  const { user, tenantProfile } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, accepted: 0, total: 0 });
  const [coords, setCoords] = useState(null);
  const [locStatus, setLocStatus] = useState('idle'); 

  
  useEffect(() => {
    if (!tenantProfile || tenantProfile.preferredLocation === 'Not specified yet') {
      if (!navigator.geolocation) {
        setLocStatus('unsupported');
        return;
      }
      setLocStatus('prompting');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocStatus('granted');
        },
        (error) => {
          console.warn("Geolocation permission denied or failed:", error.message);
          setLocStatus('denied');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  }, [tenantProfile]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      const listRes = await api.get('/listings?limit=6');
      const availableRooms = listRes.data.data;

      let roomsWithScores = [];

      if (tenantProfile && tenantProfile.preferredLocation !== 'Not specified yet') {
        roomsWithScores = await Promise.all(availableRooms.map(async (room) => {
          const distance = coords ? getDistanceKm(coords.latitude, coords.longitude, room.latitude, room.longitude) : null;
          try {
            const compRes = await api.get(`/compatibility/${room._id}`);
            return {
              ...room,
              distance,
              compatibility: compRes.data.data
            };
          } catch (err) {
            return {
              ...room,
              distance,
              compatibility: null
            };
          }
        }));

        roomsWithScores.sort((a, b) => {
          const scoreA = a.compatibility ? a.compatibility.score : 0;
          const scoreB = b.compatibility ? b.compatibility.score : 0;
          return scoreB - scoreA;
        });
      } else {
        roomsWithScores = availableRooms.map((room) => {
          const dist = coords ? getDistanceKm(coords.latitude, coords.longitude, room.latitude, room.longitude) : null;
          return {
            ...room,
            distance: dist,
            compatibility: null
          };
        });

        if (coords) {
          roomsWithScores.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
        }
      }

      setListings(roomsWithScores);

      const intRes = await api.get('/interest');
      if (intRes.data.success) {
        const list = intRes.data.data;
        setStats({
          total: list.length,
          pending: list.filter(i => i.status === 'pending').length,
          accepted: list.filter(i => i.status === 'accepted').length,
        });
      }
    } catch (error) {
      console.error("Failed to load tenant dashboard data:", error.message);
    } finally {
      setLoading(false);
    }
  }, [tenantProfile, coords]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleNewListing = () => {
        loadDashboardData();
      };
      
      const handleInterestUpdate = (data) => {
        toast.success(`Your flatmate application status is now: ${data.status.toUpperCase()}!`);
        loadDashboardData();
      };

      socket.on('new_listing', handleNewListing);
      socket.on('interest_update', handleInterestUpdate);

      return () => {
        socket.off('new_listing', handleNewListing);
        socket.off('interest_update', handleInterestUpdate);
      };
    }
  }, [socket, loadDashboardData]);

  const handleToggleWishlist = async (listingId) => {
    try {
      const res = await api.post(`/listings/${listingId}/wishlist`);
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (err) {
      toast.error('Could not update saved room list.');
    }
  };

  return (
    <div className="space-y-8 text-left">
      
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, {user?.name}!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is a curated list of room listings that align with your lifestyle settings.</p>
        </div>
        <Link to="/browse" className="inline-flex items-center gap-1.5 justify-center px-4 py-2.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/20">
          <Compass size={16} />
          Explore All Rooms
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Applications</span>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Decisions</span>
          <p className="text-3xl font-black text-amber-500 mt-1">{stats.pending}</p>
        </div>
        <div className="p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accepted Applications</span>
          <p className="text-3xl font-black text-emerald-500 mt-1">{stats.accepted}</p>
        </div>
      </div>

      {}
      {(!tenantProfile || tenantProfile.preferredLocation === 'Not specified yet') && (
        <div className="relative overflow-hidden p-6 rounded-2xl border border-indigo-100 dark:border-indigo-950 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Matchmaking Incomplete</span>
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-slate-200">Tell us what you are looking for!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              We don't know your house preferences yet. Fill out your lifestyle and room requirement questionnaire so our AI can calculate compatibility scores and find your perfect room match.
            </p>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {locStatus === 'granted' ? (
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle size={12} /> Location access active: showing rooms nearby sorted by proximity.
                </span>
              ) : locStatus === 'denied' ? (
                <span>Location access denied: showing the most recent listings.</span>
              ) : locStatus === 'prompting' ? (
                <span>Requesting location to find nearby rooms...</span>
              ) : (
                <span>Showing the most recent listings.</span>
              )}
            </div>
          </div>
          <Link
            to="/profile"
            className="shrink-0 inline-flex items-center gap-1.5 justify-center px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-500/20"
          >
            <Sparkles size={16} />
            Complete Questionnaire
          </Link>
        </div>
      )}

      {/* 3. Recommended Listings ranked by Compatibility or Distance */}
      <div>
        <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Sparkles className="text-primary-500" size={18} />
          {tenantProfile && tenantProfile.preferredLocation !== 'Not specified yet' ? "AI Matches Ranked For You" : coords ? "Nearby Rooms For You" : "Most Recent Rooms For You"}
        </h3>

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
        ) : listings.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-500 dark:text-slate-400">No rooms available at the moment. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((room) => {
              const compScore = room.compatibility?.score;
              const hasScore = compScore !== undefined && compScore !== null;

              return (
                <div key={room._id} className="group flex flex-col rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 relative">
                  
                  {/* Listing Image */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600"} 
                      alt={room.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Compatibility Badge Overlay */}
                    {hasScore ? (
                      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500">
                        <Sparkles size={11} />
                        {compScore}% Match
                      </div>
                    ) : (
                      <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        Profile incomplete
                      </div>
                    )}
                  </div>

                  {/* Room Details */}
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
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-4 gap-2">
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="shrink-0" />
                          {room.location}, {room.city}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent</span>
                        <span className="text-lg font-black text-primary-500 flex items-center">₹{room.rent}<span className="text-xs font-medium text-slate-400">/mo</span></span>
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
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default TenantDashboard;
