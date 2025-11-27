
export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export enum Category {
  GROCERIES = 'Groceries',
  TRANSPORT = 'Transport',
  UTILITIES = 'Utilities',
  SHOPPING = 'Shopping',
  RESTAURANT = 'Restaurant',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health',
  HOUSING = 'Housing',
  SALARY = 'Salary',
  OTHER = 'Other'
}

export interface Merchant {
  id: string;
  name: string;
  defaultCategory: Category;
  logo?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category;
  merchantName: string; // Can be a known merchant or custom
  date: string;
  notes?: string;
}

export interface FinancialInsight {
  title: string;
  content: string;
  tone: 'positive' | 'warning' | 'neutral';
}

// F&F Section Types
export enum DebtType {
  I_OWE = 'I_OWE',
  OWED_TO_ME = 'OWED_TO_ME'
}

export interface Debt {
  id: string;
  personName: string;
  amount: number;
  type: DebtType;
  description: string;
  date: string;
  isSettled: boolean;
}

// Group Events Types
export interface GroupExpense {
    id: string;
    description: string;
    amount: number;
    paidBy: string;
    date: string;
}

export interface GroupEvent {
    id: string;
    title: string;
    type: 'trip' | 'party' | 'dinner' | 'other';
    participants: string[];
    expenses: GroupExpense[];
    date: string;
    currency?: string; // e.g. 'EUR', 'MAD', 'USD'
}

export type Theme = 'ocean' | 'sunset' | 'nature' | 'nebula';

export type DateRange = '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
