import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Wallet, Target, Pencil } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";

interface DashboardProps {
  balance: number;
  income: number;
  expenses: number;
  monthlyLimit: number;
  onUpdateMonthlyLimit: (limit: number) => void;
}

export const Dashboard = ({
  balance,
  income,
  expenses,
  monthlyLimit,
  onUpdateMonthlyLimit
}: DashboardProps) => {
  const [isLimitDialogOpen, setIsLimitDialogOpen] = useState(false);
  const [limitInput, setLimitInput] = useState(monthlyLimit.toString());

  const handleSaveLimit = () => {
    const newLimit = parseFloat(limitInput) || 0;
    onUpdateMonthlyLimit(newLimit);
    setIsLimitDialogOpen(false);
  };

  const remainingBudget = monthlyLimit - expenses;
  const percentageUsed = monthlyLimit > 0 ? (expenses / monthlyLimit) * 100 : 0;
  const isOverBudget = expenses > monthlyLimit && monthlyLimit > 0;
  return (
    <>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-primary shadow-elevated border-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary-foreground/80">
              Saldo Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-primary-foreground/80" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-foreground">
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-success/20 bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Receitas
              </CardTitle>
            </div>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">
              {formatCurrency(income)}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-destructive/20 bg-gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Despesas
              </CardTitle>
            </div>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">
              {formatCurrency(expenses)}
            </div>
          </CardContent>
        </Card>

        <Card className={`shadow-card ${isOverBudget ? 'border-destructive/20' : 'border-primary/20'} bg-gradient-card`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Limite Mensal
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Target className={`h-4 w-4 ${isOverBudget ? 'text-destructive' : 'text-primary'}`} />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setLimitInput(monthlyLimit.toString());
                  setIsLimitDialogOpen(true);
                }}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {monthlyLimit > 0 ? (
              <div className="space-y-2">
                <div className={`text-2xl font-bold ${isOverBudget ? 'text-destructive' : 'text-primary'}`}>
                  {formatCurrency(remainingBudget)}
                </div>
                <div className="space-y-1">
                  <Progress
                    value={Math.min(percentageUsed, 100)}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {percentageUsed.toFixed(0)}% do limite utilizado
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Clique no ícone para definir
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isLimitDialogOpen} onOpenChange={setIsLimitDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir Limite de Gastos Mensal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Valor do Limite (R$)</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Este valor será usado para acompanhar seus gastos mensais
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLimitDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveLimit}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
