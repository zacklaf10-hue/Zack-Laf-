import React, { useMemo } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  transactions: Transaction[];
  privacyMode: boolean;
}

const BubbleChart: React.FC<Props> = ({ transactions, privacyMode }) => {
  const data = useMemo(() => {
    const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const map = new Map<Category, number>();
    let total = 0;
    expenses.forEach(t => {
      map.set(t.category, (map.get(t.category) || 0) + t.amount);
      total += t.amount;
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({ 
        name, 
        value, 
        percent: (value / total) * 100 
      }))
      .sort((a, b) => b.value - a.value); // Sort biggest to smallest
  }, [transactions]);

  if (data.length === 0) return (
    <div className="h-64 flex items-center justify-center dark:text-white/40 text-gray-400 italic">
        No spending data to visualize
    </div>
  );

  // Simple layout logic for bubbles
  // We'll map the top 5-6 categories, others grouped or smaller
  const topData = data.slice(0, 6);

  return (
    <div className="relative h-72 w-full flex items-center justify-center overflow-hidden">
      {topData.map((item, index) => {
        // Calculate size based on percentage (min 60px, max 140px)
        const size = Math.max(70, Math.min(150, item.percent * 3));
        
        // Colors
        const color = CATEGORY_COLORS[item.name];

        return (
          <div
            key={item.name}
            className="absolute rounded-full flex flex-col items-center justify-center text-center p-2 shadow-lg backdrop-blur-md border border-white/20 dark:border-white/10 hover:scale-105 transition-transform duration-300 cursor-default"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: `${color}90`, // 90% opacity hex
              boxShadow: `0 8px 32px 0 ${color}40`,
              zIndex: 10 - index,
              // Simple manual positioning for top 5 to avoid complex physics engine
              // This is a "packed" heuristic
              left: index === 0 ? '50%' : index % 2 === 0 ? `${20 + (index * 10)}%` : `${80 - (index * 10)}%`,
              top: index === 0 ? '50%' : index < 3 ? '30%' : '70%',
              transform: 'translate(-50%, -50%)',
              marginLeft: index === 0 ? 0 : (index % 2 === 0 ? -20 : 20), // Nudge
            }}
          >
            <span className="text-xs font-bold text-white drop-shadow-md truncate max-w-full px-1">
              {item.name}
            </span>
            {!privacyMode && (
                <span className="text-[10px] font-medium text-white/90">
                {Math.round(item.percent)}%
                </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default BubbleChart;