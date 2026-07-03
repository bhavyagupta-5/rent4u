import React, { useEffect, useState, useCallback } from 'react';
import { api, useAuth } from '../context/AuthContext';
import { MapPin, DollarSign, Sparkles, Filter, SlidersHorizontal, Map, Grid, RefreshCw, X, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';

const BrowseListings = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [savedSet, setSavedSet] = useState(new Set()); 
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [compareScores, setCompareScores] = useState({});
  const [loadingScores, setLoadingScores] = useState(false);

  const handleToggleCompare = (room) => {
    setCompareList(prev => {
      const exists = prev.find(r => r._id === room._id);
      if (exists) {
        return prev.filter(r => r._id !== room._id);
      }
      if (prev.length >= 3) {
        toast.error("You can compare up to 3 rooms at a time.");
        return prev;
      }
      return [...prev, room];
    });
  };

  const fetchCompareScores = async () => {
    setLoadingScores(true);
    const scores = {};
    for (const room of compareList) {
      try {
        const res = await api.get(`/compatibility/${room._id}`);
        if (res.data.success) {
          scores[room._id] = res.data.data;
        }
      } catch (err) {
        console.warn("Error loading score for compare:", room._id);
      }
    }
    setCompareScores(scores);
    setLoadingScores(false);
  };
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('list'); 

  
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [roomType, setRoomType] = useState('');
  const [furnishing, setFurnishing] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [amenities, setAmenities] = useState({
    wifi: false,
    ac: false,
    kitchen: false,
    laundry: false,
    gym: false,
    parking: false,
  });

  const fetchRooms = async (pageToLoad = 1, append = false) => {
    try {
      setLoading(true);
      
      
      let query = `?page=${pageToLoad}&limit=6&sort=${sort}`;
      if (search) query += `&search=${search}`;
      if (city) query += `&city=${city}`;
      if (minRent) query += `&minRent=${minRent}`;
      if (maxRent) query += `&maxRent=${maxRent}`;
      if (roomType) query += `&roomType=${roomType}`;
      if (furnishing) query += `&furnishing=${furnishing}`;

      
      const activeAmenities = Object.keys(amenities).filter(k => amenities[k]);
      if (activeAmenities.length > 0) {
        
        const namesMap = { wifi: 'WiFi', ac: 'AC', kitchen: 'Kitchen', laundry: 'Laundry', gym: 'Gym', parking: 'Parking' };
        const queryList = activeAmenities.map(k => namesMap[k]).join(',');
        query += `&amenities=${queryList}`;
      }

      const res = await api.get(`/listings${query}`);
      if (res.data.success) {
        if (append) {
          setListings(prev => [...prev, ...res.data.data]);
        } else {
          setListings(res.data.data);
        }
        setTotalPages(res.data.pages);
        setPage(res.data.currentPage);
      }
    } catch (err) {
      toast.error("Could not retrieve listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedIds = async () => {
    if (user?.role !== 'Tenant') return;
    try {
      const res = await api.get('/listings/wishlist');
      if (res.data.success) {
        setSavedSet(new Set(res.data.data.map(r => r._id)));
      }
    } catch (err) {
      
    }
  };

  const handleToggleSave = async (e, roomId) => {
    e.preventDefault(); 
    e.stopPropagation();
    try {
      const res = await api.post(`/listings/${roomId}/wishlist`);
      if (res.data.success) {
        const nowSaved = res.data.saved;
        setSavedSet(prev => {
          const next = new Set(prev);
          if (nowSaved) next.add(roomId);
          else next.delete(roomId);
          return next;
        });
        toast.success(nowSaved ? 'Saved to wishlist!' : 'Removed from wishlist.');
      }
    } catch (err) {
      toast.error('Could not update wishlist.');
    }
  };

  useEffect(() => {
    fetchRooms();
    fetchSavedIds();
  }, [sort, roomType, furnishing, amenities]);

  const { socket } = useSocket() || {};

  useEffect(() => {
    if (socket) {
      const handleNewListing = () => {
        fetchRooms(1, false);
      };
      socket.on('new_listing', handleNewListing);
      return () => {
        socket.off('new_listing', handleNewListing);
      };
    }
  }, [socket]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRooms(1, false);
  };

  const handleResetFilters = () => {
    setSearch('');
    setCity('');
    setMinRent('');
    setMaxRent('');
    setRoomType('');
    setFurnishing('');
    setAmenities({ wifi: false, ac: false, kitchen: false, laundry: false, gym: false, parking: false });
    setSort('-createdAt');
    toast.success("Filters reset successfully");
  };

  return (
    <div className="space-y-6 text-left">
      
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Browse Rooms</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Explore available properties and find your perfect roommate match.</p>
        </div>

        {}
        <div className="flex items-center gap-2 border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Grid size={14} />
            Grid List
          </button>
          <button 
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              viewMode === 'map' ? 'bg-primary-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Map size={14} />
            Split Map
          </button>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {}
        <div className="space-y-6 lg:col-span-1 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-1.5"><Filter size={15} className="text-primary-500" /> Filters</h3>
            <button onClick={handleResetFilters} className="text-[10px] text-primary-500 font-bold hover:underline">Reset</button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            
            {}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Keywords</label>
              <input 
                type="text" 
                placeholder="e.g. Astoria loft"
                className="w-full glass-input text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">City</label>
              <input 
                type="text" 
                placeholder="e.g. Queens"
                className="w-full glass-input text-xs"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            {}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Rent Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" 
                  placeholder="Min"
                  className="w-full glass-input text-xs"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                />
                <input 
                  type="number" 
                  placeholder="Max"
                  className="w-full glass-input text-xs"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                />
              </div>
            </div>

            {}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Room Type</label>
              <select 
                className="w-full glass-input text-xs bg-white dark:bg-slate-950"
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
              >
                <option value="">All Room Types</option>
                <option value="Single">Single Room</option>
                <option value="Shared">Shared Room</option>
                <option value="Entire Flat">Entire Flat</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Furnishing</label>
              <select 
                className="w-full glass-input text-xs bg-white dark:bg-slate-950"
                value={furnishing}
                onChange={(e) => setFurnishing(e.target.value)}
              >
                <option value="">All Furnishing</option>
                <option value="Furnished">Furnished</option>
                <option value="Semi-Furnished">Semi-Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </div>

            {}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sort By</label>
              <select 
                className="w-full glass-input text-xs bg-white dark:bg-slate-950"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="-createdAt">Newest First</option>
                <option value="rent">Rent: Low to High</option>
                <option value="-rent">Rent: High to Low</option>
                <option value="availableFrom">Availability Date</option>
              </select>
            </div>

            {}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4 space-y-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Amenities</label>
              {['wifi', 'ac', 'kitchen', 'laundry', 'gym', 'parking'].map((amenity) => (
                <label key={amenity} className="flex items-center gap-2 text-xs cursor-pointer select-none font-medium capitalize">
                  <input
                    type="checkbox"
                    className="rounded text-primary-600 focus:ring-primary-500"
                    checked={amenities[amenity]}
                    onChange={() => setAmenities(prev => ({ ...prev, [amenity]: !prev[amenity] }))}
                  />
                  {amenity === 'wifi' ? 'WiFi' : amenity === 'ac' ? 'Air Conditioning' : amenity}
                </label>
              ))}
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-primary-500/15 mt-4"
            >
              Search Rooms
            </button>

          </form>
        </div>

        {}
        <div className="lg:col-span-3 space-y-6">
          {viewMode === 'map' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[calc(100vh-18rem)] overflow-hidden">
              
              {}
              <div className="overflow-y-auto pr-2 space-y-4">
                {listings.map(room => (
                  <div key={room._id} className="p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <img src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=150"} alt="room" className="h-16 w-16 rounded-xl object-cover" />
                    <div className="flex-1 text-left">
                      <h4 className="font-bold text-xs line-clamp-1 text-slate-900 dark:text-white">{room.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{room.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-primary-500">₹{room.rent}/mo</span>
                        <Link to={`/listings/${room._id}`} className="text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline">View details</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {}
              <div className="rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden relative shadow-sm">
                
                {}
                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-900 flex items-center justify-center text-slate-400 select-none">
                  <div className="flex flex-col items-center">
                    <MapPin className="text-primary-500 animate-bounce" size={40} />
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2">Rent4u Geolocation Mock View</span>
                  </div>
                </div>

                {}
                {listings.map((room, idx) => (
                  <div 
                    key={room._id}
                    className="absolute p-1.5 rounded-lg bg-primary-600 text-white font-extrabold text-[10px] shadow-lg cursor-pointer"
                    style={{ 
                      top: `${30 + (idx * 12) % 50}%`, 
                      left: `${20 + (idx * 18) % 60}%` 
                    }}
                  >
                    ₹{room.rent}
                  </div>
                ))}
              </div>

            </div>
          ) : (
            
            
            <div className="space-y-8">
              {loading && listings.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 4].map(n => (
                    <div key={n} className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/20">
                  <p className="text-slate-500 dark:text-slate-400">No properties matching those filter filters found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map((room) => (
                    <div key={room._id} className="group flex flex-col rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md transition-all duration-200">
                      
                      <div className="h-44 w-full overflow-hidden relative">
                        <img 
                          src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600"} 
                          alt={room.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {}
                        <label className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/90 dark:bg-slate-950/90 text-[9px] font-extrabold cursor-pointer border border-slate-200/50 dark:border-slate-800 shadow-sm select-none">
                          <input
                            type="checkbox"
                            checked={!!compareList.find(r => r._id === room._id)}
                            onChange={() => handleToggleCompare(room)}
                            className="rounded text-primary-600 focus:ring-primary-500 h-2.5 w-2.5"
                          />
                          Compare
                        </label>

                        {}
                        {user?.role === 'Tenant' && (
                          <button
                            onClick={(e) => handleToggleSave(e, room._id)}
                            className={`absolute top-3 right-3 p-1.5 rounded-lg shadow-sm transition-all ${
                              savedSet.has(room._id)
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 dark:bg-slate-950/90 text-slate-400 hover:text-red-500'
                            }`}
                            title={savedSet.has(room._id) ? 'Remove from wishlist' : 'Save to wishlist'}
                          >
                            <Heart size={12} fill={savedSet.has(room._id) ? 'currentColor' : 'none'} />
                          </button>
                        )}
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between text-left">
                        <div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
                            <span>{room.roomType}</span>
                            <span>•</span>
                            <span>{room.furnishing}</span>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 mb-1">{room.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-4"><MapPin size={12} /> {room.location}, {room.city}</p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rent</span>
                            <span className="text-base font-black text-primary-500">₹{room.rent}/mo</span>
                          </div>
                          <Link 
                            to={`/listings/${room._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-white bg-slate-100 hover:bg-primary-600 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/60 dark:hover:bg-primary-600 rounded-lg transition-all"
                          >
                            View details
                          </Link>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

              {}
              {page < totalPages && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={() => fetchRooms(page + 1, true)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all"
                  >
                    <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    Load More Rooms
                  </button>
                </div>
              )}
            </div>

          )}
        </div>

      </div>

      {}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-2xl flex items-center justify-between gap-6 max-w-md w-full animate-enter">
          <div className="text-left">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Compare Rooms</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">{compareList.length} of 3 rooms selected</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCompareList([])}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold hover:bg-slate-105 dark:hover:bg-slate-800"
            >
              Clear
            </button>
            <button
              onClick={() => {
                fetchCompareScores();
                setShowCompareModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-[10px] shadow-md shadow-primary-500/20"
            >
              Compare Side-by-Side
            </button>
          </div>
        </div>
      )}

      {}
      {showCompareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm">Room Comparison Matrix</h3>
              <button 
                onClick={() => setShowCompareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-xs text-left divide-y divide-slate-100 dark:divide-slate-800">
                <thead>
                  <tr className="divide-x divide-slate-100 dark:divide-slate-800">
                    <th className="py-2.5 px-4 font-bold text-slate-400 uppercase tracking-wider w-1/4">Criteria</th>
                    {compareList.map((room) => (
                      <th key={room._id} className="py-2.5 px-4 font-bold w-1/4">
                        <div className="flex flex-col gap-2">
                          <img src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=150"} alt="room" className="h-16 w-full object-cover rounded-lg" />
                          <span className="font-bold text-slate-900 dark:text-white line-clamp-1 text-left">{room.title}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 divide-x divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">Rent / mo</td>
                    {compareList.map(r => (
                      <td key={r._id} className="py-3 px-4 font-extrabold text-primary-500 text-left">₹{r.rent}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">Deposit</td>
                    {compareList.map(r => (
                      <td key={r._id} className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">₹{r.deposit}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">Room Type</td>
                    {compareList.map(r => (
                      <td key={r._id} className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">{r.roomType}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">Furnishing</td>
                    {compareList.map(r => (
                      <td key={r._id} className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300 text-left">{r.furnishing}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">Amenities</td>
                    {compareList.map(r => (
                      <td key={r._id} className="py-3 px-4 text-[10px] text-slate-500 dark:text-slate-400 text-left">
                        {r.amenities.join(', ')}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-slate-400">
                      <div className="flex items-center gap-1">
                        <Sparkles size={11} className="text-yellow-500" />
                        AI Compatibility
                      </div>
                    </td>
                    {compareList.map(r => {
                      const scoreData = compareScores[r._id];
                      return (
                        <td key={r._id} className="py-3 px-4 font-bold text-slate-700 dark:text-slate-300 text-left">
                          {loadingScores ? (
                            'Calculating...'
                          ) : scoreData ? (
                            <span className="text-emerald-500 font-extrabold">{scoreData.score}% match</span>
                          ) : (
                            'Profile Incomplete'
                          )}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setShowCompareModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold rounded-xl"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BrowseListings;
