import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';

const LOCAL_STORAGE_KEY = 'transactions';
const CATEGORIES_KEY = 'categories';

const defaultCategories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Saúde",
  "Lazer",
  "Educação",
  "Salário",
  "Freelance",
  "Investimentos",
];

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedTransactions ? JSON.parse(storedTransactions) : [];
    } catch (error) {
      console.error("Failed to load transactions from localStorage", error);
      return [];
    }
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const storedCategories = localStorage.getItem(CATEGORIES_KEY);
      return storedCategories ? JSON.parse(storedCategories) : defaultCategories;
    } catch (error) {
      console.error("Failed to load categories from localStorage", error);
      return defaultCategories;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    } catch (error) {
      console.error("Failed to save categories to localStorage", error);
    }
  }, [categories]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions((prev) => [newTransaction, ...prev]);
  };

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories((prev) => [...prev, category]);
    }
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    setCategories((prev) =>
      prev.map((c) => (c === oldCategory ? newCategory : c))
    );
    setTransactions((prev) =>
      prev.map((t) =>
        t.category === oldCategory ? { ...t, category: newCategory } : t
      )
    );
  };

  const deleteCategory = (category: string) => {
    setCategories((prev) => prev.filter((c) => c !== category));
    setTransactions((prev) =>
      prev.filter((t) => t.category !== category)
    );
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};
