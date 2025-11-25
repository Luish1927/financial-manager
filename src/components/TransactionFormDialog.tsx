import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "@/types/transaction";
import { toast } from "sonner";

interface TransactionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTransaction?: Transaction;
  onSaveTransaction: (transaction: Transaction) => void;
  categories: string[];
}

export const TransactionFormDialog = ({
  open,
  onOpenChange,
  initialTransaction,
  onSaveTransaction,
  categories,
}: TransactionFormDialogProps) => {
  const isEditing = !!initialTransaction;

  const [type, setType] = useState<'income' | 'expense'>(initialTransaction?.type || 'expense');
  const [description, setDescription] = useState(initialTransaction?.description || '');
  const [amount, setAmount] = useState(initialTransaction?.amount.toString() || '');
  const [category, setCategory] = useState(initialTransaction?.category || '');
  const [date, setDate] = useState(initialTransaction?.date || new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (open) {
      setType(initialTransaction?.type || 'expense');
      setDescription(initialTransaction?.description || '');
      setAmount(initialTransaction?.amount.toString() || '');
      setCategory(initialTransaction?.category || '');
      setDate(initialTransaction?.date || new Date().toISOString().split('T')[0]);
    } else {
      setType('expense');
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [open, initialTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description || !amount || !category) {
      toast.error('Por favor, preencha todos os campos');
      return;
    }

    const transactionToSave: Transaction = {
      id: isEditing ? initialTransaction!.id : '',
      type,
      description,
      amount: parseFloat(amount),
      category,
      date,
    };

    onSaveTransaction(transactionToSave);

    toast.success(`${isEditing ? 'Transação atualizada' : (type === 'income' ? 'Receita' : 'Despesa') + ' adicionada'} com sucesso!`);
    onOpenChange(false);
  };

  const categoryOptions = categories.map(cat => ({ value: cat, label: cat }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Edite os detalhes da transação.' : 'Adicione uma nova receita ou despesa ao seu gerenciamento financeiro.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select value={type} onValueChange={(value: 'income' | 'expense') => {
              setType(value);
              setCategory('');
            }}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">Receita</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <Button type="submit" className="w-full">
            {isEditing ? 'Salvar Alterações' : 'Adicionar Transação'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
