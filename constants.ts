
import { Category, Merchant, Transaction, TransactionType } from './types';

export const FRENCH_MERCHANTS: Merchant[] = [
  // Supermarkets
  { id: 'm1', name: 'Carrefour', defaultCategory: Category.GROCERIES },
  { id: 'm2', name: 'E.Leclerc', defaultCategory: Category.GROCERIES },
  { id: 'm3', name: 'Intermarché', defaultCategory: Category.GROCERIES },
  { id: 'm4', name: 'Lidl', defaultCategory: Category.GROCERIES },
  { id: 'm5', name: 'Auchan', defaultCategory: Category.GROCERIES },
  { id: 'm6', name: 'Monoprix', defaultCategory: Category.GROCERIES },
  { id: 'm7', name: 'Franprix', defaultCategory: Category.GROCERIES },
  { id: 'm8', name: 'Picard', defaultCategory: Category.GROCERIES },
  
  // Transport
  { id: 'm9', name: 'RATP', defaultCategory: Category.TRANSPORT },
  { id: 'm10', name: 'SNCF', defaultCategory: Category.TRANSPORT },
  { id: 'm11', name: 'TotalEnergies', defaultCategory: Category.TRANSPORT },
  { id: 'm12', name: 'Uber', defaultCategory: Category.TRANSPORT },
  { id: 'm13', name: 'Blablacar', defaultCategory: Category.TRANSPORT },

  // Utilities & Telecom
  { id: 'm14', name: 'EDF', defaultCategory: Category.UTILITIES },
  { id: 'm15', name: 'Engie', defaultCategory: Category.UTILITIES },
  { id: 'm16', name: 'Orange', defaultCategory: Category.UTILITIES },
  { id: 'm17', name: 'Free', defaultCategory: Category.UTILITIES },
  { id: 'm18', name: 'SFR', defaultCategory: Category.UTILITIES },
  { id: 'm19', name: 'Bouygues Telecom', defaultCategory: Category.UTILITIES },
  { id: 'm20', name: 'Veolia', defaultCategory: Category.UTILITIES },

  // Shopping & Retail
  { id: 'm21', name: 'Amazon FR', defaultCategory: Category.SHOPPING },
  { id: 'm22', name: 'Fnac', defaultCategory: Category.SHOPPING },
  { id: 'm23', name: 'Darty', defaultCategory: Category.SHOPPING },
  { id: 'm24', name: 'Decathlon', defaultCategory: Category.SHOPPING },
  { id: 'm25', name: 'Leroy Merlin', defaultCategory: Category.HOUSING },
  { id: 'm26', name: 'Castorama', defaultCategory: Category.HOUSING },
  { id: 'm27', name: 'IKEA', defaultCategory: Category.HOUSING },
  { id: 'm28', name: 'Zara', defaultCategory: Category.SHOPPING },
  { id: 'm29', name: 'H&M', defaultCategory: Category.SHOPPING },
  { id: 'm30', name: 'Sephora', defaultCategory: Category.HEALTH },

  // Food
  { id: 'm31', name: 'Deliveroo', defaultCategory: Category.RESTAURANT },
  { id: 'm32', name: 'Uber Eats', defaultCategory: Category.RESTAURANT },
  { id: 'm33', name: 'McDonald\'s', defaultCategory: Category.RESTAURANT },
  { id: 'm34', name: 'Burger King', defaultCategory: Category.RESTAURANT },
  
  // Services
  { id: 'm35', name: 'Doctolib', defaultCategory: Category.HEALTH },
  { id: 'm36', name: 'La Poste', defaultCategory: Category.OTHER },
];

// START AS NEW APP - NO DATA
export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.GROCERIES]: '#10b981', // emerald-500
  [Category.TRANSPORT]: '#3b82f6', // blue-500
  [Category.UTILITIES]: '#f59e0b', // amber-500
  [Category.SHOPPING]: '#ec4899', // pink-500
  [Category.RESTAURANT]: '#ef4444', // red-500
  [Category.ENTERTAINMENT]: '#8b5cf6', // violet-500
  [Category.HEALTH]: '#06b6d4', // cyan-500
  [Category.HOUSING]: '#6366f1', // indigo-500
  [Category.SALARY]: '#22c55e', // green-500
  [Category.OTHER]: '#94a3b8', // slate-400
};
