export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
  icon: string;  // Nome do ícone lucide-react
  color: string; // Hex color (#RRGGBB)
  description: string;
}

export type CategoryType = 'income' | 'expense' | 'both';
