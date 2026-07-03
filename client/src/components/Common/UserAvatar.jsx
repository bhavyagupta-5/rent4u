import React from 'react';
import { User } from 'lucide-react';

const UserAvatar = ({ name, avatar, className = "h-8 w-8 rounded-lg", size = 16 }) => {
  if (avatar && avatar.trim() !== '' && !avatar.includes('images.unsplash.com/photo-1535713875002-d1d0cf377fde')) {
    return (
      <img
        src={avatar}
        alt={name || "profile"}
        className={`${className} object-cover`}
      />
    );
  }

  const initials = name
    ? name.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '';

  return (
    <div className={`${className} bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-extrabold flex items-center justify-center border border-amber-200/30 text-[11px] shrink-0 select-none uppercase`}>
      {initials ? initials : <User size={size} />}
    </div>
  );
};

export default UserAvatar;
