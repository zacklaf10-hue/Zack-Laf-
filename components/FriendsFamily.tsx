
import React, { useState } from 'react';
import { Debt, DebtType } from '../types';
import { Plus, Check, ArrowRight, ArrowLeft, Users, Trash2, X } from 'lucide-react';

interface Props {
  debts: Debt[];
  onAdd: (debt: Debt) => void;
  onSettle: (id: string) => void;
  onDelete: (id: string) => void;
  privacyMode: boolean;
}

const FriendsFamily: React.FC<Props> = ({ debts, onAdd, onSettle, onDelete, privacyMode }) => {
  const [activeTab, setActiveTab] = useState<DebtType>(DebtType.OWED_TO_ME);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form State
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');

  const filteredDebts = debts.filter(d => d.type === activeTab && !d.isSettled);
  const totalAmount = filteredDebts.reduce((acc, d) => acc + d.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person || !amount) return;
    
    const newDebt: Debt = {
        id: Date.now().toString(),
        personName: person,
        amount: parseFloat(amount),
        description: desc,
        type: activeTab,
        date: new Date().toISOString(),
        isSettled: false
    };
    onAdd(newDebt);
    setPerson('');
    setAmount('');
    setDesc('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-24">
      
      {/* Header Summary */}
      <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
        <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20"
            style={{ backgroundColor: 'var(--theme-color)' }}
        ></div>
        <div className="relative z-10 text-center">
            <h2 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">
                {activeTab === DebtType.OWED_TO_ME ? 'Total Owed To You' : 'Total You Owe'}
            </h2>
            <div className="text-5xl font-light tracking-tighter text-gray-900 dark:text-white">
                {privacyMode ? '****' : totalAmount.toFixed(2)} <span className="text-2xl opacity-50">€</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-200/50 dark:bg-white/5 p-1 rounded-2xl backdrop-blur-md border border-white/20 dark:border-white/10">
        <button
            onClick={() => setActiveTab(DebtType.OWED_TO_ME)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === DebtType.OWED_TO_ME ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
            <span className="flex items-center justify-center gap-2">
                <ArrowLeft size={16} className="text-emerald-500 dark:text-emerald-400" /> Owed to Me
            </span>
        </button>
        <button
            onClick={() => setActiveTab(DebtType.I_OWE)}
            className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${activeTab === DebtType.I_OWE ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
            <span className="flex items-center justify-center gap-2">
                 I Owe <ArrowRight size={16} className="text-rose-500 dark:text-rose-400" />
            </span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
            <div className="text-center py-12 dark:text-white/30 text-gray-400">
                <Users size={48} className="mx-auto mb-4 opacity-50" />
                <p>No active debts in this category.</p>
            </div>
        ) : (
            filteredDebts.map(debt => (
                <div key={debt.id} className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:bg-white/50 dark:hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${debt.type === DebtType.OWED_TO_ME ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' : 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300'}`}>
                            {debt.personName.charAt(0)}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{debt.personName}</p>
                            <p className="text-xs text-gray-500 dark:text-white/50">{debt.description || 'No description'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-lg font-medium dark:text-white text-gray-900">{privacyMode ? '****' : `${debt.amount.toFixed(0)}€`}</span>
                        <div className="flex gap-2">
                             <button 
                                onClick={() => onSettle(debt.id)}
                                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-emerald-500/50 text-emerald-500 dark:text-emerald-300 transition-colors"
                                title="Mark Settled"
                            >
                                <Check size={16} />
                            </button>
                            <button 
                                onClick={() => onDelete(debt.id)}
                                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-red-500/50 text-red-500 dark:text-red-300 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                       
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Add Button */}
      <button 
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
        style={{ backgroundColor: 'var(--theme-color)' }}
      >
        <Plus size={24} />
      </button>

      {/* Floating Add Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            {/* Switched animation to zoom-in to avoid moving issue */}
            <div className="glass-panel w-full max-w-md rounded-3xl p-6 animate-zoom-in relative">
                <button 
                    onClick={() => setShowAddForm(false)}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50 transition-colors"
                >
                    <X size={20} />
                </button>
                <h3 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Add New Debt</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Person</label>
                        <input 
                            value={person}
                            onChange={e => setPerson(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Name"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Amount (€)</label>
                        <input 
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">For what?</label>
                        <input 
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                            placeholder="Dinner, Tickets..."
                        />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button 
                            type="submit" 
                            className="w-full py-3 rounded-xl text-white font-bold hover:brightness-110 transition-all"
                            style={{ backgroundColor: 'var(--theme-color)' }}
                        >
                            Add
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default FriendsFamily;
