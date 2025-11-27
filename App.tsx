import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Category, Debt, Theme, GroupEvent, UserProfile, AvatarItem } from './types';
import { INITIAL_TRANSACTIONS } from './constants';
import Dashboard from './components/Dashboard';
import AddTransaction from './components/AddTransaction';
import TransactionList from './components/TransactionList';
import AIAdvisor from './components/AIAdvisor';
import FriendsFamily from './components/FriendsFamily';
import GroupEvents from './components/GroupEvents';
import { hasSharedKey } from './services/geminiService';
import { Wallet, Users, X, Sun, Moon, Palette, Plane, Download, Share, Settings, Trash2, ArrowRight, Sparkles, CheckCircle, Lock } from 'lucide-react';

// Added primary hex for direct coloring
const THEMES: Record<Theme, { b1: string, b2: string, b3: string, primary: string }> = {
  ocean: { b1: '#4f46e5', b2: '#0891b2', b3: '#2563eb', primary: '#4f46e5' }, 
  sunset: { b1: '#db2777', b2: '#f59e0b', b3: '#ea580c', primary: '#db2777' }, 
  nature: { b1: '#059669', b2: '#65a30d', b3: '#10b981', primary: '#10b981' }, 
  nebula: { b1: '#7c3aed', b2: '#c026d3', b3: '#4f46e5', primary: '#7c3aed' }, 
};

const AVATARS: AvatarItem[] = [
    { name: 'Alex', style: 'avataaars', seed: 'Alex' },
    { name: 'Sophie', style: 'avataaars', seed: 'Sophie' },
    { name: 'Max', style: 'avataaars', seed: 'Max' },
    { name: 'Bot', style: 'bottts', seed: 'Robot' },
    { name: 'Alien', style: 'bottts', seed: 'Caleb' },
    { name: 'Cool', style: 'avataaars', seed: 'Cool' },
    { name: 'Smile', style: 'fun-emoji', seed: 'Smile' },
    { name: 'Wink', style: 'fun-emoji', seed: 'Wink' },
    { name: 'Artist', style: 'micah', seed: 'Artist' },
    { name: 'Explorer', style: 'adventurer', seed: 'Explorer' },
    { name: 'Hipster', style: 'notionists', seed: 'Hipster' },
    { name: 'Sketch', style: 'micah', seed: 'Sketch' },
];

// --- ONBOARDING COMPONENT ---
const Onboarding: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
    const [step, setStep] = useState<'splash' | 'setup'>('splash');
    const [name, setName] = useState('Zack'); // Default suggestion
    const [selectedAvatar, setSelectedAvatar] = useState<AvatarItem>(AVATARS[0]);
    const [opacity, setOpacity] = useState(0);

    // Splash Animation Timer
    useEffect(() => {
        // Fade in logo
        setTimeout(() => setOpacity(1), 100);
        
        // Move to setup after 2.5s
        const timer = setTimeout(() => {
            setStep('setup');
        }, 2500);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(name.trim()) {
            onComplete({ name, avatar: selectedAvatar });
        }
    };

    if (step === 'splash') {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black transition-opacity duration-1000" style={{ opacity: 1 }}>
                <div className="flex flex-col items-center gap-6" style={{ opacity, transition: 'opacity 1s ease' }}>
                    <div 
                        className="w-24 h-24 rounded-3xl flex items-center justify-center text-white font-extrabold text-5xl shadow-2xl animate-splash-bounce"
                        style={{ backgroundColor: '#4f46e5', boxShadow: '0 0 40px rgba(79, 70, 229, 0.6)' }}
                    >
                        Z
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
             <div className="glass-panel w-full max-w-md rounded-3xl p-8 animate-slide-up relative">
                <div className="text-center mb-8">
                     <div 
                        className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl shadow-xl"
                        style={{ backgroundColor: '#4f46e5' }}
                    >
                        Z
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Welcome to Z-Finance</h2>
                    <p className="text-white/60">Let's set up your profile.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-white/50 mb-2 block">Your Name</label>
                        <input 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-2xl p-4 text-white text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-[#4f46e5]"
                            placeholder="Enter your name"
                            autoFocus
                        />
                    </div>

                    <div>
                         <label className="text-xs font-bold uppercase text-white/50 mb-3 block">Choose Avatar</label>
                         <div className="grid grid-cols-4 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {AVATARS.map(av => (
                                <button
                                    type="button"
                                    key={av.seed}
                                    onClick={() => setSelectedAvatar(av)}
                                    className={`relative rounded-xl p-1 transition-all ${selectedAvatar.seed === av.seed ? 'bg-white/20 ring-2 ring-white scale-105' : 'hover:bg-white/5'}`}
                                >
                                     <img 
                                        src={`https://api.dicebear.com/7.x/${av.style}/svg?seed=${av.seed}&backgroundColor=transparent`} 
                                        alt={av.name} 
                                        className="w-full aspect-square"
                                    />
                                </button>
                            ))}
                         </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full py-4 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#4f46e5' }}
                    >
                        Start Journey <ArrowRight size={20}/>
                    </button>
                </form>
             </div>
        </div>
    );
};

// --- MAIN APP ---
const App: React.FC = () => {
  // State: Preferences
  const [privacyMode, setPrivacyMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme>('ocean');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('zfinance_api_key') || '');
  const [isSharedKey, setIsSharedKey] = useState(false);
  
  // State: Views
  const [currentView, setCurrentView] = useState<'personal' | 'friends' | 'events'>('personal');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // State: Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('lumiere_transactions');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  // State: Debts
  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('lumiere_debts');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  // State: Group Events
  const [events, setEvents] = useState<GroupEvent[]>(() => {
      const saved = localStorage.getItem('lumiere_events');
      try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  // Persistence
  useEffect(() => { localStorage.setItem('lumiere_transactions', JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem('lumiere_debts', JSON.stringify(debts)); }, [debts]);
  useEffect(() => { localStorage.setItem('lumiere_events', JSON.stringify(events)); }, [events]);

  // Check for shared key on mount
  useEffect(() => {
      if (hasSharedKey()) {
          setIsSharedKey(true);
      }
  }, []);

  // Load User Profile
  useEffect(() => {
      const savedProfile = localStorage.getItem('zfinance_user');
      if (savedProfile) {
          try {
            setUserProfile(JSON.parse(savedProfile));
          } catch(e) {
              console.error("Profile parse error");
          }
      }
  }, []);

  const handleOnboardingComplete = (profile: UserProfile) => {
      setUserProfile(profile);
      localStorage.setItem('zfinance_user', JSON.stringify(profile));
  };

  // Theme & Dark Mode Effects
  useEffect(() => {
    const root = document.documentElement;
    const colors = THEMES[currentTheme];
    root.style.setProperty('--blob-1', colors.b1);
    root.style.setProperty('--blob-2', colors.b2);
    root.style.setProperty('--blob-3', colors.b3);
    root.style.setProperty('--theme-color', colors.primary);
  }, [currentTheme]);

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [darkMode]);

  // Actions
  const addTransaction = (amount: number, type: TransactionType, category: Category, merchantName: string) => {
    const newTx: Transaction = {
      id: Date.now().toString(),
      amount,
      type,
      category,
      merchantName,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    setShowQuickAdd(false);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addDebt = (debt: Debt) => setDebts(prev => [debt, ...prev]);
  const settleDebt = (id: string) => setDebts(prev => prev.map(d => d.id === id ? { ...d, isSettled: true } : d));
  const deleteDebt = (id: string) => setDebts(prev => prev.filter(d => d.id !== id));

  // Event Actions
  const addEvent = (event: GroupEvent) => setEvents(prev => [event, ...prev]);
  const updateEvent = (updatedEvent: GroupEvent) => setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(e => e.id !== id));

  // Reset App Data
  const handleResetApp = () => {
      if(window.confirm("⚠️ Are you sure? This will delete ALL transactions, debts, events, AND your profile.")) {
          setTransactions([]);
          setDebts([]);
          setEvents([]);
          setUserProfile(null);
          localStorage.removeItem('lumiere_transactions');
          localStorage.removeItem('lumiere_debts');
          localStorage.removeItem('lumiere_events');
          localStorage.removeItem('zfinance_user');
          localStorage.removeItem('zfinance_api_key');
          setShowSettingsModal(false);
      }
  };

  const handleSaveApiKey = () => {
      localStorage.setItem('zfinance_api_key', apiKey);
      alert("API Key Saved Successfully!");
  };

  const updateAvatar = (newAvatar: AvatarItem) => {
      if (userProfile) {
          const updated = { ...userProfile, avatar: newAvatar };
          setUserProfile(updated);
          localStorage.setItem('zfinance_user', JSON.stringify(updated));
      }
  }

  // RENDER ONBOARDING IF NO USER
  if (!userProfile) {
      return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen pb-28 relative overflow-x-hidden transition-colors duration-500">
      
      {/* Header */}
      <header className="sticky top-0 z-40 pt-6 pb-4 px-6 backdrop-blur-md bg-white/70 dark:bg-black/20 border-b border-black/5 dark:border-white/5 transition-all">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-2xl shadow-lg transition-colors duration-500"
                    style={{ backgroundColor: `var(--theme-color)` }}
                >
                    Z
                </div>
                <div>
                    <h1 className="text-xl font-bold dark:text-white text-gray-900 tracking-tight leading-none">Hello, {userProfile.name}</h1>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                 {/* Install Button */}
                 <button 
                    onClick={() => setShowInstallModal(true)}
                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white"
                    title="Install App"
                  >
                    <Download size={20} />
                  </button>

                  {/* Settings Button */}
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white"
                    title="Settings & Reset"
                  >
                    <Settings size={20} />
                  </button>

                {/* Theme & Mode Toggles */}
                <div className="flex items-center gap-2 mr-2 bg-black/5 dark:bg-white/5 p-1 rounded-full border border-black/5 dark:border-white/5">
                    <button 
                      onClick={() => setDarkMode(!darkMode)}
                      className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white"
                      title="Toggle Dark Mode"
                    >
                      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    
                    <div className="relative">
                      <button 
                        onClick={() => setShowThemePicker(!showThemePicker)}
                        className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-gray-700 dark:text-white"
                        title="Change Theme"
                      >
                        <Palette size={18} />
                      </button>
                      
                      {showThemePicker && (
                        <div className="absolute top-12 right-0 glass-panel p-2 rounded-2xl flex flex-col gap-2 min-w-[120px] shadow-2xl animate-fade-in z-50">
                          {Object.keys(THEMES).map((t) => (
                            <button
                              key={t}
                              onClick={() => { setCurrentTheme(t as Theme); setShowThemePicker(false); }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-sm capitalize text-left dark:text-white text-gray-800"
                            >
                              <div 
                                className="w-4 h-4 rounded-full" 
                                style={{ background: THEMES[t as Theme].primary }}
                              ></div>
                              {t}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                </div>

                {/* Avatar */}
                <button 
                    onClick={() => setShowAvatarPicker(true)}
                    className="w-10 h-10 rounded-full p-[2px] shadow-lg transition-transform hover:scale-105"
                    style={{ background: `linear-gradient(135deg, var(--theme-color), transparent)` }}
                >
                    <div className="w-full h-full rounded-full bg-white dark:bg-black overflow-hidden">
                         <img 
                            src={`https://api.dicebear.com/7.x/${userProfile.avatar.style}/svg?seed=${userProfile.avatar.seed}&backgroundColor=transparent`} 
                            alt="User" 
                            className="w-full h-full object-cover" 
                        />
                    </div>
                </button>
            </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
        
        {currentView === 'personal' && (
            <div className="space-y-8">
                <Dashboard 
                  transactions={transactions} 
                  privacyMode={privacyMode} 
                  onTogglePrivacy={() => setPrivacyMode(!privacyMode)}
                  onQuickAdd={() => setShowQuickAdd(true)}
                />
                <AIAdvisor transactions={transactions} />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="hidden lg:block lg:col-span-1">
                        <AddTransaction onAdd={addTransaction} />
                    </div>
                    <div className="lg:col-span-2">
                        <TransactionList 
                          transactions={transactions} 
                          onDelete={deleteTransaction} 
                          privacyMode={privacyMode}
                        />
                    </div>
                </div>
            </div>
        )}

        {currentView === 'friends' && (
            <div className="animate-fade-in">
                 <FriendsFamily 
                    debts={debts} 
                    onAdd={addDebt} 
                    onSettle={settleDebt}
                    onDelete={deleteDebt}
                    privacyMode={privacyMode}
                />
            </div>
        )}

        {currentView === 'events' && (
             <div className="animate-fade-in">
                <GroupEvents 
                    events={events}
                    onAddEvent={addEvent}
                    onUpdateEvent={updateEvent}
                    onDeleteEvent={deleteEvent}
                    privacyMode={privacyMode}
                />
             </div>
        )}

      </main>

      {/* Quick Add Modal */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 animate-zoom-in relative">
             <button 
                onClick={() => setShowQuickAdd(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50 transition-colors"
             >
                <X size={20} />
             </button>
             <div className="mt-2">
                <AddTransaction onAdd={addTransaction} />
             </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-panel w-full max-w-sm rounded-3xl p-6 animate-zoom-in relative">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold dark:text-white text-gray-900">Settings</h3>
                      <button onClick={() => setShowSettingsModal(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50"><X size={20} /></button>
                  </div>
                  
                  <div className="space-y-4">
                      {/* API Key Input */}
                      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                            <h4 className="font-bold dark:text-white text-gray-900 mb-2 flex items-center gap-2">
                                <Sparkles size={16} className="text-fuchsia-500"/> AI Configuration
                            </h4>
                            
                            {isSharedKey ? (
                                <div className="flex items-center gap-2 p-3 bg-emerald-500/10 rounded-xl text-emerald-500 dark:text-emerald-400">
                                    <CheckCircle size={16} />
                                    <span className="text-sm font-semibold">Active (Shared Key)</span>
                                </div>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                        Enter your Gemini API Key to enable insights & auto-categorization.
                                    </p>
                                    <div className="flex gap-2">
                                        <input 
                                            type="password" 
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            className="flex-1 bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                                            placeholder="AIzaSy..."
                                        />
                                        <button 
                                            onClick={handleSaveApiKey}
                                            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                                        >
                                            Save
                                        </button>
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-400">
                                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline hover:text-fuchsia-500">Get a free key here</a>
                                    </div>
                                </>
                            )}
                        </div>

                      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                          <h4 className="font-bold dark:text-white text-gray-900 mb-1">Data Management</h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Clear all data and profile. Resets to "fresh install".</p>
                          <button 
                            onClick={handleResetApp}
                            className="w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold transition-colors flex items-center justify-center gap-2"
                          >
                              <Trash2 size={18} /> Reset Everything
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Avatar Picker Modal (Main App) */}
      {showAvatarPicker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-panel w-full max-w-md rounded-3xl p-6 animate-zoom-in relative max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-center mb-6 sticky top-0 bg-transparent z-10">
                      <h3 className="text-xl font-bold dark:text-white text-gray-900">Choose Your Look</h3>
                      <button onClick={() => setShowAvatarPicker(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50"><X size={20} /></button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                      {AVATARS.map((av) => (
                          <button 
                            key={av.name + av.seed}
                            onClick={() => { updateAvatar(av); setShowAvatarPicker(false); }}
                            className={`relative rounded-2xl p-2 transition-all hover:scale-105 flex flex-col items-center ${userProfile?.avatar.seed === av.seed ? 'bg-white/20 ring-2 ring-white' : 'hover:bg-white/5'}`}
                          >
                                <img 
                                    src={`https://api.dicebear.com/7.x/${av.style}/svg?seed=${av.seed}&backgroundColor=transparent`} 
                                    alt={av.name} 
                                    className="w-16 h-16"
                                />
                                <p className="text-center text-xs font-semibold mt-2 dark:text-white text-gray-700">{av.name}</p>
                          </button>
                      ))}
                  </div>
              </div>
          </div>
      )}

      {/* Install App Modal */}
      {showInstallModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="glass-panel w-full max-w-md rounded-3xl p-8 animate-zoom-in relative text-center">
                   <div 
                        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20"
                        style={{ backgroundColor: 'var(--theme-color)' }}
                    ></div>
                  <button onClick={() => setShowInstallModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50"><X size={20} /></button>
                  
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-2xl text-2xl text-white font-bold" style={{ backgroundColor: 'var(--theme-color)' }}>Z</div>
                  <h3 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Install Z-Finance</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Get the full app experience by adding it to your home screen.</p>

                  <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                          <h4 className="font-bold dark:text-white text-gray-900 mb-2 flex items-center gap-2">iOS (iPhone)</h4>
                          <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-decimal pl-4">
                              <li>Tap the <strong>Share</strong> icon <Share size={12} className="inline" /> in Safari.</li>
                              <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                          </ol>
                      </div>
                      <div className="bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                          <h4 className="font-bold dark:text-white text-gray-900 mb-2">Android</h4>
                          <ol className="text-xs text-gray-500 dark:text-gray-400 space-y-2 list-decimal pl-4">
                              <li>Tap the <strong>Menu</strong> (3 dots) in Chrome.</li>
                              <li>Tap <strong>Install App</strong> or <strong>Add to Home Screen</strong>.</li>
                          </ol>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] sm:w-auto">
          <div className="flex justify-between sm:justify-center gap-1 p-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-full shadow-2xl">
              <button
                onClick={() => setCurrentView('personal')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full transition-all duration-300 ${currentView === 'personal' ? 'text-white shadow-lg' : 'text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10'}`}
                style={currentView === 'personal' ? { backgroundColor: 'var(--theme-color)' } : {}}
              >
                  <Wallet size={20} className={currentView === 'personal' ? 'fill-current' : ''} />
                  <span className="font-semibold text-xs sm:text-sm">Wallet</span>
              </button>
              <button
                onClick={() => setCurrentView('events')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full transition-all duration-300 ${currentView === 'events' ? 'text-white shadow-lg' : 'text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10'}`}
                style={currentView === 'events' ? { backgroundColor: 'var(--theme-color)' } : {}}
              >
                  <Plane size={20} className={currentView === 'events' ? 'fill-current' : ''} />
                  <span className="font-semibold text-xs sm:text-sm">Events</span>
              </button>
              <button
                onClick={() => setCurrentView('friends')}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-full transition-all duration-300 ${currentView === 'friends' ? 'text-white shadow-lg' : 'text-gray-500 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/10'}`}
                style={currentView === 'friends' ? { backgroundColor: 'var(--theme-color)' } : {}}
              >
                  <Users size={20} className={currentView === 'friends' ? 'fill-current' : ''} />
                  <span className="font-semibold text-xs sm:text-sm">F&F</span>
              </button>
          </div>
      </div>
    </div>
  );
};

export default App;