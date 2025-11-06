import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Transaction } from "@/types/transaction";
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";

interface TransactionListProps {
  transactions: Transaction[];
}

export const TransactionList = ({ transactions }: TransactionListProps) => {
  return (
    <Card className="shadow-card bg-gradient-card">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma transação cadastrada ainda.
            </p>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-card transition-shadow"
              >
                <div className="flex items-center gap-4">
                  {transaction.type === 'income' ? (
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
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  className={`font-bold text-lg ${
                    transaction.type === 'income' ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(transaction.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
