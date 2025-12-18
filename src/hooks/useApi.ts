import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { Category } from '@/types/category';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Detectar automaticamente se está em produção (Vercel) ou desenvolvimento (localhost)
const API_URL = import.meta.env.PROD
  ? '/api'  // Em produção, usa o mesmo domínio (Vercel)
  : 'http://localhost:3000/api';  // Em desenvolvimento, usa Vercel Dev na porta 3000

export const useApi = () => {
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
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

  // Helper: mostra notificação de erro (exceto para sessão expirada)
  const showErrorToast = (message: string, error: any) => {
    if (error.message !== 'Sessão expirada') {
      toast({
        title: "Erro",
        description: message,
        variant: "destructive",
      });
    }
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
      showErrorToast("Erro ao carregar transações", error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`, { headers });
      const data = await handleResponse(response);
      setCategories(data);
    } catch (error: any) {
      showErrorToast("Erro ao carregar categorias", error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/settings`, { headers });
      const data = await handleResponse(response);
      setMonthlyLimit(data.monthlyLimit);
    } catch (error: any) {
      showErrorToast("Erro ao carregar configurações", error);
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
      showErrorToast("Erro ao adicionar transação", error);
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
      showErrorToast("Erro ao atualizar transação", error);
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
      showErrorToast("Erro ao deletar transação", error);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(category),
      });
      const newCategory = await handleResponse(response);
      setCategories((prev) => [...prev, newCategory]);
      toast({
        title: "Sucesso",
        description: "Categoria adicionada com sucesso",
      });
    } catch (error: any) {
      showErrorToast("Erro ao adicionar categoria", error);
    }
  };

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const categoryToUpdate = categories.find(c => c.id === categoryId);
      if (!categoryToUpdate) return;

      const response = await fetch(
        `${API_URL}/categories/${encodeURIComponent(categoryToUpdate.name)}`,
        {
          method: 'PUT',
          headers,
          body: JSON.stringify(updates),
        }
      );
      const updatedCategory = await handleResponse(response);

      setCategories((prev) =>
        prev.map((c) => (c.id === categoryId ? updatedCategory : c))
      );

      // Atualizar transações se o nome mudou
      if (updates.name && updates.name !== categoryToUpdate.name) {
        setTransactions((prev) =>
          prev.map((t) =>
            t.category === categoryToUpdate.name
              ? { ...t, category: updates.name as string }
              : t
          )
        );
      }

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso",
      });
    } catch (error: any) {
      showErrorToast("Erro ao atualizar categoria", error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const categoryToDelete = categories.find(c => c.id === categoryId);
      if (!categoryToDelete) return;

      const response = await fetch(
        `${API_URL}/categories/${encodeURIComponent(categoryToDelete.name)}`,
        {
          method: 'DELETE',
          headers,
        }
      );
      await handleResponse(response);

      setCategories((prev) => prev.filter((c) => c.id !== categoryId));
      setTransactions((prev) =>
        prev.filter((t) => t.category !== categoryToDelete.name)
      );

      toast({
        title: "Sucesso",
        description: "Categoria deletada com sucesso",
      });
    } catch (error: any) {
      showErrorToast("Erro ao deletar categoria", error);
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
      showErrorToast("Erro ao atualizar limite mensal", error);
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
