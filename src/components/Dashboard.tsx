import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface DashboardProps {
  balance: number;
  income: number;
  expenses: number;
}

export const Dashboard = ({ balance, income, expenses }: DashboardProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-primary shadow-elevated border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-primary-foreground/80">
            Saldo Total
          </CardTitle>
          <Wallet className="h-4 w-4 text-primary-foreground/80" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary-foreground">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(balance)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-success/20 bg-gradient-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Receitas
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-success">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(income)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-card border-destructive/20 bg-gradient-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-destructive">
            {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(expenses)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
