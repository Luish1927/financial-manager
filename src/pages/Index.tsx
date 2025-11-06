import { useState } from "react";
import { Dashboard } from "@/components/Dashboard";
import { TransactionList } from "@/components/TransactionList";
import { FinancialChart } from "@/components/FinancialChart";
import { AddTransactionDialog } from "@/components/AddTransactionDialog";
import { Transaction } from "@/types/transaction";
import { Wallet } from "lucide-react";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      description: 'Salário',
      amount: 5000,
      category: 'Salário',
      date: '2025-01-05',
    },
    {
      id: '2',
      type: 'expense',
      description: 'Supermercado',
      amount: 350,
      category: 'Alimentação',
      date: '2025-01-08',
    },
    {
      id: '3',
      type: 'expense',
      description: 'Aluguel',
      amount: 1200,
      category: 'Moradia',
      date: '2025-01-10',
    },
  ]);

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions([newTransaction, ...transactions]);
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
            <AddTransactionDialog onAddTransaction={handleAddTransaction} />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Dashboard balance={balance} income={income} expenses={expenses} />
          
          <div className="grid gap-6 lg:grid-cols-2">
            <FinancialChart transactions={transactions} />
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
