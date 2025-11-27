
import React, { useState, useMemo } from 'react';
import { GroupEvent, GroupExpense } from '../types';
import { Plus, Calendar, Users, Share2, Receipt, X, ArrowRight, Plane, PartyPopper, Utensils, Scale, Coins } from 'lucide-react';

interface Props {
    events: GroupEvent[];
    onAddEvent: (event: GroupEvent) => void;
    onUpdateEvent: (event: GroupEvent) => void;
    onDeleteEvent: (id: string) => void;
    privacyMode: boolean;
}

const CURRENCIES = [
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'MAD', symbol: 'DH', name: 'Moroccan Dirham' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
];

// Expanded palette for better distinction
const COLORS = [
    '#EF4444', // Red
    '#F97316', // Orange
    '#F59E0B', // Amber
    '#84CC16', // Lime
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#0EA5E9', // Sky
    '#3B82F6', // Blue
    '#6366F1', // Indigo
    '#8B5CF6', // Violet
    '#D946EF', // Fuchsia
    '#EC4899', // Pink
    '#F43F5E', // Rose
    '#A8A29E', // Stone
];

const getColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return COLORS[Math.abs(hash) % COLORS.length];
};

const GroupEvents: React.FC<Props> = ({ events, onAddEvent, onUpdateEvent, onDeleteEvent, privacyMode }) => {
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [viewMode, setViewMode] = useState<'expenses' | 'balances'>('expenses');

    // Create Event Form
    const [newTitle, setNewTitle] = useState('');
    const [newType, setNewType] = useState<GroupEvent['type']>('trip');
    const [newParticipants, setNewParticipants] = useState('');
    const [newCurrency, setNewCurrency] = useState('EUR');

    // Add Expense Form
    const [expDesc, setExpDesc] = useState('');
    const [expAmount, setExpAmount] = useState('');
    const [expPayer, setExpPayer] = useState('');

    const selectedEvent = events.find(e => e.id === selectedEventId);
    const currencySymbol = CURRENCIES.find(c => c.code === (selectedEvent?.currency || 'EUR'))?.symbol || '€';

    const handleCreateEvent = (e: React.FormEvent) => {
        e.preventDefault();
        const participants = newParticipants.split(',').map(s => s.trim()).filter(s => s !== '');
        const event: GroupEvent = {
            id: Date.now().toString(),
            title: newTitle,
            type: newType,
            participants: ['Me', ...participants],
            expenses: [],
            date: new Date().toISOString(),
            currency: newCurrency
        };
        onAddEvent(event);
        setNewTitle('');
        setNewParticipants('');
        setNewCurrency('EUR');
        setShowCreateModal(false);
    };

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;
        
        const expense: GroupExpense = {
            id: Date.now().toString(),
            description: expDesc,
            amount: parseFloat(expAmount),
            paidBy: expPayer || 'Me',
            date: new Date().toISOString()
        };

        const updatedEvent = {
            ...selectedEvent,
            expenses: [expense, ...selectedEvent.expenses]
        };
        onUpdateEvent(updatedEvent);
        setExpDesc('');
        setExpAmount('');
        setShowExpenseModal(false);
    };

    const handleShare = () => {
        if (!selectedEvent) return;
        const total = selectedEvent.expenses.reduce((sum, ex) => sum + ex.amount, 0);
        const perPerson = total / selectedEvent.participants.length;
        const symbol = CURRENCIES.find(c => c.code === (selectedEvent.currency || 'EUR'))?.symbol || '€';
        
        const text = `💸 *${selectedEvent.title}* Summary\nTotal: ${total.toFixed(2)}${symbol}\nPer Person: ${perPerson.toFixed(2)}${symbol}\n\nSent via Z-Finance`;
        navigator.clipboard.writeText(text);
        alert("Summary copied to clipboard!");
    };

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'trip': return <Plane size={24} />;
            case 'party': return <PartyPopper size={24} />;
            case 'dinner': return <Utensils size={24} />;
            default: return <Calendar size={24} />;
        }
    };

    // Calculate Settlements (Simple Debt Simplification)
    const settlements = useMemo(() => {
        if (!selectedEvent) return [];
        const balances: Record<string, number> = {};
        selectedEvent.participants.forEach(p => balances[p] = 0);
        
        const totalSpent = selectedEvent.expenses.reduce((sum, e) => sum + e.amount, 0);
        const share = totalSpent / selectedEvent.participants.length;

        selectedEvent.expenses.forEach(e => {
            balances[e.paidBy] += e.amount;
        });

        selectedEvent.participants.forEach(p => {
            balances[p] -= share;
        });

        const debtors = [];
        const creditors = [];

        for (const [person, amount] of Object.entries(balances)) {
            if (amount < -0.01) debtors.push({ person, amount });
            if (amount > 0.01) creditors.push({ person, amount });
        }
        
        debtors.sort((a, b) => a.amount - b.amount);
        creditors.sort((a, b) => b.amount - a.amount);
        
        const results = [];
        let i = 0, j = 0;
        
        while (i < debtors.length && j < creditors.length) {
            const debtor = debtors[i];
            const creditor = creditors[j];
            const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
            
            results.push({ from: debtor.person, to: creditor.person, amount });
            
            debtor.amount += amount;
            creditor.amount -= amount;
            
            if (Math.abs(debtor.amount) < 0.01) i++;
            if (creditor.amount < 0.01) j++;
        }
        return results;
    }, [selectedEvent]);

    // Main View: List of Events
    if (!selectedEventId) {
        return (
            <div className="space-y-6 pb-24">
                <div className="glass-panel rounded-3xl p-6 text-center relative overflow-hidden">
                    <div 
                        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] opacity-20"
                        style={{ backgroundColor: 'var(--theme-color)' }}
                    ></div>
                    <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-2">Group Splits</h2>
                    <p className="dark:text-white/60 text-gray-500 text-sm">Organize trips, parties, and shared costs effortlessly.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(ev => {
                        const total = ev.expenses.reduce((sum, e) => sum + e.amount, 0);
                        const sym = CURRENCIES.find(c => c.code === (ev.currency || 'EUR'))?.symbol || '€';
                        return (
                            <button 
                                key={ev.id}
                                onClick={() => setSelectedEventId(ev.id)}
                                className="glass-card p-6 rounded-3xl text-left hover:bg-white/50 dark:hover:bg-white/10 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-4 right-4 text-white/20 group-hover:text-white/40 transition-colors">
                                    <ArrowRight />
                                </div>
                                <div 
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg"
                                    style={{ backgroundColor: 'var(--theme-color)' }}
                                >
                                    {getTypeIcon(ev.type)}
                                </div>
                                <h3 className="text-xl font-bold dark:text-white text-gray-900">{ev.title}</h3>
                                <div className="flex items-center gap-2 mt-2 text-sm dark:text-white/60 text-gray-500">
                                    <Users size={14} />
                                    <span>{ev.participants.length} people</span>
                                </div>
                                <div className="mt-4 font-mono text-2xl font-light dark:text-white text-gray-900">
                                    {privacyMode ? '****' : `${total.toFixed(0)}${sym}`}
                                </div>
                            </button>
                        );
                    })}

                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="glass-card p-6 rounded-3xl border-dashed border-2 border-gray-300 dark:border-white/10 flex flex-col items-center justify-center gap-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors min-h-[200px]"
                    >
                        <Plus size={40} />
                        <span className="font-semibold">Create Event</span>
                    </button>
                </div>

                {/* Create Modal */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="glass-panel w-full max-w-md rounded-3xl p-6 animate-zoom-in relative">
                             <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50"><X size={20} /></button>
                             <h3 className="text-xl font-bold mb-4 dark:text-white text-gray-900">New Event</h3>
                             <form onSubmit={handleCreateEvent} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Title</label>
                                    <input 
                                        value={newTitle} onChange={e => setNewTitle(e.target.value)} required
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Paris Trip 2025"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Currency</label>
                                        <div className="relative mt-1">
                                            <select
                                                value={newCurrency}
                                                onChange={e => setNewCurrency(e.target.value)}
                                                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                                            >
                                                {CURRENCIES.map(c => <option key={c.code} value={c.code} className="text-black">{c.code} ({c.symbol})</option>)}
                                            </select>
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500"><Coins size={14}/></div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Type</label>
                                        <select
                                            value={newType}
                                            onChange={e => setNewType(e.target.value as any)}
                                            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20 mt-1 appearance-none"
                                        >
                                            <option value="trip" className="text-black">Trip</option>
                                            <option value="party" className="text-black">Party</option>
                                            <option value="dinner" className="text-black">Dinner</option>
                                            <option value="other" className="text-black">Other</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Participants (comma separated)</label>
                                    <input 
                                        value={newParticipants} onChange={e => setNewParticipants(e.target.value)}
                                        className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                                        placeholder="Alex, Sarah, Tom"
                                    />
                                    <p className="text-[10px] opacity-50 mt-1 pl-1">You are automatically added.</p>
                                </div>
                                <button type="submit" className="w-full py-3 rounded-xl text-white font-bold mt-4" style={{ backgroundColor: 'var(--theme-color)' }}>Create</button>
                             </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Detail View
    const totalCost = selectedEvent?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;

    return (
        <div className="space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => setSelectedEventId(null)} className="p-2 glass-card rounded-full hover:bg-white/10"><ArrowRight className="rotate-180" /></button>
                <div className="flex-1">
                    <h2 className="text-2xl font-bold dark:text-white text-gray-900 leading-tight">{selectedEvent?.title}</h2>
                    <p className="text-xs dark:text-white/50 text-gray-500 font-bold tracking-wider uppercase mt-1">
                        {selectedEvent?.currency || 'EUR'} • {new Date(selectedEvent?.date || '').toLocaleDateString()}
                    </p>
                </div>
                <button onClick={handleShare} className="p-2 glass-card rounded-full hover:bg-white/10 text-emerald-500"><Share2 size={20} /></button>
                <button onClick={() => { if(confirm('Delete event?')) { onDeleteEvent(selectedEvent!.id); setSelectedEventId(null); } }} className="p-2 glass-card rounded-full hover:bg-white/10 text-rose-500"><X size={20} /></button>
            </div>

            {/* Stats */}
            <div className="glass-panel rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20" style={{ backgroundColor: 'var(--theme-color)' }}></div>
                <div className="relative z-10 flex justify-between items-end">
                    <div>
                        <p className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500 mb-1">Total Cost</p>
                        <h3 className="text-4xl font-light dark:text-white text-gray-900">{privacyMode ? '****' : `${totalCost.toFixed(2)}${currencySymbol}`}</h3>
                    </div>
                    <div className="text-right">
                         <div className="flex -space-x-2 mb-2 justify-end">
                            {selectedEvent?.participants.slice(0, 5).map((p, i) => (
                                <div 
                                    key={i} 
                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-black flex items-center justify-center text-xs font-bold text-white shadow-sm"
                                    style={{ backgroundColor: getColor(p) }}
                                    title={p}
                                >
                                    {p.charAt(0)}
                                </div>
                            ))}
                         </div>
                         <p className="text-xs dark:text-white/50 text-gray-500">Split by {selectedEvent?.participants.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-gray-200/50 dark:bg-white/5 p-1 rounded-2xl backdrop-blur-md border border-white/20 dark:border-white/10">
                <button onClick={() => setViewMode('expenses')} className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'expenses' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500'}`}>
                    Expenses
                </button>
                <button onClick={() => setViewMode('balances')} className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${viewMode === 'balances' ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-sm' : 'text-gray-500'}`}>
                    Balances
                </button>
            </div>

            {/* Content */}
            {viewMode === 'expenses' ? (
                <div className="space-y-3">
                    {selectedEvent?.expenses.length === 0 ? (
                        <div className="text-center py-12 opacity-50"><Receipt size={40} className="mx-auto mb-2"/> No expenses yet.</div>
                    ) : (
                        selectedEvent?.expenses.map(ex => (
                            <div key={ex.id} className="glass-card p-4 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold dark:text-white text-gray-900">{ex.description}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getColor(ex.paidBy) }}></div>
                                        <p className="text-xs dark:text-white/50 text-gray-500">
                                            Paid by <span className="font-bold" style={{ color: getColor(ex.paidBy) }}>{ex.paidBy}</span>
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-medium dark:text-white text-gray-900">{privacyMode ? '****' : `${ex.amount.toFixed(2)}${currencySymbol}`}</span>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {settlements.length === 0 ? (
                        <div className="text-center py-12 opacity-50"><Scale size={40} className="mx-auto mb-2"/> Everyone is settled up!</div>
                    ) : (
                        settlements.map((s, idx) => (
                            <div key={idx} className="glass-card p-4 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: getColor(s.from) }}>{s.from.charAt(0)}</div>
                                        <div className="h-0.5 w-6 bg-gray-300 dark:bg-white/20 mx-1"></div>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: getColor(s.to) }}>{s.to.charAt(0)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold dark:text-white text-gray-900"><span style={{color: getColor(s.from)}}>{s.from}</span> owes <span style={{color: getColor(s.to)}}>{s.to}</span></p>
                                    </div>
                                </div>
                                <span className="font-mono font-bold text-emerald-500">{privacyMode ? '****' : `${s.amount.toFixed(2)}${currencySymbol}`}</span>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Add Expense Button */}
             <button 
                onClick={() => setShowExpenseModal(true)}
                className="fixed bottom-24 right-6 w-14 h-14 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-40"
                style={{ backgroundColor: 'var(--theme-color)' }}
            >
                <Plus size={24} />
            </button>

            {/* Add Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel w-full max-w-md rounded-3xl p-6 animate-zoom-in relative">
                            <button onClick={() => setShowExpenseModal(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-gray-500 dark:text-white/50"><X size={20} /></button>
                            <h3 className="text-xl font-bold mb-4 dark:text-white text-gray-900">Add Expense</h3>
                            <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Description</label>
                                <input 
                                    value={expDesc} onChange={e => setExpDesc(e.target.value)} required
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="Dinner, Tickets..."
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Amount ({currencySymbol})</label>
                                <input 
                                    type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} required
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase dark:text-gray-400 text-gray-500">Paid By</label>
                                <select 
                                    value={expPayer} onChange={e => setExpPayer(e.target.value)}
                                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
                                >
                                    <option value="" disabled className="text-gray-500">Select person</option>
                                    {selectedEvent?.participants.map(p => <option key={p} value={p} className="text-black">{p}</option>)}
                                </select>
                            </div>
                            <button type="submit" className="w-full py-3 rounded-xl text-white font-bold mt-4" style={{ backgroundColor: 'var(--theme-color)' }}>Add Expense</button>
                            </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupEvents;
