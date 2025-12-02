import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TransactionList } from "@/components/TransactionList";
import { FinancialChart } from "@/components/FinancialChart";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { Transaction } from "@/types/transaction";
import { Wallet, Plus, Pencil, LogOut } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { CategoryManagementDialog } from "@/components/CategoryManagementDialog";

const Index = () => {
  const { user, logout } = useAuth();
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    monthlyLimit,
    updateMonthlyLimit,
    loading,
  } = useApi();
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<
    Transaction | undefined
  >(undefined);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const handleOpenAddDialog = () => {
    setEditingTransaction(undefined);
    setIsFormDialogOpen(true);
  };

  const handleOpenEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsFormDialogOpen(true);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    if (transaction.id) {
      updateTransaction(transaction);
    } else {
      addTransaction(transaction);
    }
    setIsFormDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Wallet className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg md:text-2xl font-bold">Gerenciador Financeiro</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Bem-vindo, {user?.name}!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              <Button
                className="shadow-elevated whitespace-nowrap"
                onClick={() => setIsCategoryDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                <Pencil className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Editar Categorias</span>
              </Button>
              <Button
                className="shadow-elevated whitespace-nowrap"
                onClick={handleOpenAddDialog}
                size="sm"
              >
                <Plus className="h-4 w-4 md:mr-2" />
                <span className="hidden sm:inline">Nova Transação</span>
              </Button>
              <Button
                className="shadow-elevated whitespace-nowrap"
                onClick={logout}
                variant="outline"
                size="sm"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <Dashboard
              balance={balance}
              income={income}
              expenses={expenses}
              monthlyLimit={monthlyLimit}
              onUpdateMonthlyLimit={updateMonthlyLimit}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <FinancialChart
                transactions={transactions}
                categories={categories}
              />
              <TransactionList
                transactions={transactions}
                onUpdateTransaction={updateTransaction}
                onDeleteTransaction={deleteTransaction}
                onEditTransaction={handleOpenEditDialog}
              />
            </div>
          </div>
        )}
      </main>

      <TransactionFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        initialTransaction={editingTransaction}
        onSaveTransaction={handleSaveTransaction}
        categories={categories}
      />
      <CategoryManagementDialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        categories={categories}
        addCategory={addCategory}
        updateCategory={updateCategory}
        deleteCategory={deleteCategory}
      />
    </div>
  );
};

export default Index;

