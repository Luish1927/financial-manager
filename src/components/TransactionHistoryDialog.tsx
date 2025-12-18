import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Transaction } from "@/types/transaction";
import { formatCurrency } from "@/lib/utils";
import { ArrowDownCircle, ArrowUpCircle, Calendar, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";

interface TransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: Transaction[];
  onUpdateTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const TransactionHistoryDialog = ({
  open,
  onOpenChange,
  transactions,
  onDeleteTransaction,
  onEditTransaction,
}: TransactionHistoryDialogProps) => {
  const [dateFilter, setDateFilter] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [filterMode, setFilterMode] = useState<"day" | "month">("day");

  // Reset filters when opening
  useEffect(() => {
    if (open) {
      // Use local date for "today"
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      setDateFilter(`${year}-${month}-${day}`);
      setFilterMode("day");
    }
  }, [open]);

  const filteredTransactions = transactions.filter((t) => {
    if (filterMode === "day") {
      return t.date === dateFilter;
    } else {
      // Month mode: matches current month/year relative to "Now"
      const now = new Date();
      const currentYear = now.getFullYear().toString();
      const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
      
      const [tYear, tMonth] = t.date.split("-");
      return tYear === currentYear && tMonth === currentMonth;
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Histórico de Transações</DialogTitle>
        </DialogHeader>

        <div className="p-4 border-b bg-muted/30 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="grid w-full items-center gap-1.5">
                    <Label htmlFor="date-filter">Filtrar por dia</Label>
                    <Input
                        id="date-filter"
                        type="date"
                        value={dateFilter}
                        onChange={(e) => {
                            setDateFilter(e.target.value);
                            setFilterMode("day");
                        }}
                        className="bg-background"
                    />
                </div>
                <Button
                    variant={filterMode === "month" ? "default" : "outline"}
                    onClick={() => setFilterMode("month")}
                    className="w-full sm:w-auto whitespace-nowrap"
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    Ver Mês Atual
                </Button>
            </div>
            <div className="text-xs text-muted-foreground">
                Mostrando: {filterMode === "day" ? `Transações de ${new Date(dateFilter).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}` : "Todas as transações do mês atual"}
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-4">
            {filteredTransactions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground gap-2">
                <Calendar className="h-12 w-12 opacity-20" />
                <p>Nenhuma transação encontrada para este período.</p>
              </div>
            ) : (
              filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {transaction.type === "income" ? (
                      <div className="p-2 rounded-full bg-success/10">
                        <ArrowUpCircle className="h-5 w-5 text-success" />
                      </div>
                    ) : (
                      <div className="p-2 rounded-full bg-destructive/10">
                        <ArrowDownCircle className="h-5 w-5 text-destructive" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex gap-2 items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(transaction.date).toLocaleDateString(
                            "pt-BR",
                            { timeZone: "UTC" }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`font-bold text-lg ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            // Close history dialog? Or keep it open?
                            // Usually edit dialog opens on top. 
                            // Since Radix UI Dialogs handle stacking well, we can just open the edit dialog.
                            onEditTransaction(transaction);
                          }}
                        >
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteTransaction(transaction.id)}
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
