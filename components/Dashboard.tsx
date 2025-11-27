
import React, { useMemo, useState } from 'react';
import { Transaction, TransactionType, DateRange } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import BubbleChart from './BubbleChart';
import { PieChart, BarChart3, TrendingUp, TrendingDown, Eye, EyeOff, Plus, Calendar, Trophy, MapPin } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  privacyMode: boolean;
  onTogglePrivacy: () => void;
  onQuickAdd: () => void;
}

const Dashboard: React.FC<Props> = ({ transactions, privacyMode, onTogglePrivacy, onQuickAdd }) => {
  const [activeTab, setActiveTab] = useState<'bubbles' | 'trends'>('bubbles');
  const [dateRange, setDateRange] = useState<DateRange>('1M');

  // Filter Transactions Logic
  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const cutoff = new Date();

    switch (dateRange) {
        case '1W': cutoff.setDate(now.getDate() - 7); break;
        case '1M': cutoff.setMonth(now.getMonth() - 1); break;
        case '3M': cutoff.setMonth(now.getMonth() - 3); break;
        case '6M': cutoff.setMonth(now.getMonth() - 6); break;
        case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
        case 'ALL': return transactions;
    }

    return transactions.filter(t => new Date(t.date) >= cutoff);
  }, [transactions, dateRange]);

  const totalBalance = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      return t.type === TransactionType.INCOME ? acc + t.amount : acc - t.amount;
    }, 0);
  }, [filteredTransactions]);

  const expenses = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.EXPENSE), [filteredTransactions]);
  const income = useMemo(() => filteredTransactions.filter(t => t.type === TransactionType.INCOME), [filteredTransactions]);

  const totalExpenses = expenses.reduce((acc, t) => acc + t.amount, 0);
  const totalIncome = income.reduce((acc, t) => acc + t.amount, 0);

  // Top Merchants Logic
  const topMerchants = useMemo(() => {
      const map = new Map<string, number>();
      expenses.forEach(t => {
          map.set(t.merchantName, (map.get(t.merchantName) || 0) + t.amount);
      });
      return Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5) // Top 5
        .map(([name, amount]) => ({ 
            name, 
            amount, 
            percent: (amount / totalExpenses) * 100 
        }));
  }, [expenses, totalExpenses]);

  // Bar Chart Data (Daily)
  const barData = useMemo(() => {
    const map = new Map<string, number>();
    const sorted = [...expenses].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    sorted.forEach(t => {
        const day = new Date(t.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
        map.set(day, (map.get(day) || 0) + t.amount);
    });
    return Array.from(map.entries()).map(([date, expense]) => ({ date, expense }));
  }, [expenses]);

  // All Time High (ATH) Month Calculation (Based on ALL transactions, not just filtered)
  const athMonth = useMemo(() => {
      const map = new Map<string, number>();
      const allExpenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
      allExpenses.forEach(t => {
          const monthYear = new Date(t.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
          map.set(monthYear, (map.get(monthYear) || 0) + t.amount);
      });
      const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
      return sorted.length > 0 ? { date: sorted[0][0], amount: sorted[0][1] } : null;
  }, [transactions]);

  const ranges: DateRange[] = ['1W', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="space-y-6">
      
      {/* Horizontal Date Filter */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide">
        <div className="bg-white/40 dark:bg-white/5 p-1 rounded-xl flex border border-black/5 dark:border-white/10 mx-auto">
            {ranges.map(r => (
                <button
                    key={r}
                    onClick={() => setDateRange(r)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${dateRange === r ? 'text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}
                    style={dateRange === r ? { backgroundColor: 'var(--theme-color)' } : {}}
                >
                    {r}
                </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Balance Card */}
        <div className="glass-panel rounded-3xl p-8 dark:text-white text-gray-900 relative overflow-hidden group">
            <div 
                className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] opacity-10 dark:opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: 'var(--theme-color)' }}
            ></div>
            
            <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
                <div>
                    <p className="dark:text-white/60 text-gray-500 text-sm font-bold tracking-widest uppercase mb-1">
                        {dateRange === 'ALL' ? 'Total Balance' : `Balance (${dateRange})`}
                    </p>
                    <h2 className="text-5xl font-light tracking-tighter mb-8 flex items-baseline gap-2">
                        {privacyMode ? '****' : totalBalance.toFixed(2)} 
                        <span className="text-2xl opacity-50">€</span>
                    </h2>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={onTogglePrivacy}
                        className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-colors"
                    >
                        {privacyMode ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                    <button 
                        onClick={onQuickAdd}
                        className="p-2 rounded-full text-white transition-transform hover:scale-105 shadow-lg"
                        style={{ backgroundColor: 'var(--theme-color)' }}
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/40 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <TrendingUp size={14} /> Income
                </div>
                <p className="text-lg font-medium">{privacyMode ? '****' : `+${totalIncome.toFixed(0)}`}</p>
                </div>
                <div className="bg-white/40 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
                    <TrendingDown size={14} /> Expense
                </div>
                <p className="text-lg font-medium">{privacyMode ? '****' : `-${totalExpenses.toFixed(0)}`}</p>
                </div>
            </div>
            </div>
        </div>

        {/* Analytics Card */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col min-h-[340px] relative">
            <div className="flex items-center justify-between mb-4">
                <h3 className="dark:text-white/80 text-gray-700 font-medium">Spending Vis</h3>
                <div className="flex bg-black/5 dark:bg-black/20 p-1 rounded-xl border border-black/5 dark:border-white/5">
                    <button 
                        onClick={() => setActiveTab('bubbles')}
                        className={`p-2 rounded-lg transition-all ${activeTab === 'bubbles' ? 'bg-white dark:bg-white/20 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                    >
                        <PieChart size={16} />
                    </button>
                    <button 
                        onClick={() => setActiveTab('trends')}
                        className={`p-2 rounded-lg transition-all ${activeTab === 'trends' ? 'bg-white dark:bg-white/20 shadow-sm text-black dark:text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                    >
                        <BarChart3 size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center">
                {activeTab === 'bubbles' ? (
                    <BubbleChart transactions={filteredTransactions} privacyMode={privacyMode} />
                ) : (
                    <div className="w-full h-full flex flex-col">
                         <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fontSize: 10, fill: 'currentColor', opacity: 0.5 }} 
                                    dy={10}
                                />
                                <YAxis hide />
                                <RechartsTooltip
                                    cursor={{ fill: 'rgba(120,120,120,0.1)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                                />
                                <Bar 
                                    dataKey="expense" 
                                    fill="var(--theme-color)" 
                                    radius={[4, 4, 4, 4]} 
                                    maxBarSize={30} 
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        {/* ATH Indicator */}
                        {athMonth && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 py-2 px-4 rounded-full border border-amber-500/20">
                                <Trophy size={14} />
                                <span>All-time high: {athMonth.date} ({privacyMode ? '****' : `${athMonth.amount.toFixed(0)}€`})</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
      
      {/* Top Merchants Section */}
      {topMerchants.length > 0 && (
          <div className="glass-panel rounded-3xl p-6">
              <h3 className="dark:text-white/80 text-gray-700 font-medium mb-4 flex items-center gap-2">
                  <MapPin size={18} /> Top Merchants
              </h3>
              <div className="space-y-4">
                  {topMerchants.map((m, idx) => (
                      <div key={m.name} className="relative">
                          <div className="flex justify-between items-center text-sm mb-1 z-10 relative">
                              <span className="font-semibold dark:text-white text-gray-800">{idx + 1}. {m.name}</span>
                              <span className="dark:text-white/60 text-gray-500">{privacyMode ? '****' : `${m.amount.toFixed(0)}€`}</span>
                          </div>
                          <div className="h-3 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-1000 ease-out"
                                style={{ 
                                    width: `${m.percent}%`, 
                                    backgroundColor: 'var(--theme-color)',
                                    opacity: 0.7 
                                }}
                              ></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
