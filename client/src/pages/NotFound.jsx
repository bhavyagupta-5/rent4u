import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="h-16 w-16 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shadow-md">
        <ShieldAlert size={32} />
      </div>
      
      <h2 className="text-2xl font-black">404 - Page Not Found</h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        The route you are trying to query does not exist or was moved by administrators.
      </p>

      <Link 
        to="/"
        className="inline-flex items-center gap-1.5 justify-center px-4 py-2.5 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/10"
      >
        <Compass size={14} />
        Back to Safety
      </Link>
    </div>
  );
};

export default NotFound;
