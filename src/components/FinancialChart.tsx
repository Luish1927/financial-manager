import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Transaction } from "@/types/transaction";

interface FinancialChartProps {
  transactions: Transaction[];
}

export const FinancialChart = ({ transactions }: FinancialChartProps) => {
  const getMonthlyData = () => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    const currentMonth = new Date().getMonth();
    const relevantMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);

    return relevantMonths.map((month, index) => {
      const monthIndex = currentMonth - relevantMonths.length + index + 1;
      const monthTransactions = transactions.filter(t => {
        const transactionMonth = new Date(t.date).getMonth();
        return transactionMonth === monthIndex;
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
      <CardHeader>
        <CardTitle>Visão Geral Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="name" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip
              formatter={(value: number) => 
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                }).format(value)
              }
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: 'var(--radius)',
              }}
            />
            <Legend />
            <Bar dataKey="Receitas" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
            <Bar dataKey="Despesas" fill="hsl(var(--destructive))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
