import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transaction } from "@/types/transaction";
import { Category } from "@/types/category";
import { CategoriesFilter } from "./CategoriesFilter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDays } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FinancialChartProps {
  transactions: Transaction[];
  categories: Category[];
}

type ViewMode = 'monthly' | 'daily';

export const FinancialChart = ({ transactions, categories }: FinancialChartProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Helper: verifica se uma transação pertence à categoria selecionada
  const matchesCategory = (transaction: Transaction): boolean => {
    return selectedCategory === 'all' || transaction.category === selectedCategory;
  };

  // Helper: calcula o total de receitas de uma lista de transações
  const calculateIncome = (transactions: Transaction[]): number => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Helper: calcula o total de despesas de uma lista de transações
  const calculateExpenses = (transactions: Transaction[]): number => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const currentMonth = new Date().getMonth();
    const relevantMonths = Array.from({ length: 6 }, (_, i) => {
      const monthIndex = (currentMonth - 5 + i + 12) % 12;
      return months[monthIndex];
    });

    return relevantMonths.map((month, index) => {
      const monthIndex = (currentMonth - 5 + index + 12) % 12;
      const monthTransactions = transactions.filter(t => {
        const transactionMonth = new Date(t.date).getMonth();
        return transactionMonth === monthIndex && matchesCategory(t);
      });

      const income = calculateIncome(monthTransactions);
      const expenses = calculateExpenses(monthTransactions);

      return {
        name: month,
        Receitas: income,
        Despesas: expenses,
      };
    });
  };

  const getDailyData = () => {
    const today = new Date();
    const daysToShow = 30;
    const dailyData = [];

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date).toISOString().split('T')[0];
        return transactionDate === dateStr && matchesCategory(t);
      });

      const income = calculateIncome(dayTransactions);
      const expenses = calculateExpenses(dayTransactions);

      dailyData.push({
        name: `${date.getDate()}/${date.getMonth() + 1}`,
        Receitas: income,
        Despesas: expenses,
      });
    }

    return dailyData;
  };

  const data = viewMode === 'monthly' ? getMonthlyData() : getDailyData();

  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader className="flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <CardTitle>
            {viewMode === 'monthly' ? 'Visão Geral Mensal' : 'Visão Geral Diária (Últimos 30 dias)'}
          </CardTitle>
          <CategoriesFilter categories={categories} onFilterChange={handleCategoryChange} />
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('monthly')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Mensal
          </Button>
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('daily')}
            className="flex items-center gap-2"
          >
            <CalendarDays className="h-4 w-4" />
            Diário
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip
                formatter={(value: number, name, props) => {
                  const category = props.payload.category
                    ? ` (${props.payload.category})`
                    : "";
                  return [
                    formatCurrency(value),
                    name + category,
                  ];
                }}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend />
              <Bar
                dataKey="Receitas"
                fill="hsl(var(--success))"
                radius={[8, 8, 0, 0]}
              />
              <Bar
                dataKey="Despesas"
                fill="hsl(var(--destructive))"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">
              Nenhuma transação encontrada.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
