import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TransactionList } from "@/components/TransactionList";
import { FinancialChart } from "@/components/FinancialChart";
import { TransactionFormDialog } from "@/components/TransactionFormDialog";
import { Transaction } from "@/types/transaction";
import { Wallet, Plus, Pencil } from "lucide-react";
import { useTransactions } from "@/hooks/useTransactions";
import { Button } from "@/components/ui/button";
import { CategoryManagementDialog } from "@/components/CategoryManagementDialog";

const Index = () => {
  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useTransactions();
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
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Gerenciador Financeiro</h1>
                <p className="text-sm text-muted-foreground">
                  Controle suas finanças de forma simples
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="shadow-elevated"
                onClick={() => setIsCategoryDialogOpen(true)}
                variant="outline"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar Categorias
              </Button>
              <Button
                className="shadow-elevated"
                onClick={handleOpenAddDialog}
              >
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Dashboard balance={balance} income={income} expenses={expenses} />

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

