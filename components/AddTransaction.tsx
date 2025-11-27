import React, { useState, useEffect, useRef } from 'react';
import { Category, TransactionType, Merchant } from '../types';
import { FRENCH_MERCHANTS } from '../constants';
import { predictCategory } from '../services/geminiService';
import { Plus, Loader2, Sparkles, ChevronDown } from 'lucide-react';

interface Props {
  onAdd: (amount: number, type: TransactionType, category: Category, merchant: string) => void;
}

const AddTransaction: React.FC<Props> = ({ onAdd }) => {
  const [amount, setAmount] = useState('');
  const [merchantInput, setMerchantInput] = useState('');
  const [category, setCategory] = useState<Category>(Category.GROCERIES);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [suggestions, setSuggestions] = useState<Merchant[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const handleMerchantChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMerchantInput(val);
    if (val.length > 0) {
      const filtered = FRENCH_MERCHANTS.filter(m => 
        m.name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectMerchant = (m: Merchant) => {
    setMerchantInput(m.name);
    setCategory(m.defaultCategory);
    setShowSuggestions(false);
  };

  const handleMagicPredict = async () => {
      if(!merchantInput || !amount) return;
      setIsPredicting(true);
      const predictedCatName = await predictCategory(merchantInput, parseFloat(amount));
      
      if (predictedCatName) {
        const enumKey = Object.keys(Category).find(key => Category[key as keyof typeof Category] === predictedCatName);
        if (enumKey) {
             setCategory(Category[enumKey as keyof typeof Category]);
        }
      }
      setIsPredicting(false);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !merchantInput) return;
    onAdd(parseFloat(amount), type, category, merchantInput);
    setAmount('');
    setMerchantInput('');
    setType(TransactionType.EXPENSE);
    setCategory(Category.GROCERIES);
  };

  return (
    <div className="glass-panel rounded-3xl p-6 relative overflow-visible">
        {/* Subtle glow effect */}
        <div 
            className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[40px] opacity-20 pointer-events-none"
            style={{ backgroundColor: 'var(--theme-color)' }}
        ></div>

      <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-6 flex items-center gap-2 relative z-10">
        <span className="bg-black/5 dark:bg-white/10 dark:text-white text-gray-900 p-2 rounded-xl border border-black/5 dark:border-white/10">
            <Plus size={20} />
        </span>
        New Entry
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
        
        {/* Type Toggle */}
        <div className="flex p-1 bg-gray-200/50 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/5">
          <button
            type="button"
            onClick={() => setType(TransactionType.EXPENSE)}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-white/10 text-black dark:text-white shadow-lg border border-transparent dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType(TransactionType.INCOME)}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${type === TransactionType.INCOME ? 'bg-emerald-100 dark:bg-white/10 text-emerald-600 dark:text-emerald-400 shadow-lg border border-transparent dark:border-white/10' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div className="relative">
          <div className="relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/50 font-semibold group-focus-within:text-gray-900 dark:group-focus-within:text-white transition-colors">€</span>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-white/20 outline-none transition-all font-bold text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Merchant */}
        <div className="relative" ref={wrapperRef}>
          <input
            type="text"
            value={merchantInput}
            onChange={handleMerchantChange}
            className="w-full px-4 py-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-white/20 outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20"
            placeholder="Merchant (e.g. Carrefour)"
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 left-0 right-0 mt-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl max-h-60 overflow-y-auto py-2">
              {suggestions.map((m) => (
                <li 
                  key={m.id}
                  onClick={() => selectMerchant(m)}
                  className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/10 cursor-pointer text-sm text-gray-800 dark:text-gray-200 font-medium flex justify-between items-center transition-colors"
                >
                    <span>{m.name}</span>
                    <span className="text-xs text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">{m.defaultCategory}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category & Magic */}
        <div className="flex gap-3">
            <div className="relative flex-1">
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full px-4 py-4 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl focus:bg-white dark:focus:bg-white/10 focus:ring-2 focus:ring-white/20 outline-none transition-all text-sm font-semibold text-gray-900 dark:text-white cursor-pointer appearance-none"
                >
                    {Object.values(Category).map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-gray-900">{c}</option>
                    ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/40 pointer-events-none" size={16} />
            </div>
            
            <button 
                type="button" 
                onClick={handleMagicPredict}
                disabled={isPredicting || !merchantInput}
                className="bg-black/5 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 p-4 rounded-2xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-black/5 dark:border-white/10"
                style={{ color: 'var(--theme-color)' }}
                title="AI Auto-Categorize"
            >
                {isPredicting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
            </button>
        </div>

        <button
          type="submit"
          className="w-full py-4 text-white font-bold rounded-2xl shadow-lg hover:brightness-110 transition-all transform active:scale-[0.98] mt-2"
          style={{ backgroundColor: 'var(--theme-color)' }}
        >
          Add Entry
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;