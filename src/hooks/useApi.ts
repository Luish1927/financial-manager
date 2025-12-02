import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Detectar automaticamente se está em produção (Vercel) ou desenvolvimento (localhost)
const API_URL = import.meta.env.PROD
  ? '/api'  // Em produção, usa o mesmo domínio
  : 'http://localhost:3001/api';  // Em desenvolvimento, usa o backend local

export const useApi = () => {
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Função auxiliar para tratar erros de autenticação
  const handleResponse = async (response: Response) => {
    if (response.status === 401 || response.status === 403) {
      toast({
        title: "Sessão expirada",
        description: "Por favor, faça login novamente.",
        variant: "destructive",
      });
      logout();
      throw new Error('Sessão expirada');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return data;
  };

  // Carregar dados iniciais
  useEffect(() => {
    if (token) {
      loadAllData();
    }
  }, [token]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTransactions(),
        loadCategories(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/transactions`, { headers });
      const data = await handleResponse(response);
      setTransactions(data);
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao carregar transações",
          variant: "destructive",
        });
      }
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, { headers });
      const data = await handleResponse(response);
      setCategories(data);
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao carregar categorias",
          variant: "destructive",
        });
      }
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`, { headers });
      const data = await handleResponse(response);
      setMonthlyLimit(data.monthlyLimit);
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações",
          variant: "destructive",
        });
      }
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(transaction),
      });
      const newTransaction = await handleResponse(response);
      setTransactions((prev) => [newTransaction, ...prev]);
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao adicionar transação",
          variant: "destructive",
        });
      }
    }
  };

  const updateTransaction = async (transaction: Transaction) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${transaction.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(transaction),
      });
      const updatedTransaction = await handleResponse(response);
      setTransactions((prev) =>
        prev.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t))
      );
      toast({
        title: "Sucesso",
        description: "Transação atualizada com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao atualizar transação",
          variant: "destructive",
        });
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers,
      });
      await handleResponse(response);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      toast({
        title: "Sucesso",
        description: "Transação deletada com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao deletar transação",
          variant: "destructive",
        });
      }
    }
  };

  const addCategory = async (category: string) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: category }),
      });
      await handleResponse(response);
      setCategories((prev) => [...prev, category]);
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao adicionar categoria",
          variant: "destructive",
        });
      }
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    try {
      const response = await fetch(`${API_URL}/categories/${encodeURIComponent(oldCategory)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ newName: newCategory }),
      });
      await handleResponse(response);
      setCategories((prev) =>
        prev.map((c) => (c === oldCategory ? newCategory : c))
      );
      setTransactions((prev) =>
        prev.map((t) =>
          t.category === oldCategory ? { ...t, category: newCategory } : t
        )
      );
      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao atualizar categoria",
          variant: "destructive",
        });
      }
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const response = await fetch(`${API_URL}/categories/${encodeURIComponent(category)}`, {
        method: 'DELETE',
        headers,
      });
      await handleResponse(response);
      setCategories((prev) => prev.filter((c) => c !== category));
      setTransactions((prev) => prev.filter((t) => t.category !== category));
      toast({
        title: "Sucesso",
        description: "Categoria deletada com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao deletar categoria",
          variant: "destructive",
        });
      }
    }
  };

  const updateMonthlyLimit = async (limit: number) => {
    try {
      const response = await fetch(`${API_URL}/settings/monthly-limit`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ monthlyLimit: limit }),
      });
      await handleResponse(response);
      setMonthlyLimit(limit);
      toast({
        title: "Sucesso",
        description: "Limite mensal atualizado com sucesso",
      });
    } catch (error: any) {
      if (error.message !== 'Sessão expirada') {
        toast({
          title: "Erro",
          description: "Erro ao atualizar limite mensal",
          variant: "destructive",
        });
      }
    }
  };

  return {
    transactions,
    categories,
    monthlyLimit,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addCategory,
    updateCategory,
    deleteCategory,
    updateMonthlyLimit,
  };
};
