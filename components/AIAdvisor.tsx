import React, { useState } from 'react';
import { Transaction, FinancialInsight } from '../types';
import { getFinancialInsights } from '../services/geminiService';
import { Sparkles, RefreshCw } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<Props> = ({ transactions }) => {
  const [insight, setInsight] = useState<FinancialInsight | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (transactions.length === 0) return;
    setLoading(true);
    const result = await getFinancialInsights(transactions);
    setInsight(result);
    setLoading(false);
  };

  if (!insight && !loading) {
    return (
      <div className="mb-8">
        <button 
          onClick={handleGenerate}
          disabled={transactions.length === 0}
          className="w-full bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-3xl p-1 shadow-lg shadow-fuchsia-500/20 group overflow-hidden"
        >
          <div className="bg-white/10 backdrop-blur-sm rounded-[20px] px-6 py-4 flex items-center justify-center gap-3 transition-all group-hover:bg-white/20">
            <Sparkles className="animate-pulse" />
            <span className="font-semibold text-lg">Surprise me with Financial Insights</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="mb-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500 rounded-full blur-[80px] opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-40"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white/10 rounded-xl">
               {loading ? <RefreshCw className="animate-spin text-fuchsia-300" size={20} /> : <Sparkles className="text-fuchsia-300" size={20} />}
            </div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">AI Financial Coach</span>
          </div>
          {!loading && (
             <button onClick={handleGenerate} className="text-xs text-gray-400 hover:text-white transition-colors underline">
                Refresh
             </button>
          )}
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3 py-4">
             <div className="h-4 bg-white/10 rounded w-3/4"></div>
             <div className="h-4 bg-white/10 rounded w-1/2"></div>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 to-indigo-200 mb-2">
              {insight?.title}
            </h4>
            <p className="text-gray-300 leading-relaxed">
              {insight?.content}
            </p>
            <div className={`mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                insight?.tone === 'warning' ? 'bg-red-500/20 text-red-200' :
                insight?.tone === 'positive' ? 'bg-emerald-500/20 text-emerald-200' :
                'bg-gray-500/20 text-gray-200'
            }`}>
                {insight?.tone === 'warning' ? '⚠️ Caution' : insight?.tone === 'positive' ? '🚀 Doing Great' : 'ℹ️ Insight'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisor;