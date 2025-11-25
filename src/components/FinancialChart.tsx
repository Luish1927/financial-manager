import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transaction } from "@/types/transaction";
import { CategoriesFilter } from "./CategoriesFilter";
import { useState } from "react";

interface FinancialChartProps {
  transactions: Transaction[];
  categories: string[];
}

export const FinancialChart = ({ transactions, categories }: FinancialChartProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
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
        const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
        return transactionMonth === monthIndex && categoryMatch;
      });

      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        name: month,
        Receitas: income,
        Despesas: expenses,
      };
    });
  };

  const data = getMonthlyData();

  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visão Geral Mensal</CardTitle>
        <CategoriesFilter categories={categories} onFilterChange={handleCategoryChange} />
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
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(value),
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
