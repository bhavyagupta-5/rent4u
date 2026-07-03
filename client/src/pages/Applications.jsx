import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { FileText, MapPin, MessageSquare, Compass, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/interest');
      if (res.data.success) {
        setApplications(res.data.data);
      }
    } catch (err) {
      toast.error('Could not fetch applications list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  return (
    <div className="space-y-8 text-left">
      
      {}
      <div className="p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <h2 className="text-2xl font-bold tracking-tight">My Applications</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Review the status of your expressed interest applications for rooms. Once an owner accepts, you can chat directly.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(n => (
            <div key={n} className="h-32 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 animate-pulse flex gap-6">
              <div className="w-32 bg-slate-200 dark:bg-slate-800 rounded-xl h-full"></div>
              <div className="flex-1 space-y-3 py-1">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-xs flex flex-col items-center justify-center space-y-4">
          <FileText className="text-slate-300 dark:text-slate-700" size={48} />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">No applications submitted</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
              You haven't applied to any rooms yet. Browse listings to express interest!
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
        <div className="space-y-5">
          {applications.map((app) => {
            const room = app.listing;
            if (!room) return null; // Safe check if room was deleted

            return (
              <div 
                key={app._id} 
                className="group p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex flex-col md:flex-row gap-5 items-start md:items-center hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 shadow-xs"
              >
                {/* Room Photo */}
                <div className="h-24 w-full md:w-36 rounded-xl overflow-hidden shrink-0">
                  <img 
                    src={room.images[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600"} 
                    alt={room.title}
                    className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 text-left space-y-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{room.roomType}</span>
                    <span className="text-slate-300 dark:text-slate-800 text-[10px]">•</span>
                    <span className="text-xs font-bold text-primary-500">₹{room.rent}/mo</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">
                    {room.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <MapPin size={12} className="shrink-0" />
                    {room.location}
                  </p>
                  
                  {/* Submission date */}
                  <p className="text-[10px] text-slate-400 pt-1">
                    Applied on: {new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Status & Owner Details */}
                <div className="flex flex-col items-end gap-3 w-full md:w-auto shrink-0 md:pl-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800/80 pt-4 md:pt-0">
                  
                  {/* Status Badge */}
                  <span className={`
                    text-xs px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider border
                    ${app.status === 'accepted' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
                      : app.status === 'declined' 
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' 
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'}
                  `}>
                    {app.status}
                  </span>

                  {/* If accepted, show owner info & chat action */}
                  {app.status === 'accepted' && (
                    <div className="flex flex-col items-end gap-2 text-right">
                      <div className="text-xs space-y-0.5 text-slate-500 dark:text-slate-400">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">Owner: {app.owner?.name}</p>
                        {app.owner?.phone && (
                          <p className="flex items-center gap-1 justify-end text-[10px]"><Phone size={10} /> {app.owner.phone}</p>
                        )}
                        {app.owner?.email && (
                          <p className="flex items-center gap-1 justify-end text-[10px]"><Mail size={10} /> {app.owner.email}</p>
                        )}
                      </div>
                      
                      <Link
                        to="/chats"
                        className="inline-flex items-center gap-1.5 justify-center px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all shadow-md shadow-emerald-500/20"
                      >
                        <MessageSquare size={12} />
                        Start Chatting
                      </Link>
                    </div>
                  )}

                  {/* View Details link */}
                  {app.status !== 'accepted' && (
                    <Link
                      to={`/listings/${room._id}`}
                      className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-700 hover:text-primary-600 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:hover:text-white dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                      View Room Details
                    </Link>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Applications;
