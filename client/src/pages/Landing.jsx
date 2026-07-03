import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, MessageSquare, BadgePercent, ChevronRight, Home, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkBg-dark transition-colors duration-300">
      
      {}
      <header className="fixed top-0 w-full z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-md dark:border-slate-800/50 dark:bg-darkBg-dark/70">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 to-amber-500 shadow-md">
                <span className="text-lg font-extrabold text-white">R</span>
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary-600 to-amber-600 bg-clip-text text-transparent">
                RentHour AI
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 transition-colors">
                Login
              </Link>
              <Link to="/register" className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-xl transition-all shadow-md shadow-primary-500/20">
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {}
      <section className="relative pt-32 pb-24 overflow-hidden">
        
        {}
        <div className="absolute top-1/4 left-1/2 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary-400 to-amber-400 opacity-15 blur-3xl dark:from-primary-600 dark:to-amber-600 dark:opacity-15"></div>

        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-700 dark:bg-primary-950/40 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/30 mb-8 animate-pulse-slow">
            <Sparkles size={13} />
            AI-Powered Flatmate Matching Platform
          </span>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl max-w-4xl mx-auto leading-none">
            Find the Perfect Room & Flatmate using{' '}
            <span className="bg-gradient-to-r from-primary-500 to-amber-500 bg-clip-text text-transparent text-glow">
              RentHour AI
            </span>
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            RentHour AI evaluates budget ranges, preferred locations, and lifestyle choices using the Grok API to match tenants and room listings instantly.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/register" className="inline-flex items-center gap-1.5 justify-center px-6 py-3.5 text-base font-semibold text-white bg-primary-600 hover:bg-primary-500 rounded-2xl transition-all shadow-lg shadow-primary-500/25">
              Get Started Free
              <ChevronRight size={16} />
            </Link>
            <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 dark:text-slate-200 hover:underline">
              Sign in to your account
            </Link>
          </div>

          {}
          <div className="mt-16 sm:mt-20 flex justify-center">
            <div className="relative rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-6 sm:p-8 max-w-3xl w-full shadow-2xl">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-6">
                
                <div className="flex items-center gap-4">
                  <img 
                    src="/images/indian_flatmates.png" 
                    alt="Tenant Profile avatar" 
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary-500/20"
                  />
                  <div className="text-left">
                    <h3 className="font-bold text-slate-900 dark:text-white font-sans">Aarav Sharma</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Delhi NCR • Software Engineer</p>
                  </div>
                </div>

                {}
                <div className="flex items-center gap-3 bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-5 py-2.5">
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">AI Compatibility</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">95%</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <h3 className="font-bold text-slate-900 dark:text-white">Greater Kailash Flat</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">₹15,000/mo • Single Room</p>
                  </div>
                  <img 
                    src="/images/indian_living_room.png" 
                    alt="Listing Photo" 
                    className="h-14 w-14 rounded-2xl object-cover ring-2 ring-primary-500/20"
                  />
                </div>

              </div>
              
              <p className="pt-6 text-sm text-left italic text-slate-600 dark:text-slate-300">
                "Grok Match Explanation: Excellent fit because Aarav's budget (₹15,000) matches perfectly, the metro commute to Gurugram is under 20 minutes, and lifestyle preferences (vegetarian, non-smoker) align seamlessly."
              </p>
            </div>
          </div>

        </div>
      </section>

      {}
      <section className="py-24 border-t border-slate-200/50 dark:border-slate-800/50 bg-white/30 dark:bg-slate-950/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Why use RentHour AI?
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Unlike traditional listings sites, we evaluate room seeker compatibility to protect your peace of mind.
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-5xl sm:mt-20 lg:mt-24">
            <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-12 sm:max-w-none sm:grid-cols-3">
              
              {}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 mb-5">
                  <Sparkles size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grok AI Compatibility</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Analyze room amenities, locations, move-in periods, and tenant questionnaires using xAI's Grok API.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 mb-5">
                  <MessageSquare size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real-time Sockets Chat</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Discuss listings instantly. Includes unread counters, typing status indicators, and seen notifications.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 mb-5">
                  <Shield size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verified Users</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  Role-based profiles, identity badges, and full system moderation features for safety.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© 2026 RentHour AI. Built with MERN Stack + Grok xAI compatibility services.</p>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
