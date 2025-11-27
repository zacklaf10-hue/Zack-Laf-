import React, { useState } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { ShoppingBag, Coffee, Zap, Home, Train, Heart, Music, DollarSign, Archive, Briefcase, Trash2, Search } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  privacyMode: boolean;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case Category.GROCERIES: return <ShoppingBag size={18} />;
    case Category.RESTAURANT: return <Coffee size={18} />;
    case Category.UTILITIES: return <Zap size={18} />;
    case Category.HOUSING: return <Home size={18} />;
    case Category.TRANSPORT: return <Train size={18} />;
    case Category.HEALTH: return <Heart size={18} />;
    case Category.ENTERTAINMENT: return <Music size={18} />;
    case Category.SALARY: return <DollarSign size={18} />;
    case Category.SHOPPING: return <Briefcase size={18} />;
    default: return <Archive size={18} />;
  }
};

const TransactionList: React.FC<Props> = ({ transactions, onDelete, privacyMode }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = transactions.filter(t => 
    t.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 dark:text-white/30 text-gray-400 glass-card rounded-3xl">
        <p>No transactions found for this period.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between px-1">
         <h3 className="text-sm font-bold dark:text-white/50 text-gray-500 uppercase tracking-widest">History</h3>
         {/* Search Input */}
         <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-full text-sm dark:text-white text-gray-800 focus:outline-none focus:ring-1 focus:ring-white/20 w-32 transition-all focus:w-48"
            />
         </div>
      </div>
      
      <div className="space-y-3">
        {sorted.length === 0 ? (
             <div className="text-center py-8 dark:text-white/30 text-gray-400">
                <p>No matches found.</p>
             </div>
        ) : (
            sorted.map((t) => (
                <div key={t.id} className="group relative flex items-center justify-between p-4 glass-card rounded-2xl hover:bg-white/50 dark:hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center gap-4">
                    <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: `${CATEGORY_COLORS[t.category]}` }}
                    >
                    {getCategoryIcon(t.category)}
                    </div>
                    <div>
                    <p className="font-semibold dark:text-white text-gray-900 tracking-tight">{t.merchantName}</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xs dark:text-white/40 text-gray-500">{new Date(t.date).toLocaleDateString('fr-FR')}</p>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20"></span>
                        <p className="text-xs dark:text-white/40 text-gray-500">{t.category}</p>
                    </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <span className={`font-light text-lg tracking-tight ${t.type === TransactionType.EXPENSE ? 'dark:text-white text-gray-900' : 'text-emerald-500 dark:text-emerald-400'}`}>
                    {privacyMode ? '****' : (
                        <>
                        {t.type === TransactionType.EXPENSE ? '-' : '+'}
                        {t.amount.toFixed(2)} €
                        </>
                    )}
                    </span>
                    <button 
                    onClick={() => onDelete(t.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-rose-400 hover:bg-rose-500/10 rounded-full transition-all"
                    title="Delete"
                    >
                    <Trash2 size={16} />
                    </button>
                </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;